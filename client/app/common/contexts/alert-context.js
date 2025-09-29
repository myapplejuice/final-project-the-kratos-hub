import { createContext, useContext } from "react";

const AlertContext = createContext();

export default AlertContext;
export const useAlert = () => useContext(AlertContext);