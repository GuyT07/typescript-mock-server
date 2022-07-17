#!./node_modules/.bin/ts-node-dev

import { TypescriptMockServer } from './typescript-mock-server';
import { TypescriptMockServerImpl } from './impl/typescript-mock-server-impl';

const server: TypescriptMockServer = new TypescriptMockServerImpl();

server.start();
