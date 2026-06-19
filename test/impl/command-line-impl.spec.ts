import { CommandLineImpl } from '../../src/impl/command-line-impl';
import { Command } from '../../src/command-line';

describe('CommandLineImpl', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should parse command line arguments correctly', () => {
    process.argv = ['node', 'index.js', '--port=4000', '--path=./test-models', '--cors=http://localhost:3000'];
    const commandLine = new CommandLineImpl();

    expect(commandLine.getCommand(Command.PORT)).toBe('4000');
    expect(commandLine.getCommand(Command.PATH)).toBe('./test-models');
    expect(commandLine.getCommand(Command.CORS)).toBe('http://localhost:3000');
  });

  it('should handle arguments with quotes', () => {
    process.argv = ['node', 'index.js', '--path="C:/Program Files/Models"', "--cors='*'", '--port=5000'];
    const commandLine = new CommandLineImpl();

    expect(commandLine.getCommand(Command.PATH)).toBe('C:/Program Files/Models');
    expect(commandLine.getCommand(Command.CORS)).toBe('*');
    expect(commandLine.getCommand(Command.PORT)).toBe('5000');
  });

  it('should return undefined for missing commands', () => {
    process.argv = ['node', 'index.js'];
    const commandLine = new CommandLineImpl();

    expect(commandLine.getCommand(Command.PORT)).toBeUndefined();
  });

  it('should return all commands', () => {
    process.argv = ['node', 'index.js', '--port=4000', '--path=./models'];
    const commandLine = new CommandLineImpl();
    const commands = commandLine.getCommands();

    expect(commands.size).toBe(2);
    expect(commands.get(Command.PORT)).toBe('4000');
    expect(commands.get(Command.PATH)).toBe('./models');
  });
});
