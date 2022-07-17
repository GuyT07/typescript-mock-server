export interface CommandLine {
  getCommands(): Map<Command, string>;

  getCommand(command: Command): string | undefined;
}

export enum Command {
  PATH = 'path',
  PORT = 'port'
}
