import {useEffect, useState} from 'react';

export function useLocalStorage<T>(
  key: string,
  getInitialValue: () => T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return getInitialValue();
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch {
      // Fallback to initial value when localStorage is unavailable or corrupted
    }
    return getInitialValue();
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Ignore quota or private-mode errors gracefully
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
