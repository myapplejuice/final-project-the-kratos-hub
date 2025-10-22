import React, { createContext, useContext, useState } from "react";
import LoadingSpinner from "../comps/loading-spinner";
import Dialog from "../comps/Dialog";
import Messager from "../comps/messager";

const PopupsContext = createContext(null);

export function PopupsProvider({ children }) {
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const [dialogState, setDialogState] = useState({ visible: false, title: "", content: null, actions: [] });
  const [alertState, setAlertState] = useState({ visible: false, message: "", title: "" });
  const [messagerState, setMessagerState] = useState({ visible: false, title: "", onClose: null, onSend: null, sendLabel: "Send" });

  // Dialog
  const showDialog = ({ title, content, actions }) => {
    setDialogState({ visible: true, title, content, actions });
  };
  const hideDialog = () => setDialogState((prev) => ({ ...prev, visible: false }));

  // Alert
  const showAlert = (message) => setAlertState({ visible: true, message, title: "Alert" });
  const hideAlert = () => setAlertState({ visible: false, message: "" });

  // Spinner
  const showSpinner = () => setSpinnerVisible(true);
  const hideSpinner = () => setSpinnerVisible(false);

  // Messager
  const showMessager = ({ title, onClose, onSend, sendLabel }) => setMessagerState({ visible: true, title, onClose, onSend, sendLabel });
  const hideMessager = () => { messagerState.onClose?.(); setMessagerState({ visible: false, title: "", onClose: null, onSend: null, sendLabel: "Send" }); };

  return (
    <PopupsContext.Provider value={{ showDialog, hideDialog, showAlert, hideAlert, showSpinner, hideSpinner, showMessager, hideMessager }}>
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
        title="Alert"
        actions={[{ label: "OK", onClick: hideAlert, color: "#e74c3c" }]}
        onClose={hideAlert}
      >
        {alertState.message}
      </Dialog>

      <Messager
        visible={messagerState.visible}
        title={messagerState.title}
        onClose={hideMessager}
        onSend={messagerState.onSend}
        sendLabel={messagerState.sendLabel}
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
