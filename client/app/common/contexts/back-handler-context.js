import { createContext, useContext, useRef, useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

const BackHandlerContext = createContext(null);

export function BackHandlerProvider({ children }) {
  // Stack of back handlers (last pushed is active)
  const handlerStack = useRef([]);
  const paused = useRef(false);
  const cleanup = useRef(null);

  // Native listener calls the top handler if not paused
  const nativeListener = useCallback(() => {
    if (paused.current) return true; // block all back when paused

    const topHandler = handlerStack.current[handlerStack.current.length - 1];
    if (typeof topHandler === 'function') {
      return topHandler();
    }
    return false; // no handler, allow default
  }, []);

  // Manage adding/removing native listener
  useEffect(() => {
    if (!cleanup.current) {
      const listener = BackHandler.addEventListener('hardwareBackPress', nativeListener);
      cleanup.current = () => listener.remove();
    }
    return () => {
      if (cleanup.current) {
        cleanup.current();
        cleanup.current = null;
      }
    };
  }, [nativeListener]);

  // Push or pop handlers on stack
  const setBackHandler = useCallback((handlerFn) => {
    if (handlerFn) {
      handlerStack.current.push(handlerFn);
    } else {
      handlerStack.current.pop();
    }
  }, []);

  const pauseBackHandler = useCallback(() => {
    paused.current = true;
  }, []);

  const resumeBackHandler = useCallback(() => {
    paused.current = false;
  }, []);

  const value = {
    setBackHandler,
    pauseBackHandler,
    resumeBackHandler,
  };

  return (
    <BackHandlerContext.Provider value={value}>
      {children}
    </BackHandlerContext.Provider>
  );
}

export function useBackHandlerContext() {
  const context = useContext(BackHandlerContext);
  if (!context) {
    throw new Error('useBackHandlerContext must be used within a BackHandlerProvider');
  }
  return context;
}
