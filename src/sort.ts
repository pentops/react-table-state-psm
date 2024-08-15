import { useCallback, useMemo, useState } from 'react';
import { OnChangeFn, PsmListV1Sort, Updater } from './types';

export interface ColumnSort<TIdType extends string = string> {
  id: TIdType;
  desc: boolean;
}

export type SortingState<TSortField extends string = never> = ColumnSort<TSortField>[];

export function getPSMQuerySortsFromTableState<TSortField extends string = never>(
  tableSorts: SortingState<TSortField> | undefined,
): PsmListV1Sort<TSortField>[] | undefined {
  if (!tableSorts || !tableSorts.length) {
    return undefined;
  }

  return tableSorts.map((sort) => ({
    field: sort.id,
    descending: sort.desc,
  }));
}

export interface BaseTableSort<TIdType extends string = string, TLabelType = string, TSortOptions extends object = {}> {
  id: TIdType;
  label: TLabelType;
  defaultDescending?: boolean;
  options?: TSortOptions;
}

export function useTableSort<TSortField extends string = never>(
  initialSort?: SortingState<TSortField>,
  onSort?: OnChangeFn<SortingState<TSortField>>,
): [SortingState<TSortField>, OnChangeFn<SortingState<TSortField>>, PsmListV1Sort<TSortField>[] | undefined] {
  const [state, setState] = useState<SortingState<TSortField>>(initialSort || []);
  const handleColumnSortChange: OnChangeFn<SortingState<TSortField>> = useCallback(
    (updater: Updater<SortingState<TSortField>>) => {
      const result = typeof updater === 'function' ? updater(state) : updater;
      setState(result);

      if (onSort) {
        onSort(result);
      }

      return result;
    },
    [state, onSort],
  );

  return useMemo(() => [state, handleColumnSortChange, getPSMQuerySortsFromTableState(state)], [state, handleColumnSortChange]);
}
