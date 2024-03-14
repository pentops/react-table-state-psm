export interface PsmListV1And {
  filters?: PsmListV1Filter[];
}

export interface PsmListV1Field {
  name?: string;
  type?: {
    // start oneOf
    range?: PsmListV1Range;
    value?: string;
    // end oneOf
  };
}

export interface PsmListV1Filter {
  type?: {
    // start oneOf
    and?: PsmListV1And;
    field?: PsmListV1Field;
    or?: PsmListV1Or;
    // end oneOf
  };
}

export interface PsmListV1Or {
  filters?: PsmListV1Filter[];
}

export interface PsmListV1Range {
  max?: string;
  min?: string;
}

export interface PsmListV1Search {
  field?: string;
  value?: string;
}

export interface PsmListV1Sort {
  descending: boolean;
  field?: string;
}

export interface PsmListV1QueryRequest {
  filters?: PsmListV1Filter[];
  searches?: PsmListV1Search[];
  sorts?: PsmListV1Sort[];
}

export type Updater<T> = T | ((old: T) => T)

export type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void
