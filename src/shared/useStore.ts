import { useEffect, useState } from 'react';

type Store<T> = {
  get: () => T;
  subscribe: (cb: (value: T) => void) => () => void;
};

export function useStore<T>(store: Store<T>) {
  const [value, setValue] = useState<T>(() => store.get());
  useEffect(() => {
    const unsub = store.subscribe(setValue);
    setValue(store.get());
    return unsub;
  }, [store]);
  return value;
}
