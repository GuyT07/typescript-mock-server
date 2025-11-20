#!./node_modules/.bin/ts-node

import { TypescriptMockServer } from './typescript-mock-server';
import { TypescriptMockServerImpl } from './impl/typescript-mock-server-impl';

const server: TypescriptMockServer = new TypescriptMockServerImpl();

server.start().then(() => console.log('Server started')).catch(console.error);
