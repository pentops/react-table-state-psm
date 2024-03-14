import { useCallback, useMemo, useState } from 'react';
import { OnChangeFn, PsmListV1Search, Updater } from './types';

export interface ColumnSearch {
  id: string;
  value: string;
}

export type SearchState = ColumnSearch[];

export function getPSMQuerySearchesFromTableState(search: SearchState | undefined): PsmListV1Search[] | undefined {
  if (!search?.length) {
    return undefined;
  }

  return search.map((s) => ({
    field: s.id,
    value: s.value,
  }));
}

export function useTableSearch(
  initialSearch?: SearchState,
  onSearch?: OnChangeFn<SearchState>,
): [SearchState, OnChangeFn<SearchState>, PsmListV1Search[] | undefined] {
  const [state, setState] = useState<SearchState>(initialSearch || []);
  const handleSearchChange: OnChangeFn<SearchState> = useCallback(
    (updater: Updater<SearchState>) => {
      const result = typeof updater === 'function' ? updater(state) : updater;
      setState(result);

      if (onSearch) {
        onSearch(result);
      }

      return result;
    },
    [state, onSearch],
  );

  return useMemo(() => [state, handleSearchChange, getPSMQuerySearchesFromTableState(state)], [state, handleSearchChange]);
}
