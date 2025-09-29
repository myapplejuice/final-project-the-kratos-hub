import { useContext } from "react";
import DialogContext from "../contexts/dialog-context";
import AlertContext from "../contexts/alert-context";
import SelectorContext from "../contexts/selector-context";
import InputContext from "../contexts/input-context";
import SpinnerContext from "../contexts/spinner-context";
import ToastContext from "../contexts/toast-context";
import OptionsContext from "../contexts/options-context";
import PickerContext from "../contexts/picker-context";

export default function usePopups() {
  const { createPicker } = useContext(PickerContext);
  const { createDialog } = useContext(DialogContext);
  const { createAlert } = useContext(AlertContext);
  const { createSelector, hideSelector } = useContext(SelectorContext);
  const { createInput, hideInput } = useContext(InputContext);
  const { createToast } = useContext(ToastContext);
  const { showSpinner, hideSpinner } = useContext(SpinnerContext);
  const { createOptions } = useContext(OptionsContext);

  return {
    createPicker,
    createDialog,
    createAlert,
    createSelector,
    hideSelector,
    createInput,
    hideInput,
    createToast,
    showSpinner,
    hideSpinner,
    createOptions,
  };
}