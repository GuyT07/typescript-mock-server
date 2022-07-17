export interface Logger {
  debug(...args: unknown[]): void;
  trace(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  info(...args: unknown[]): void
}
