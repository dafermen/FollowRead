export interface ValidationSuccess<Value> {
  readonly success: true;
  readonly value: Value;
}

export interface ValidationFailure {
  readonly success: false;
  readonly issues: readonly string[];
}

export type ValidationResult<Value> = ValidationSuccess<Value> | ValidationFailure;
