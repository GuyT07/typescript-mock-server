#!./node_modules/.bin/ts-node-dev

import express, { Express } from 'express';
import * as fs from 'fs';

const baseDirPath = process.cwd();
console.log(baseDirPath);

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

console.log(argv);

// Create a new express app instance
const app: Express = express();

const {path, port} = argv;

// @ts-ignore
const basePath = `${baseDirPath}/${path}`;

console.log('basePath:' + basePath);

async function print(path: string) {
  console.log(path);
  const dir = await fs.promises.opendir(path);
  for await (const dirent of dir) {
    if (dirent.isDirectory()) {
      await print(`${path}/${dirent.name}`);
    } else {
      handleFile(path, dirent);
    }
  }
}

print(basePath).catch(console.error);

async function loadModule(moduleName: string) {
  return await import(moduleName);
}

app.listen(port || 3000, function() {
  console.log(`App is listening on port ${port || 3000}!`);
});

function handleFile(path: string, dirent: fs.Dirent) {
  console.log('File name: ' + dirent.name);
  if (dirent.name.startsWith('get')) {
    handleGetRequest(path, dirent);
  }
}

function addEndpoint(endpoint: string, model: any) {
  app.get(endpoint, function(req, res) {
    res.send(model.data);
  });
}

function handleGetRequest(path: string, dirent: fs.Dirent) {
  console.log('Adding GET request');
  const endpoint = convertFileNameToEndpoint(path, dirent);
  console.log('Endpoint: ' + endpoint);
  const modulePath = `${path}/${dirent.name}`;
  console.log('Resolve module: ' + modulePath);
  loadModule(modulePath)
    .then(model => addEndpoint(endpoint, model))
    .catch(err => console.error(err));
}

function convertFileNameToEndpoint(path: string, dirent: fs.Dirent): string {
  let endpoint = `${path.replace(basePath, '')}/${dirent.name}`;
  endpoint = endpoint.replace('.ts', '');
  endpoint = endpoint.replace('get', '');
  if (endpoint !== '') {
    endpoint = endpoint.replace('-', '');
  }
  return endpoint;
}
