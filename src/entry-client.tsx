import React from 'react';
import { Application, PopstateHistoryMode } from '../packages/codix/dist';
import { createRouters } from './routers';
import { hydrateRoot } from 'react-dom/client';

const app = new Application(PopstateHistoryMode);
export const routers = createRouters(app);
const { Bootstrap } = app.build();

window.onload = () => {
  hydrateRoot(
    document.getElementById('root'),
    <Bootstrap>404 Not Found</Bootstrap>
  );
}
