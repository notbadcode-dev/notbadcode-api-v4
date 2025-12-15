export type ErrorOn<TValue, TError = string> = { isError: false; value: TValue } | { isError: true; errorMessage: TError };

export class ErrorOnFactory {
  static success<T>(value: T): ErrorOn<T> {
    return { isError: false, value };
  }

  static error<TError = string>(errorMessage: TError): ErrorOn<never, TError> {
    return { isError: true, errorMessage };
  }
}
