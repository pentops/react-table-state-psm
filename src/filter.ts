import { useCallback, useMemo, useState } from 'react';
import { OnChangeFn, PsmListV1Filter, Updater } from './types';

export interface RangeFilter {
  max?: string;
  min?: string;
}

export interface FilterValue {
  id: string;
  value: { exact: string } | { in: string[] } | { range: RangeFilter };
}

export type FilterInclusion = 'and' | 'or';

export interface FilterSet {
  inclusion?: FilterInclusion;
  type?: { filters: FilterValue[] } | { nested: FilterState };
}

export type FilterState = FilterSet[];

function buildPSMFieldFilter(filterValue: FilterValue): PsmListV1Filter | undefined {
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

function buildPSMFilterFromFilterSet(filterSet: FilterSet): PsmListV1Filter | PsmListV1Filter[] | undefined {
  if (!filterSet.type) {
    return;
  }

  if ('filters' in filterSet.type) {
    return filterSet.type.filters.reduce<PsmListV1Filter[]>((accum, curr) => {
      const filter = buildPSMFieldFilter(curr);

      if (filter) {
        accum.push(filter);
      }

      return accum;
    }, []);
  }

  if ('nested' in filterSet.type) {
    const subFilters = filterSet.type.nested.map(buildPSMFilterFromFilterSet).filter(Boolean) as PsmListV1Filter[];

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

export function getPSMQueryFiltersFromTableState(filters: FilterState): PsmListV1Filter[] | undefined {
  const filterGroupCount = Object.keys(filters).length;

  if (!filters || !filterGroupCount) {
    return undefined;
  }

  const psmFilters: PsmListV1Filter[] = filters.map(buildPSMFilterFromFilterSet).filter(Boolean) as PsmListV1Filter[];

  return psmFilters.length ? psmFilters : undefined;
}

export function useTableFilters(
  initialFilters?: FilterState,
  onFilter?: OnChangeFn<FilterState>,
): [FilterState, OnChangeFn<FilterState>, PsmListV1Filter[] | undefined] {
  const [state, setState] = useState<FilterState>(initialFilters || []);
  const handleColumnFilterChange: OnChangeFn<FilterState> = useCallback(
    (updater: Updater<FilterState>) => {
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
