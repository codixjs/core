export interface TConfigs {
  template: string,
  entries: {
    spa: string,
    client: string,
    server: string,
  },
  skips?: string[],
  rewrites?: Record<string, string>,
}