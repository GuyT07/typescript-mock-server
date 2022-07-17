export interface Config {
  server?: Server;
}

export interface Server {
  delay?: number; // Delay response (in ms)
  statusCode?: number; // Status code of response
}
