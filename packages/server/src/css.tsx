import React, { Fragment } from 'react';

export function Css(props: React.PropsWithoutRef<{ dataSource?: string[] }>) {
  return <Fragment>
    {
      (props.dataSource || []).map(css => {
        return <link rel="stylesheet" href={css} key={css} />
      })
    }
  </Fragment>
}