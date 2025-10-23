import React, { createContext, useContext, useState } from "react";
import LoadingSpinner from "../comps/loading-spinner";
import Dialog from "../comps/Dialog";
import Messager from "../comps/messager";
import Options from "../comps/options";

const PopupsContext = createContext(null);

export function PopupsProvider({ children }) {
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const [dialogState, setDialogState] = useState({ visible: false, title: "", content: null, actions: [] });
  const [alertState, setAlertState] = useState({ visible: false, message: "", title: "" });
  const [messagerState, setMessagerState] = useState({ visible: false, placeholder: "Type your message...", title: "", onClose: null, onSend: null, sendLabel: "Send" });
  const [optionsState, setOptionsState] = useState({ visible: false, title: "", current: "", options: [], onClose: null, onConfirm: null, confirmText: "Select", cancelText: "Cancel" });

  // Dialog
  const showDialog = ({ title, content, actions }) => {
    setDialogState({ visible: true, title, content, actions });
  };
  const hideDialog = () => setDialogState((prev) => ({ ...prev, visible: false }));

  // Alert
  const showAlert = ({ title, message}) => setAlertState({ visible: true, message, title });
  const hideAlert = () => setAlertState({ visible: false, title: "", message: "" });

  // Spinner
  const showSpinner = () => setSpinnerVisible(true);
  const hideSpinner = () => setSpinnerVisible(false);

  // Messager
  const showMessager = ({ title, placeholder, onClose, onSend, sendLabel }) => setMessagerState({ visible: true, placeholder, title, onClose, onSend, sendLabel });
  const hideMessager = () => { messagerState.onClose?.(); setMessagerState({ visible: false, placeholder: "Type your message...", title: "", onClose: null, onSend: null, sendLabel: "Send" }); };

  const showOptions = ({
    title,
    current,
    options,
    onClose,
    onConfirm,
    confirmText,
    cancelText,
  }) => {
    setOptionsState({
      visible: true,
      title: title || "",
      current: current || "",
      options: options || [],
      onClose: onClose || (() => {}),
      onConfirm: onConfirm || (() => {}),
      confirmText: confirmText || "Select",
      cancelText: cancelText || "Cancel",
    });
  };

  const hideOptions = () => {
    optionsState.onClose?.();
    setOptionsState((prev) => ({ visible: false, title: "", current: "", options: [], onClose: null, onConfirm: null, confirmText: "Select", cancelText: "Cancel" }));
  };

  return (
    <PopupsContext.Provider value={{ showDialog, hideDialog, showAlert, hideAlert, showSpinner, hideSpinner, showMessager, hideMessager , showOptions, hideOptions}}>
      {children}

      <LoadingSpinner visible={spinnerVisible} />

      <Dialog
        visible={dialogState.visible}
        title={dialogState.title}
        actions={dialogState.actions}
        onClose={hideDialog}
      >
        {dialogState.content}
      </Dialog>

      <Dialog
        visible={alertState.visible}
        title={alertState.title}
        actions={[{ label: "OK", onClick: hideAlert, color: "#e74c3c" }]}
        onClose={hideAlert}
      >
        {alertState.message}
      </Dialog>

      <Messager
        visible={messagerState.visible}
        title={messagerState.title}
        placeholder={messagerState.placeholder}
        onClose={hideMessager}
        onSend={messagerState.onSend}
        sendLabel={messagerState.sendLabel}
      />

        <Options
        visible={optionsState.visible}
        title={optionsState.title}
        current={optionsState.current}
        options={optionsState.options}
        onClose={hideOptions}
        onConfirm={optionsState.onConfirm}
        confirmText={optionsState.confirmText}
        cancelText={optionsState.cancelText}
      />
    </PopupsContext.Provider>
  );
}

// Hook to use popups anywhere
export function usePopups() {
  const context = useContext(PopupsContext);
  if (!context) throw new Error("usePopups must be used within a PopupsProvider");
  return context;
}
