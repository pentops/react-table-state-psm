import { useMemo } from 'react';
import { SortingState, useTableSort } from './sort';
import { OnChangeFn, PsmListV1QueryRequest } from './types';
import { SearchState, useTableSearch } from './search';
import { FilterState, useTableFilters } from './filter';

export interface TableStateOptions<TSearchField extends string = never, TSortField extends string = never, TFilterField extends string = never> {
  initialFilters?: FilterState<TFilterField>;
  initialSearch?: SearchState<TSearchField>;
  initialSort?: SortingState<TSortField>;
  onFilter?: OnChangeFn<FilterState<TFilterField>>;
  onSearch?: OnChangeFn<SearchState<TSearchField>>;
  onSort?: OnChangeFn<SortingState<TSortField>>;
}

export function useTableState<TSearchField extends string = never, TSortField extends string = never, TFilterField extends string = never>({
  initialFilters,
  initialSearch,
  initialSort,
  onFilter,
  onSearch,
  onSort,
}: TableStateOptions<TSearchField, TSortField, TFilterField>) {
  const [searchValue, setSearchValue, psmSearch] = useTableSearch(initialSearch, onSearch);
  const [filterValues, setFilterValues, psmFilters] = useTableFilters(initialFilters, onFilter);
  const [sortValues, setSortValues, psmSort] = useTableSort(initialSort, onSort);

  const psmQuery: PsmListV1QueryRequest<TSearchField, TSortField, TFilterField> | undefined = useMemo(() => {
    const base: PsmListV1QueryRequest<TSearchField, TSortField, TFilterField> = {};

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
