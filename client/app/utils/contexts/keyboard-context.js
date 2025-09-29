import { createContext } from "react";

export const KeyboardContext = createContext({
  keyboardActive: false,
  setKeyboardActive: () => {},
});