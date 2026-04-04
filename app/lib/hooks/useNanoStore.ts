/* eslint-disable @blitz/newline-before-return */
import { useEffect, useState } from 'react';

type NanoStore<T> = {
  get: () => T;
  subscribe: (cb: (value: T) => void) => () => void;
};

export function useNanoStore<T>(store: NanoStore<T>) {
  const [value, setValue] = useState<T>(() => store.get());

  useEffect(() => {
    const unsub = store.subscribe(setValue);
    return unsub;
  }, [store]);

  return value;
}
