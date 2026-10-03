export interface FormState {
  errors?: string[];
  values?: Record<string, string>;
}

export const EMPTY_STATE: FormState = {};
