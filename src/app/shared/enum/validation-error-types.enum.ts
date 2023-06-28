export enum ValidationErrorTypesEnum {
  required = "required",
  pattern = "pattern",
}

export type ValidationErrorType = {
  required?: string,
  pattern?: string
} | null;
