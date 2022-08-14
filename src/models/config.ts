export interface DefaultConfig {
  request: RequestConfig;
}

export interface RequestConfig {
  delay?: number | Interval; // Delay response (in ms), or an interval
  statusCode?: number; // Status code of response
}

export interface Interval {
  min: number; // Minimum boundary, including the value
  max: number; // Maximum boundary, including the value
}
