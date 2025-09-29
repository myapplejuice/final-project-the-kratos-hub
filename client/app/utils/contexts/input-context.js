import { createContext, useContext } from "react";

const InputContext = createContext();

export default InputContext;
export const useInput = () => useContext(InputContext);