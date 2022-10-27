import React, { Fragment } from 'react';
export function PreLoads(props: React.PropsWithoutRef<{ dataSource?: string[] }>) {
  return <Fragment>
    {
      (props.dataSource || []).map(script => {
        return <link rel="modulepreload" href={script} key={script} />
      })
    }
  </Fragment>
}