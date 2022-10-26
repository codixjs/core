import { FunctionComponent } from "react";

export interface RequestState {
  hash: string,
  pathname: string,
  query: Record<string, string>,
  params: Record<string, string>,
  hostname: string,
  headers: Record<string, string>,
  state: Record<string, string>,
}

export interface MiddlewareConpact<T extends object = {}> {
  component: FunctionComponent<T>,
  props?: T,
}