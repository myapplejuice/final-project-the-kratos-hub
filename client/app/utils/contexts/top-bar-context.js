import { createContext, useContext, useState } from "react";

export const TopBarContext = createContext({
  topBarVisibility: true,        
  setTopBarVisibility: () => {}, 
});
