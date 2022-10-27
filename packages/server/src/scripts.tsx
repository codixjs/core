import { THeaderScript } from './types';
import React, { Fragment } from 'react';

function transformHeaderScripts(scripts: (string | THeaderScript)[] = []) {
  return scripts.map(srt => typeof srt === 'string' ? { src: srt } : srt);
}

export function Scripts(props: React.PropsWithoutRef<{ dataSource: (string | THeaderScript)[] }>) {
  const scripts = transformHeaderScripts(props.dataSource);
  return <Fragment>
    {
      scripts.map((script, index) => {
        return <script 
          key={index} 
          type={script.type} 
          crossOrigin={script.crossOrigin} 
          src={script.src} 
          dangerouslySetInnerHTML={{ __html: script.content }} 
        />
      })
    }
  </Fragment>
}