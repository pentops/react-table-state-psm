export interface PsmListV1And<TFilterField extends string = never> {
  filters?: PsmListV1Filter<TFilterField>[];
}

export interface PsmListV1Field<TFilterField extends string = never> {
  name?: TFilterField;
  type?: {
    // start oneOf
    range?: PsmListV1Range;
    value?: string;
    // end oneOf
  };
}

export interface PsmListV1Filter<TFilterField extends string = never> {
  type?: {
    // start oneOf
    and?: PsmListV1And<TFilterField>;
    field?: PsmListV1Field<TFilterField>;
    or?: PsmListV1Or<TFilterField>;
    // end oneOf
  };
}

export interface PsmListV1Or<TFilterField extends string = never> {
  filters?: PsmListV1Filter<TFilterField>[];
}

export interface PsmListV1Range {
  max?: string;
  min?: string;
}

export interface PsmListV1Search<TSearchField extends string = never> {
  field?: TSearchField;
  value?: string;
}

export interface PsmListV1Sort<TSortField extends string = never> {
  descending: boolean;
  field?: TSortField;
}

export interface PsmListV1QueryRequest<TSearchField extends string = never, TSortField extends string = never, TFilterField extends string = never> {
  filters?: PsmListV1Filter<TFilterField>[];
  searches?: PsmListV1Search<TSearchField>[];
  sorts?: PsmListV1Sort<TSortField>[];
}

export type Updater<T> = T | ((old: T) => T);

export type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void;
