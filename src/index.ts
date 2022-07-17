#!./node_modules/.bin/ts-node-dev

import { TypescriptMockServer } from './typescript-mock-server';

const server = new TypescriptMockServer();

server.start();
