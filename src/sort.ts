import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OnChangeFn, PsmListV1Sort, Updater } from './types';

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
  fixedSorts?: SortingState<TSortField>,
  onSort?: OnChangeFn<SortingState<TSortField>>,
): [SortingState<TSortField>, OnChangeFn<SortingState<TSortField>>, PsmListV1Sort<TSortField>[] | undefined] {
  const hasUpdatedRef = useRef(false);
  const [state, setState] = useState<SortingState<TSortField>>(initialSort || []);
  const handleColumnSortChange: OnChangeFn<SortingState<TSortField>> = useCallback((updater: Updater<SortingState<TSortField>>) => {
    hasUpdatedRef.current = true;
    setState((prevState) => (typeof updater === 'function' ? updater(prevState) : updater));
  }, []);

  useEffect(() => {
    if (hasUpdatedRef.current && onSort) {
      onSort(state);
    }
  }, [state]);

  return useMemo(
    () => [state, handleColumnSortChange, getPSMQuerySortsFromTableState([...(state || []), ...(fixedSorts || [])])],
    [state, fixedSorts, handleColumnSortChange],
  );
}
