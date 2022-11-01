import { startTransition, useEffect, useState } from 'react';
import { Node } from './client';
import { useClient } from './provider';

export function useAsync<T>(id: string, callback: () => Promise<T>) {
  const client = useClient();
  const node = client.add<T>(id).read(callback);
  node.type = 'client';
  return createAsync(node, callback);
}

function createAsync<T>(node: Node<T>, callback: () => Promise<T>) {
  const [data, setData] = useState(node.value);
  const [error, setError] = useState(node.error);
  const [success, setSuccess] = useState(node.success);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = () => startTransition(() => {
      setData(node.value);
      setError(node.error);
      setSuccess(node.success);
      setLoading(false);
    })
    node.e.on('done', handler);
    return () => node.e.off('done', handler);
  }, [node]);

  return {
    data, error, success, loading,
    setData,
    execute() {
      setLoading(true);
      node.reset();
      node.read(callback);
    }
  }
}

export function useAsyncCallback<T, U extends any[] = []>(callback: (...args: U) => Promise<T>, defaultValue?: T) {
  const [data, setData] = useState(defaultValue);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(true);
  const [loading, setLoading] = useState(false);

  return {
    data, error, success, loading,
    setData,
    execute(...args: U) {
      setLoading(true);
      return callback(...args)
        .then(data => {
          startTransition(() => {
            setData(data);
            setSuccess(true);
            setError(null);
          })
          return data;
        })
        .catch(e => {
          startTransition(() => {
            setError(e);
            setSuccess(false);
            setData(defaultValue);
          })
          return Promise.reject(e);
        })
        .finally(() => startTransition(() => setLoading(false)))
    }
  }
}

export function useResetAsync(id: string) {
  const client = useClient();
  if (client.has(id)) {
    client.get(id).reset();
  }
}