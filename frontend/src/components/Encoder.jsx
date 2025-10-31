import { useMemo } from 'react';


export function useEncoder(value) {
  return useMemo(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}<>?/~`';

    const getRandomLength = () => {
      const baseLength = Math.max(8, value.length);
      const minLength = Math.max(8, baseLength - 10);
      const maxLength = baseLength + 10;
      return Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    };
    const length = getRandomLength();
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, [value]);
}