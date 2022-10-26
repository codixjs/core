import React from 'react';
import { createContext, useContext } from 'react';
import { Client } from './client';

export const ClientContext = createContext<Client>(new Client());

export function useClient() {
  return useContext(ClientContext);
}

export function ClientProvider(props: React.PropsWithChildren<{ client: Client }>) {
  return <ClientContext.Provider value={props.client}>{props.children}</ClientContext.Provider>
}