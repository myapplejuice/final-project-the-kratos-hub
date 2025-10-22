import React, { createContext, useState } from 'react';

export const AppContext = createContext({
  admin: null,
  setAdmin: () => { },
  additionalContexts: {},
  setAdditionalContexts: () => { },
});

export function AppProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [additionalContexts, setAdditionalContexts] = useState({});

  return (
    <AppContext.Provider value={{ admin, setAdmin, additionalContexts, setAdditionalContexts }}>
      {children}
    </AppContext.Provider>
  );
}
