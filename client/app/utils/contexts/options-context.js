import { createContext, useContext } from "react";

const OptionsContext = createContext();

export default OptionsContext;
export const useDialog = () => useContext(OptionsContext);