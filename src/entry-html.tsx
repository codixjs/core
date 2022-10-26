import React from 'react';
import { Application, PopstateHistoryMode } from '../packages/codix/dist';
import { createRouters } from './routers';
import { createRoot } from 'react-dom/client';

const app = new Application(PopstateHistoryMode);
export const routers = createRouters(app);
const { Bootstrap } = app.build();
const react = createRoot(document.getElementById('root'));

react.render(<Bootstrap>404 Not Found</Bootstrap>);