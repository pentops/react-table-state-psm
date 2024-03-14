import { useMemo } from 'react';
import { SortingState, useTableSort } from './sort';
import { OnChangeFn, PsmListV1QueryRequest } from './types';
import { SearchState, useTableSearch } from './search';
import { FilterState, useTableFilters } from './filter';

export interface TableStateOptions {
  initialFilters?: FilterState;
  initialSearch?: SearchState;
  initialSort?: SortingState;
  onFilter?: OnChangeFn<FilterState>;
  onSearch?: OnChangeFn<SearchState>;
  onSort?: OnChangeFn<SortingState>;
}

export function useTableState({ initialSearch, initialSort, onSearch, onSort }: TableStateOptions) {
  const [searchValue, setSearchValue, psmSearch] = useTableSearch(initialSearch, onSearch);
  const [filterValues, setFilterValues, psmFilters] = useTableFilters();
  const [sortValues, setSortValues, psmSort] = useTableSort(initialSort, onSort);

  const psmQuery: PsmListV1QueryRequest | undefined = useMemo(() => {
    const base: PsmListV1QueryRequest = {};

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
