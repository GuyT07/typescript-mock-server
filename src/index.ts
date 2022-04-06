#!./node_modules/.bin/ts-node-dev

import express, { Express } from 'express';
import * as fs from 'fs';

type HttpVerb = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

const argv: { [key: string]: string } = (() => {
  const args = {};
  process.argv.slice(2).map((element) => {
    const matches = element.match('--([a-zA-Z0-9]+)=(.*)');
    if (matches) {
      // @ts-ignore
      args[matches[1]] = matches[2]
        .replace(/^['"]/, '').replace(/['"]$/, '');
    }
  });
  return args;
})();

console.log(`Passed arguments %o`, argv);

// Create a new express app instance
const app: Express = express();

const { path, port } = argv;

const basePath = `${path}`;

interface RegisteredEndpoint {
  httpVerb: string;
  endpoint: string;
}

const registeredEndpoints: RegisteredEndpoint[] = [];

console.log('basePath:' + basePath);

async function readRoutes(path: string) {
  const dir = await fs.promises.opendir(path);
  for await (const dirent of dir) {
    if (dirent.isDirectory()) {
      await readRoutes(`${path}/${dirent.name}`);
    } else {
      handleFile(path, dirent);
    }
  }
  registeredEndpoints.forEach(endpoint => console.log(`${endpoint.httpVerb.toUpperCase()}   http://localhost:${port}${endpoint.endpoint}`))
}

readRoutes(basePath).catch(console.error);

app.listen(port || 3000, function() {
  console.log(`App is listening on port ${port || 3000}!`);
});

async function loadModule(moduleName: string) {
  return await import(moduleName);
}

function handleFile(path: string, dirent: fs.Dirent) {
  const httpVerb = (dirent.name.indexOf('-') > -1 ? dirent.name.split('-')[0] : dirent.name.split('.')[0]) as HttpVerb;
  handleRequest(path, dirent, httpVerb);
}

function addEndpoint(endpoint: string, httpVerb: HttpVerb, model: any) {
  app[httpVerb](endpoint, (req, res) => res.send(model.data));
}

function handleRequest(path: string, dirent: fs.Dirent, httpVerb: HttpVerb) {
  const endpoint = convertFileNameToEndpoint(path, dirent, httpVerb);
  const modulePath = `${path}/${dirent.name}`;
  registeredEndpoints.push({httpVerb, endpoint});
  loadModule(modulePath)
    .then(model => addEndpoint(endpoint, httpVerb, model))
    .catch(err => console.error(err));
}

function convertFileNameToEndpoint(path: string, dirent: fs.Dirent, httpVerb: HttpVerb): string {
  const endpoint = `${path.replace(basePath, '')}/${dirent.name}`
    .replace('.ts', '')
    .replace(httpVerb, '')
    .replace('-', '');
  if (endpoint.endsWith('/')) {
    return endpoint.substring(0, endpoint.length - 1);
  }
  return endpoint;
}
