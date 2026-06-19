import request from 'supertest';
import express, { Express } from 'express';
import { TypescriptMockServerImpl } from '../../src/impl/typescript-mock-server-impl';
import * as fsPromises from 'fs/promises';
import { Command } from '../../src/command-line';
import path from 'path';

jest.mock('fs/promises');

describe('TypescriptMockServerImpl', () => {
  let server: TypescriptMockServerImpl;
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    // Spy on listen to prevent it from actually starting
    jest.spyOn(app, 'listen').mockImplementation((port: any, callback: any) => {
      if (callback) callback();
      return {} as any;
    });
    // Reset process.argv
    process.argv = ['node', 'index.js'];
  });

  it('should start and have the state endpoint', async () => {
    (fsPromises.opendir as jest.Mock).mockResolvedValue(async function* () {
       // yield nothing
    }());

    server = new TypescriptMockServerImpl(app);
    await server.start();

    const response = await request(app).get('/state');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'started' });
  });

  it('should have the state endpoint even if other routes are loaded', async () => {
    (fsPromises.opendir as jest.Mock).mockResolvedValue(async function* () {
       // yield nothing
    }());

    server = new TypescriptMockServerImpl(app);
    await server.start();

    const response = await request(app).get('/state');
    expect(response.status).toBe(200);
  });

  it('should load routes from directory', async () => {
    const mockFiles = [
      { name: 'get-test.ts', isDirectory: () => false },
      { name: 'post-data.ts', isDirectory: () => false }
    ];

    (fsPromises.opendir as jest.Mock).mockResolvedValue(async function* () {
      for (const file of mockFiles) {
        yield file;
      }
    }());

    // Mock loadModule
    const loadModuleSpy = jest.spyOn(TypescriptMockServerImpl as any, 'loadModule');
    loadModuleSpy.mockImplementation(async (...args: any[]) => {
      const path = args[0] as string;
      if (path.includes('get-test')) {
        return { data: { message: 'get success' } };
      }
      if (path.includes('post-data')) {
        return { data: { message: 'post success' } };
      }
      return {};
    });

    server = new TypescriptMockServerImpl(app);
    await server.start();

    const getResponse = await request(app).get('/test');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({ message: 'get success' });

    const postResponse = await request(app).post('/data');
    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({ message: 'post success' });
  });

  it('should handle status codes and delay from config', async () => {
    const mockFiles = [
      { name: 'get-config.ts', isDirectory: () => false }
    ];

    (fsPromises.opendir as jest.Mock).mockResolvedValue(async function* () {
      yield mockFiles[0];
    }());

    const loadModuleSpy = jest.spyOn(TypescriptMockServerImpl as any, 'loadModule');
    loadModuleSpy.mockImplementation(async () => {
      return { 
        data: { message: 'custom' },
        config: { statusCode: 201, delay: 10 }
      } as any;
    });

    server = new TypescriptMockServerImpl(app);
    await server.start();

    const response = await request(app).get('/config');
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'custom' });
  });

  it('should resolve absolute paths correctly', async () => {
    (fsPromises.opendir as jest.Mock).mockResolvedValue(async function* () {
       // yield nothing
    }());

    const absolutePath = path.resolve('/absolute/path/to/models');
    process.argv = ['node', 'index.js', `--path=${absolutePath}`];

    server = new TypescriptMockServerImpl(app);
    // @ts-ignore
    expect(server.basePath).toBe(absolutePath);
  });

  it('should resolve relative paths from process.cwd()', async () => {
    (fsPromises.opendir as jest.Mock).mockResolvedValue(async function* () {
       // yield nothing
    }());

    const relativePath = 'custom-models';
    process.argv = ['node', 'index.js', `--path=${relativePath}`];

    server = new TypescriptMockServerImpl(app);
    // @ts-ignore
    expect(server.basePath).toBe(path.join(process.cwd(), relativePath));
  });

  it('should use custom default path from config', async () => {
    (fsPromises.opendir as jest.Mock).mockResolvedValue(async function* () {
      // yield nothing
    }());

    const customDefault = 'my-custom-models';
    server = new TypescriptMockServerImpl({ path: customDefault, app });
    // @ts-ignore
    expect(server.basePath).toBe(path.join(process.cwd(), customDefault));
  });
});
