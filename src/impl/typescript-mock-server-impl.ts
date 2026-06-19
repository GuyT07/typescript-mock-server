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
import { Interval, ServerConfig } from '../models/config';
import path from 'path';

export class TypescriptMockServerImpl implements TypescriptMockServer{

  private readonly log: Logger = new LoggerImpl();
  private readonly commandLine: CommandLine = new CommandLineImpl();
  private readonly app: Express;
  private readonly basePath;
  private registeredEndpoints: RegisteredEndpoint[] = [];

  constructor(config?: ServerConfig | Express) {
    if (config && 'use' in (config as any)) {
      this.app = config as Express;
      this.basePath = this.getPath();
    } else {
      const serverConfig = config as ServerConfig;
      this.app = serverConfig?.app || express();
      this.basePath = this.getPath(serverConfig?.path);
    }
  }

  private static async loadModule(moduleName: string) {
    return await import(moduleName);
  }

  public async start() {
    this.log.info(`basePath: ${this.basePath}`);
    const port = this.commandLine.getCommand(Command.PORT) || 3000;
    const corsSetting: CorsOptions = {
      origin: this.commandLine.getCommand(Command.CORS) || '*'
    };

    this.app.use(cors(corsSetting))
    // add started endpoint
    this.addEndpoint('state', 'get', { data: { status: 'started' } });
    
    await this.readRoutes(this.basePath).catch(error => this.log.error(error));
    this.app.listen(port, () => {
      this.log.info(`App is listening on port ${port}!`);
    });

    this.log.info(`Started mock server on port ${port}`);
  }

  private async readRoutes(dirPath: string) {
    const dir = await opendir(dirPath);
    for await (const dirent of dir) {
      if (dirent.isDirectory()) {
        await this.readRoutes(`${dirPath}/${dirent.name}`);
      } else {
        await this.handleFile(dirPath, dirent);
      }
    }
    const port = this.commandLine.getCommand(Command.PORT) || 3000;
    this.registeredEndpoints.forEach(endpoint => this.log.info(`${endpoint.httpVerb.toUpperCase()}   http://localhost:${port}${endpoint.endpoint}`));
    this.registeredEndpoints = [];
  }

  private async handleFile(dirPath: string, dirent: Dirent) {
    const httpVerb = (dirent.name.indexOf('-') > -1 ? dirent.name.split('-')[0] : dirent.name.split('.')[0]) as HttpVerb;
    await this.handleRequest(dirPath, dirent, httpVerb);
  }

  private addEndpoint(endpoint: string, httpVerb: HttpVerb, model: any) {
    const route = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    this.app[httpVerb](route, (req, res) => {
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

  private async handleRequest(dirPath: string, dirent: Dirent, httpVerb: HttpVerb) {
    const endpoint = this.convertFileNameToEndpoint(dirPath, dirent, httpVerb);
    let modulePath = `${dirPath}/${dirent.name}`;
    this.registeredEndpoints.push({ httpVerb, endpoint });

    if (__filename.endsWith('.js')) {
      const distPath = path.join(process.cwd(), 'dist');
      if (modulePath.startsWith(process.cwd()) && !modulePath.startsWith(distPath)) {
        modulePath = modulePath.replace(process.cwd(), distPath);
      }
      if (modulePath.endsWith('.ts')) {
        modulePath = modulePath.replace(/\.ts$/, '.js');
      }
    }

    await TypescriptMockServerImpl.loadModule(modulePath)
      .then(model => this.addEndpoint(endpoint, httpVerb, model))
      .catch(error => this.log.error(error));
  }

  private convertFileNameToEndpoint(dirPath: string, dirent: Dirent, httpVerb: HttpVerb): string {
    const endpoint = `${dirPath.replace(this.basePath, '')}/${dirent.name}`
      .replace('.ts', '')
      .replace(`${httpVerb}-`, '')
      .replace(httpVerb, '');

    if (endpoint.endsWith('/')) {
      return endpoint.substring(0, endpoint.length - 1);
    }
    return endpoint;
  }

  private getPath(defaultPath: string = 'tms-models'): string {
    let definedPath = defaultPath;
    if (!this.commandLine.getCommands().has(Command.PATH)) {
      this.log.warn(`Path parameter not set, fallback to default ${defaultPath}`);
    } else {
      definedPath = this.commandLine.getCommand(Command.PATH)!!;
    }

    if (path.isAbsolute(definedPath)) {
      return definedPath;
    }
    return path.join(process.cwd(), definedPath);
  }
}
