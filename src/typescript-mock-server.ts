import express, { Express } from 'express';
import { CommandLineImpl } from './impl/command-line-impl';
import { Command, CommandLine } from './command-line';
import { RegisteredEndpoint } from './models/registered-endpoint';
import { HttpVerb } from './types/http-verbs';
import { Dirent } from 'fs';
import { opendir } from 'fs/promises';
import { LoggerImpl } from './impl/logger-impl';
import { Logger } from './logger';

export class TypescriptMockServer {

  private readonly log: Logger = new LoggerImpl();
  private readonly commandLine: CommandLine = new CommandLineImpl();
  private readonly app: Express;
  private readonly basePath;
  private registeredEndpoints: RegisteredEndpoint[] = [];

  constructor() {
    this.app = express();
    this.basePath = this.getPath();
  }

  private static async loadModule(moduleName: string) {
    return await import(moduleName);
  }

  public start() {
    this.log.info(`basePath: ${this.basePath}`);
    this.readRoutes(this.basePath).catch(error => this.log.error(error));
    const port = this.commandLine.getCommand(Command.PORT) || 3000;
    this.app.listen(port, () => {
      this.log.info(`App is listening on port ${port}!`);
    });
  }

  private async readRoutes(path: string) {
    const dir = await opendir(path);
    for await (const dirent of dir) {
      if (dirent.isDirectory()) {
        await this.readRoutes(`${path}/${dirent.name}`);
      } else {
        this.handleFile(path, dirent);
      }
    }
    this.registeredEndpoints.forEach(endpoint => this.log.info(`${endpoint.httpVerb.toUpperCase()}   http://localhost:${this.commandLine.getCommand(Command.PORT)}${endpoint.endpoint}`));
  }

  private handleFile(path: string, dirent: Dirent) {
    const httpVerb = (dirent.name.indexOf('-') > -1 ? dirent.name.split('-')[0] : dirent.name.split('.')[0]) as HttpVerb;
    this.handleRequest(path, dirent, httpVerb);
  }

  private addEndpoint(endpoint: string, httpVerb: HttpVerb, model: any) {
    this.app[httpVerb](endpoint, (req, res) => res.send(model.data));
  }

  private handleRequest(path: string, dirent: Dirent, httpVerb: HttpVerb) {
    const endpoint = this.convertFileNameToEndpoint(path, dirent, httpVerb);
    const modulePath = `${path}/${dirent.name}`;
    this.registeredEndpoints.push({ httpVerb, endpoint });
    TypescriptMockServer.loadModule(modulePath)
      .then(model => this.addEndpoint(endpoint, httpVerb, model))
      .catch(error => this.log.error(error));
  }

  private convertFileNameToEndpoint(path: string, dirent: Dirent, httpVerb: HttpVerb): string {
    const endpoint = `${path.replace(this.basePath, '')}/${dirent.name}`
      .replace('.ts', '')
      .replace(httpVerb, '')
      .replace('-', '');
    if (endpoint.endsWith('/')) {
      return endpoint.substring(0, endpoint.length - 1);
    }
    return endpoint;
  }

  private getPath(): string {
    if (!this.commandLine.getCommands().has(Command.PATH)) {
      this.log.warn(`Path parameter not set, fallback to default tms-models`);
      return 'tms-models';
    }
    return `${process.cwd()}/${this.commandLine.getCommand(Command.PATH)}`;
  }
}
