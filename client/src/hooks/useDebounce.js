import { useState, useEffect } from "react";

/**
 * Custom hook to debounce any fast-changing value (e.g. search input).
 * @param {any} value - The input value to debounce
 * @param {number} delay - Delay in milliseconds (defaults to 500ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
