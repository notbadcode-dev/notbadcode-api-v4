export function safeObjectContaining<T>(obj: T): T {
  return expect.objectContaining<T>(obj) as unknown as T;
}
