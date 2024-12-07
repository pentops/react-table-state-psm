import { useMemo } from 'react';
import { type SortingState, useTableSort } from './sort';
import type { ExtractFilterField, ExtractSearchField, ExtractSortField, OnChangeFn, PsmListV1QueryRequest } from './types';
import { type SearchState, useTableSearch } from './search';
import { type FilterState, useTableFilters } from './filter';

export interface TableStateOptions<T extends PsmListV1QueryRequest<ExtractSearchField<T>, ExtractSortField<T>, ExtractFilterField<T>> | undefined> {
  initialFilters?: FilterState<ExtractFilterField<T>>;
  initialSearch?: SearchState<ExtractSearchField<T>>;
  initialSort?: SortingState<ExtractSortField<T>>;
  onFilter?: OnChangeFn<FilterState<ExtractFilterField<T>>>;
  onSearch?: OnChangeFn<SearchState<ExtractSearchField<T>>>;
  onSort?: OnChangeFn<SortingState<ExtractSortField<T>>>;
}

export function useTableState<T extends PsmListV1QueryRequest<ExtractSearchField<T>, ExtractSortField<T>, ExtractFilterField<T>> | undefined>({
  initialFilters,
  initialSearch,
  initialSort,
  onFilter,
  onSearch,
  onSort,
}: TableStateOptions<T>) {
  const [searchValue, setSearchValue, psmSearch] = useTableSearch<ExtractSearchField<T>>(initialSearch, onSearch);
  const [filterValues, setFilterValues, psmFilters] = useTableFilters<ExtractFilterField<T>>(initialFilters, onFilter);
  const [sortValues, setSortValues, psmSort] = useTableSort<ExtractSortField<T>>(initialSort, onSort);

  const psmQuery: T | undefined = useMemo(() => {
    const base = {} as NonNullable<T>;

    if (psmSearch?.length) {
      base.searches = psmSearch;
    }

    if (psmFilters?.length) {
      base.filters = psmFilters;
    }

    if (psmSort?.length) {
      base.sorts = psmSort;
    }

    if (!Object.keys(base).length) {
      return undefined;
    }

    return base;
  }, [psmFilters, psmSearch, psmSort]);

  return {
    searchValue,
    setSearchValue,
    filterValues,
    setFilterValues,
    sortValues,
    setSortValues,
    psmQuery,
  };
}
