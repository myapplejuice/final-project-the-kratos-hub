import Toast from "./toast";
import Spinner from "./spinner";
import Dialog from "./dialog";
import Alert from "./alert";
import Selector from "./selector";
import Input from "./input";
import Options from "./options";
import { StyleSheet, View } from "react-native";
import Picker from "./picker";

export default function Popups({
  toast, setToast,
  spinner, setSpinner, spinnerParams,
  dialog, setDialog, dialogParams,
  alert, setAlert, alertParams,
  selector, setSelector, selectorParams,
  input, setInput, inputParams,
  options, setOptions, optionsParams,
  picker, setPicker, pickerParams
}) {
  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          onFinish={() => {
            if (toast.onFinish) {
              toast.onFinish();
            }
            setToast(null);
          }}
        />
      )}

      {spinner && <Spinner
        text={spinnerParams.text}
        timerDuration={spinnerParams.timerDuration}
        abandonable={spinnerParams.abandonable}
        onHide={() => {
          setSpinner(false);
          if (spinnerParams.onHide) {
            spinnerParams.onHide();
          }
        }} />}

      {dialog && (
        <Dialog
          title={dialogParams.title}
          text={dialogParams.text}
          abortText={dialogParams.abortText}
          confirmText={dialogParams.confirmText}
          onAbort={() => {
            setDialog(false);
            if (dialogParams.onAbort) {
              dialogParams.onAbort();
            }
          }}
          onConfirm={() => {
            setDialog(false);
            if (dialogParams.onConfirm) {
              dialogParams.onConfirm();
            }
          }}
        />
      )}

      {alert && (
        <Alert
          title={alertParams.title}
          text={alertParams.text}
          buttonText={alertParams.buttonText}
          onPress={() => {
            setAlert(false);
            if (alertParams.onPress) {
              alertParams.onPress();
            }
          }}
        />
      )}

      {selector && (
        <Selector
          title={selectorParams.title}
          text={selectorParams.text}
          optionAText={selectorParams.optionAText}
          optionBText={selectorParams.optionBText}
          cancelText={selectorParams.cancelText}
          onPressA={() => {
            setSelector(false);
            if (selectorParams.onPressA) {
              selectorParams.onPressA();
            }
          }}
          onPressB={() => {
            setSelector(false);
            if (selectorParams.onPressB) {
              selectorParams.onPressB();
            }
          }}
          onCancel={() => {
            setSelector(false);
            if (selectorParams.onCancel) {
              selectorParams.onCancel();
            }
          }}
          onClose={() => {
            if (selectorParams.onCancel) {
              selectorParams.onCancel();
            } else
              setSelector(false);
          }}
        />
      )}

      {input && (
        <Input
          cancelButtonStyle={inputParams.cancelButtonStyle}
          cancelButtonTextStyle={inputParams.cancelButtonTextStyle}
          confirmButtonStyle={inputParams.confirmButtonStyle}
          confirmButtonTextStyle={inputParams.confirmButtonTextStyle}
          confirmText={inputParams.confirmText}
          title={inputParams.title}
          text={inputParams.text}
          placeholders={inputParams.placeholders || ["Enter value..."]}
          initialValues={inputParams.initialValues || []}
          extraConfigs={inputParams.extraConfigs || []} // optional
          onSubmit={(values) => {
            setInput(false);
            inputParams.onSubmit?.(values);
          }}
          onCancel={() => {
            setInput(false);
            inputParams.onCancel?.();
          }}
        />
      )}

      {options && (
        <Options
          title={optionsParams.title}
          options={optionsParams.options}
          current={optionsParams.current}
          onConfirm={(val) => {
            setOptions(false);
            if (optionsParams.onConfirm) {
              optionsParams.onConfirm(val);
            }
          }}
        />
      )}

      {picker && (
        <Picker
          title={pickerParams.title}
          initialValue={pickerParams.initialValue}
          min={pickerParams.min}
          max={pickerParams.max}
          onSubmit={(value) => {
            setPicker(false);
            if (pickerParams.onSubmit) {
              pickerParams.onSubmit(value);
            }
          }}
          onCancel={() => {
            setPicker(false);
            if (pickerParams.onCancel) {
              pickerParams.onCancel();
            }
          }}

        />
      )}
    </>
  );
}
