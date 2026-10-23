#!/usr/bin/env node

export * from './typescript-mock-server';
export * from './impl/typescript-mock-server-impl';
export * from './models/config';
export * from './models/registered-endpoint';
export * from './types/http-verbs';
export * from './logger';

import { TypescriptMockServer } from './typescript-mock-server';
import { TypescriptMockServerImpl } from './impl/typescript-mock-server-impl';

// Only start the server if this file is run directly
if (require.main === module) {
  const server: TypescriptMockServer = new TypescriptMockServerImpl();
  server.start().then(() => console.log('Server started')).catch(console.error);
}
