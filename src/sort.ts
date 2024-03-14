import { useCallback, useMemo, useState } from 'react';
import { OnChangeFn, PsmListV1Sort, Updater } from './types';

export interface ColumnSort {
  desc: boolean;
  id: string;
}

export type SortingState = ColumnSort[];

export function getPSMQuerySortsFromTableState(tableSorts: SortingState | undefined): PsmListV1Sort[] | undefined {
  if (!tableSorts || !tableSorts.length) {
    return undefined;
  }

  return tableSorts.map((sort) => ({
    field: sort.id,
    descending: sort.desc,
  }));
}

export function useTableSort(
  initialSort?: SortingState,
  onSort?: OnChangeFn<SortingState>,
): [SortingState, OnChangeFn<SortingState>, PsmListV1Sort[] | undefined] {
  const [state, setState] = useState<SortingState>(initialSort || []);
  const handleColumnSortChange: OnChangeFn<SortingState> = useCallback(
    (updater: Updater<SortingState>) => {
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
