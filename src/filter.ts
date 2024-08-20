import { useCallback, useMemo, useState } from 'react';
import { OnChangeFn, PsmListV1Filter, Updater } from './types';

export interface RangeFilter {
  max?: string;
  min?: string;
}

export interface FilterValue<TIdType extends string = string, TValueType extends string = string> {
  id: TIdType;
  value: { exact: TValueType } | { in: TValueType[] } | { range: RangeFilter };
}

export type FilterInclusion = 'and' | 'or';

export interface FilterSet<TFilterField extends string = never> {
  inclusion?: FilterInclusion;
  type?: { filters: FilterValue<TFilterField>[] } | { nested: FilterState<TFilterField> };
}

export type FilterState<TFilterField extends string = never> = FilterSet<TFilterField>[];

export interface EnumFilterOption<TValue extends string = string, TLabel = string> {
  value: TValue;
  label: TLabel;
}

export interface EnumFilterType<TValue extends string = string, TLabel = string> {
  options: EnumFilterOption<TValue, TLabel>[];
}

export interface OneOfFilterOption<TValue extends string = string, TLabel = string> {
  value: TValue;
  label: TLabel;
}

export interface OneOfFilterType<TValue extends string = string, TLabel = string> {
  options: OneOfFilterOption<TValue, TLabel>[];
}

export interface DateFilterType {
  allowTime?: boolean;
}

export type BaseFilterType =
  | { enum: EnumFilterType }
  | { oneOf: OneOfFilterType }
  | { date: DateFilterType }
  | { numeric: {} }
  | { string: {} }
  | { boolean: {} };

export interface BaseTableFilter<TIdType extends string = string, TLabelType = string, TFilterType extends BaseFilterType = BaseFilterType> {
  id: TIdType;
  label: TLabelType;
  type: TFilterType;
}

function buildPSMFieldFilter<TFilterField extends string = never, TValue extends string = string>(
  filterValue: FilterValue<TFilterField, TValue>,
): PsmListV1Filter<TFilterField> | undefined {
  if (!filterValue.value) {
    return;
  }

  if ('in' in filterValue.value) {
    return {
      type: {
        or: {
          filters: filterValue.value.in.map((value) => ({
            type: {
              field: {
                name: filterValue.id,
                type: {
                  value,
                },
              },
            },
          })),
        },
      },
    };
  }

  if ('range' in filterValue.value) {
    return {
      type: {
        field: {
          name: filterValue.id,
          type: {
            range: filterValue.value.range,
          },
        },
      },
    };
  }

  if ('exact' in filterValue.value) {
    return {
      type: {
        field: {
          name: filterValue.id,
          type: {
            value: filterValue.value.exact,
          },
        },
      },
    };
  }

  return;
}

function buildPSMFilterFromFilterSet<TFilterField extends string = never>(
  filterSet: FilterSet<TFilterField>,
): PsmListV1Filter<TFilterField> | PsmListV1Filter<TFilterField>[] | undefined {
  if (!filterSet.type) {
    return;
  }

  if ('filters' in filterSet.type) {
    return filterSet.type.filters.reduce<PsmListV1Filter<TFilterField>[]>((accum, curr) => {
      const filter = buildPSMFieldFilter<TFilterField>(curr);

      if (filter) {
        accum.push(filter);
      }

      return accum;
    }, []);
  }

  if ('nested' in filterSet.type) {
    const subFilters = filterSet.type.nested.map(buildPSMFilterFromFilterSet).filter(Boolean) as PsmListV1Filter<TFilterField>[];

    switch (filterSet.inclusion) {
      case 'or':
        return {
          type: {
            or: {
              filters: subFilters,
            },
          },
        };
      default:
      case 'and':
        return {
          type: {
            and: {
              filters: subFilters,
            },
          },
        };
    }
  }
}

export function getPSMQueryFiltersFromTableState<TFilterField extends string = never>(
  filters: FilterState<TFilterField>,
): PsmListV1Filter<TFilterField>[] | undefined {
  const filterGroupCount = Object.keys(filters).length;

  if (!filters || !filterGroupCount) {
    return undefined;
  }

  const psmFilters: PsmListV1Filter<TFilterField>[] = filters
    .flatMap((i) => buildPSMFilterFromFilterSet<TFilterField>(i))
    .filter(Boolean) as PsmListV1Filter<TFilterField>[];

  return psmFilters.length ? psmFilters : undefined;
}

export function useTableFilters<TFilterField extends string = never>(
  initialFilters?: FilterState<TFilterField>,
  onFilter?: OnChangeFn<FilterState<TFilterField>>,
): [FilterState<TFilterField>, OnChangeFn<FilterState<TFilterField>>, PsmListV1Filter<TFilterField>[] | undefined] {
  const [state, setState] = useState<FilterState<TFilterField>>(initialFilters || []);
  const handleColumnFilterChange: OnChangeFn<FilterState<TFilterField>> = useCallback(
    (updater: Updater<FilterState<TFilterField>>) => {
      const result = typeof updater === 'function' ? updater(state) : updater;
      setState(result);

      if (onFilter) {
        onFilter(result);
      }

      return result;
    },
    [state, onFilter],
  );

  return useMemo(() => [state, handleColumnFilterChange, getPSMQueryFiltersFromTableState(state)], [state, handleColumnFilterChange]);
}
