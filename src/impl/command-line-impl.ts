import { Command, CommandLine } from '../command-line';
import { Logger } from '../logger';
import { LoggerImpl } from './logger-impl';

export class CommandLineImpl implements CommandLine {

  private arguments: Map<Command, string> = new Map<Command, string>();
  private log: Logger = new LoggerImpl();

  constructor() {
    this.parseCommandLineArguments();
  }

  getCommands(): Map<Command, string> {
    return this.arguments;
  }

  getCommand(command: Command): string | undefined {
    return this.arguments.get(command);
  }

  private parseCommandLineArguments(): void {
    process.argv.slice(2).map((element) => {
      const matches = element.match('--([a-zA-Z0-9]+)=(.*)');
      if (matches) {
        const value = matches[2].replace(/^['"]/, '').replace(/['"]$/, '');
        this.arguments.set(matches[1] as Command, value);
      }
    });

    this.log.debug(`Passed arguments ${[...this.arguments.keys()].join(',')}`);
  }
}
