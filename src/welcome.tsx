import React from 'react';
import { useAsync, useAsyncCallback } from '../packages/fetch/dist';
export default function Welcome() {
  const { data, success, error, execute, loading } = useAsync('test', () => new Promise<{ a: number }>((resolve, reject) => {
    setTimeout(() => resolve({
      a: Date.now()
    }), 5000);
  }))

  const abc = useAsyncCallback(() => new Promise<number>((resolve, reject) => {
    setTimeout(() => {
      resolve(Date.now());
    }, 3000)
  }), Date.now());
  return <div>Welcome: 

    <p><button onClick={execute}>{ 
      loading
        ? 'load'
        : success
        ? data.a
        : error.message
    }</button></p>

    <p>
      <button onClick={abc.execute}>{ 
        abc.loading
          ? 'load'
          : abc.success
          ? abc.data
          : abc.error.message
      }</button>
    </p>
  </div>
}