import { Logger as LoggerInterface } from '../logger';
import { Logger } from 'tslog';

export class LoggerImpl implements LoggerInterface {

  private readonly log: Logger;

  constructor() {
    this.log = new Logger({ignoreStackLevels: 4, displayFunctionName: false});
  }

  private static getArgumentsToPass(args: unknown[]): unknown | unknown[] {
    return LoggerImpl.getNumberOfArguments(args) === 1 ? args[0] : args;
  }

  private static getNumberOfArguments(args: unknown[]): number {
    return args.length;
  }

  debug(...args: unknown[]): void {
    this.log.debug(LoggerImpl.getArgumentsToPass(args));
  }

  error(...args: unknown[]): void {
    this.log.error(LoggerImpl.getArgumentsToPass(args));
  }

  trace(...args: unknown[]): void {
    this.log.trace(LoggerImpl.getArgumentsToPass(args));
  }

  warn(...args: unknown[]): void {
    this.log.warn(LoggerImpl.getArgumentsToPass(args));
  }

  info(...args: unknown[]): void {
    this.log.info(LoggerImpl.getArgumentsToPass(args));
  }
}
