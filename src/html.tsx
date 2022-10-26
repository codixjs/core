import React from 'react';
import { THtmlProps } from '../packages/server/dist';
export function Html(props: React.PropsWithChildren<THtmlProps<{ a: number }>>) {
return <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/src/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite App</title>
    </head>
    <body>
      <div id="root">{props.children}</div>
      <script type="module" src="/src/entry-client.tsx"></script>
    </body>
  </html>

}