import { useState, useCallback, useEffect } from 'react';
import { useBackHandlerContext } from '../contexts/back-handler-context';

export default function usePopupHandlers() {
  const [dialog, setDialog] = useState(false);
  const [dialogParams, setDialogParams] = useState({});

  const [alert, setAlert] = useState(false);
  const [alertParams, setAlertParams] = useState({});

  const [selector, setSelector] = useState(false);
  const [selectorParams, setSelectorParams] = useState({});

  const [input, setInput] = useState(false);
  const [inputParams, setInputParams] = useState({});

  const [options, setOptions] = useState(false);
  const [optionsParams, setOptionsParams] = useState({});

  const [spinner, setSpinner] = useState(false);
  const [spinnerParams, setSpinnerParams] = useState({});

  const [toast, setToast] = useState(null);

  const [picker, setPicker] = useState(false);
  const [pickerParams, setPickerParams] = useState({});

  const { pauseBackHandler, resumeBackHandler, setBackHandler } = useBackHandlerContext();

  useEffect(() => {
    const anyPopupOpen = dialog || alert || spinner;
    if (!anyPopupOpen)
      resumeBackHandler();
    else
      pauseBackHandler();
  }, [dialog, alert, spinner, resumeBackHandler]);

  /* PICKER */
  const createPicker = useCallback((params) => {
    setBackHandler(() => {
      hidePicker();
      return true;
    });
    setPickerParams({
      ...params,
      onCancel: () => hidePicker(),
      onSubmit: (...args) => {
        if (typeof params.onSubmit === 'function') {
          params.onSubmit(...args);
        }
        hidePicker();
      }
    });
    setPicker(true);
  }, [setBackHandler, hidePicker]);

  const hidePicker = useCallback(() => {
    setPicker(false);
    setBackHandler(null);
  }, [setBackHandler]);

  /* OPTIONS */
  const createOptions = useCallback((params) => {
    setBackHandler(() => {
      hideOptions();
      return true;
    });
    setOptionsParams({
      ...params,
      onConfirm: (...args) => {
        if (typeof params.onConfirm === 'function') {
          params.onConfirm(...args);
        }
        hideOptions();
      }
    });
    setOptions(true);
  }, [setBackHandler, hideOptions]);

  const hideOptions = useCallback(() => {
    setOptions(false);
    setBackHandler(null);
  }, [setBackHandler]);

  /* DIALOG */
  const createDialog = useCallback((params) => {
    setDialogParams(params);
    setDialog(true);
  }, []);

  /* ALERT */
  const createAlert = useCallback((params) => {
    setAlertParams(params);
    setAlert(true);
  }, []);

  /* SELECTOR */
  const createSelector = useCallback((params) => {
    setBackHandler(() => {
      hideSelector();
      return true;
    });
    setSelectorParams({
      ...params,
      onPressA: (...args) => {
        if (typeof params.onPressA === 'function') {
          params.onPressA(...args);
        }
        hideSelector();
      },
      onPressB: (...args) => {
        if (typeof params.onPressB === 'function') {
          params.onPressB(...args);
        }
        hideSelector();
      },
      onClose: (...args) => {
        if (typeof params.onClose === 'function') {
          params.onClose(...args);
        }
        hideSelector();
      },
      onCancel: () => hideSelector(),

    });
    setSelector(true);
  }, [setBackHandler, hideSelector]);

  const hideSelector = useCallback(() => {
    setSelector(false);
    setBackHandler(null);
  }, [setBackHandler]);

  /* INPUT */
  const createInput = useCallback((params) => {
    setBackHandler(() => {
      hideInput();
      return true;
    });
    setInputParams({
      ...params,
      onSubmit: (...args) => {
        if (typeof params.onSubmit === 'function') {
          params.onSubmit(...args);
        }
        hideInput();
      },
      onCancel: () => hideInput()
    });
    setInput(true);
  }, [setBackHandler, hideInput]);

  const hideInput = useCallback(() => {
    setInput(false);
    setBackHandler(null);
  }, [setBackHandler]);

  /* SPINNER */
  const showSpinner = useCallback((params) => {
    setSpinnerParams({
      ...params,
      onHide: (...args) => {
        if (typeof params?.onHide === 'function') {
          params?.onHide(...args);
        }
        setSpinner(false);
      }
    });
    setSpinner(true);
  }, []);

  const hideSpinner = useCallback(() => {
    setSpinner(false);
  }, []);

  const createToast = useCallback((message) => { setToast(message); }, []);

  return {
    popupStates: {
      toast, setToast,
      picker, setPicker, pickerParams,
      dialog, setDialog, dialogParams,
      alert, setAlert, alertParams,
      selector, setSelector, selectorParams,
      input, setInput, inputParams,
      spinner, setSpinner, spinnerParams,
      options, setOptions, optionsParams
    },
    popupActions: {
      createPicker,
      createOptions,
      createDialog,
      createAlert,
      createSelector,
      hideSelector,
      createInput,
      hideInput,
      showSpinner,
      hideSpinner,
      createToast,
    }
  };
}
