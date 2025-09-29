import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export default function useAppStateBackHandler(callback) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        callbackRef.current?.();
      }
    });

    return () => subscription.remove();
  }, []);
}
