import { useMemo } from 'react';
import { SortingState, useTableSort } from './sort';
import { OnChangeFn, PsmListV1QueryRequest } from './types';
import { SearchState, useTableSearch } from './search';
import { FilterState, useTableFilters } from './filter';

// Extract generic types from PsmListV1QueryRequest
type ExtractSearchField<T> = T extends PsmListV1QueryRequest<infer TSearchField, any, any> ? TSearchField : never;
type ExtractSortField<T> = T extends PsmListV1QueryRequest<any, infer TSortField, any> ? TSortField : never;
type ExtractFilterField<T> = T extends PsmListV1QueryRequest<any, any, infer TFilterField> ? TFilterField : never;

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
