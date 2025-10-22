import React, { createContext, useContext, useState } from "react";
import LoadingSpinner from "../comps/loading-spinner";
import Dialog from "../comps/Dialog";

const PopupsContext = createContext(null);

export function PopupsProvider({ children }) {
  const [spinnerVisible, setSpinnerVisible] = useState(false);
  const [dialogState, setDialogState] = useState({ visible: false, title: "", content: null, actions: [] });
  const [alertState, setAlertState] = useState({ visible: false, message: "", title: "" });

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

  return (
    <PopupsContext.Provider value={{ showDialog, hideDialog, showAlert, hideAlert, showSpinner, hideSpinner }}>
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
    </PopupsContext.Provider>
  );
}

// Hook to use popups anywhere
export function usePopups() {
  const context = useContext(PopupsContext);
  if (!context) throw new Error("usePopups must be used within a PopupsProvider");
  return context;
}
