export interface TConfigs<T extends Record<string, unknown> = {}> {
  entries: {
    spa: string,
    client: string,
    server: string,
  },
  skips?: string[],
  rewrites?: Record<string, string>,
  templateStates?: T,
}