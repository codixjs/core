import { FunctionComponent } from "react";
import { Application } from "./core";
import { HistoryMode } from "./mode";
import { Path } from "./path";

export interface RequestState {
  hash: string,
  pathname: string,
  query: Record<string, string>,
  params: Record<string, string>,
  hostname: string,
  headers: Record<string, string>,
  state: Record<string, string>,
  pathes: Record<string, any>,
}

export interface MiddlewareConpact<T extends object = {}> {
  component: FunctionComponent<T>,
  props?: T,
}