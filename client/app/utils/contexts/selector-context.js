import { createContext, useContext } from "react";

const SelectorContext = createContext();

export default SelectorContext;
export const useSelector = () => useContext(SelectorContext);