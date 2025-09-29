import { createContext, useContext } from "react";

const PickerContext = createContext();

export default PickerContext;
export const usePicker = () => useContext(PickerContext);