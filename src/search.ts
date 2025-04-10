import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OnChangeFn, PsmListV1Search, Updater } from './types';

export interface ColumnSearch<TIdType extends string = string> {
  id: TIdType;
  value: string;
}

export type SearchState<TSearchField extends string = never> = ColumnSearch<TSearchField>[];

export function getPSMQuerySearchesFromTableState<TSearchField extends string = never>(
  search: SearchState<TSearchField> | undefined,
): PsmListV1Search<TSearchField>[] | undefined {
  const nonEmptySearches = search?.filter((s) => s.value.length > 0);

  if (!nonEmptySearches?.length) {
    return undefined;
  }

  return nonEmptySearches.map((s) => ({
    field: s.id,
    value: s.value,
  }));
}

export interface BaseTableSearch<TIdType extends string = string, TLabelType = string> {
  id: TIdType;
  label: TLabelType;
}

export function useTableSearch<TSearchField extends string = never>(
  initialSearch?: SearchState<TSearchField>,
  fixedSearch?: SearchState<TSearchField>,
  onSearch?: OnChangeFn<SearchState<TSearchField>>,
): [SearchState<TSearchField>, OnChangeFn<SearchState<TSearchField>>, PsmListV1Search<TSearchField>[] | undefined] {
  const hasUpdatedRef = useRef(false);
  const [state, setState] = useState<SearchState<TSearchField>>(initialSearch || []);
  const handleSearchChange: OnChangeFn<SearchState<TSearchField>> = useCallback((updater: Updater<SearchState<TSearchField>>) => {
    hasUpdatedRef.current = true;
    setState((prevState) => (typeof updater === 'function' ? updater(prevState) : updater));
  }, []);

  useEffect(() => {
    if (hasUpdatedRef.current && onSearch) {
      onSearch(state);
    }
  }, [state]);

  return useMemo(
    () => [state, handleSearchChange, getPSMQuerySearchesFromTableState([...(state || []), ...(fixedSearch || [])])],
    [state, fixedSearch, handleSearchChange],
  );
}
