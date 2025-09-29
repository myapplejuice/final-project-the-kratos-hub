import { createContext, useContext } from "react";

const ToastContext = createContext();

export default ToastContext;
export const useToast = () => useContext(ToastContext);