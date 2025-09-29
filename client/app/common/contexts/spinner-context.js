import { createContext, useContext } from "react";

const SpinnerContext = createContext();

export default SpinnerContext;
export const useSpinner = () => useContext(SpinnerContext);