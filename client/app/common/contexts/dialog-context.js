import { createContext, useContext } from "react";

const DialogContext = createContext();

export default DialogContext;
export const useDialog = () => useContext(DialogContext);