import { createContext, useContext, useState } from "react";

export const NavBarContext = createContext({
  navBarVisibility: true,        
  setNavBarVisibility: () => {}, 
});
