import Toast from "../components/popups/toast";
import Spinner from "../components/popups/spinner";
import Dialog from "../components/popups/dialog";
import Alert from "../components/popups/alert";
import Selector from "../components/popups/selector";
import Input from "../components/popups/input";
import Options from "../components/popups/options";
import { StyleSheet, View } from "react-native";
import Picker from "../components/popups/picker";

export default function Popups({
  toast, setToast, spinner,
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

      {spinner && <Spinner />}

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
