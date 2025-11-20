import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import { CommandLineImpl } from './command-line-impl';
import { Command, CommandLine } from '../command-line';
import { RegisteredEndpoint } from '../models/registered-endpoint';
import { HttpVerb } from '../types/http-verbs';
import { Dirent } from 'fs';
import { opendir } from 'fs/promises';
import { LoggerImpl } from './logger-impl';
import { Logger } from '../logger';
import { TypescriptMockServer } from '../typescript-mock-server';
import { Interval } from '../models/config';

export class TypescriptMockServerImpl implements TypescriptMockServer{

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

  public async start() {
    this.log.info(`basePath: ${this.basePath}`);
    await this.readRoutes(this.basePath).catch(error => this.log.error(error));
    const port = this.commandLine.getCommand(Command.PORT) || 3000;
    const corsSetting: CorsOptions = {
      origin: this.commandLine.getCommand(Command.CORS) || '*'
    };

    this.app.use(cors(corsSetting))
    this.app.listen(port, () => {
      this.log.info(`App is listening on port ${port}!`);
    });

    // add started endpoint
    this.addEndpoint('state', 'get', { data: "{\"status\": \"started\"}" });
    this.log.info(`Started mock server on port ${this.commandLine.getCommand(Command.PORT)}`);
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
    this.registeredEndpoints = [];
  }

  private handleFile(path: string, dirent: Dirent) {
    const httpVerb = (dirent.name.indexOf('-') > -1 ? dirent.name.split('-')[0] : dirent.name.split('.')[0]) as HttpVerb;
    this.handleRequest(path, dirent, httpVerb);
  }

  private addEndpoint(endpoint: string, httpVerb: HttpVerb, model: any) {
    this.app[httpVerb](endpoint, (req, res) => {
      if (model?.config?.statusCode) {
        res.statusCode = model?.config?.statusCode;
      }
      if (model?.config?.delay) {
        setTimeout(() => res.send(model.data), this.getDelayValue(model?.config?.delay));
      } else {
        return res.send(model.data);
      }
    });
  }

  private getDelayValue(delay: number | Interval): number {
    if (typeof delay === 'number') {
      return delay;
    } else if (delay.min && delay.max) {
      return Math.floor(delay.min + Math.random() * delay.max);
    }
    return 0;
  }

  private handleRequest(path: string, dirent: Dirent, httpVerb: HttpVerb) {
    const endpoint = this.convertFileNameToEndpoint(path, dirent, httpVerb);
    const modulePath = `${path}/${dirent.name}`;
    this.registeredEndpoints.push({ httpVerb, endpoint });
    TypescriptMockServerImpl.loadModule(modulePath)
      .then(model => this.addEndpoint(endpoint, httpVerb, model))
      .catch(error => this.log.error(error));
  }

  private convertFileNameToEndpoint(path: string, dirent: Dirent, httpVerb: HttpVerb): string {
    const endpoint = `${path.replace(this.basePath, '')}/${dirent.name}`
      .replace('.ts', '')
      .replace(`${httpVerb}-`, '')
      .replace(httpVerb, '');

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
    return this.commandLine.getCommand(Command.PATH)!!;
  }
}
