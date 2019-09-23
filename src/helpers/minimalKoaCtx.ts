export interface IMinimalKoaCtx<THeaderValue = string, TQueryValue = string, TState = Record<string, unknown>> {
    headers?: Record<string, THeaderValue>;
    query?: Record<string, TQueryValue>;
    state: TState;
}