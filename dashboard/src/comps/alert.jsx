import React from "react";
import Dialog from "./Dialog";

export default function Alert({ visible = false, message, onClose, title =  "Alert"}) {
  return (
    <Dialog
      visible={visible}
      title={title}
      onClose={onClose}
      actions={[{ label: "OK", onClick: onClose, color: 'rgb(0,140,255)' }]}
    >
      {message}
    </Dialog>
  );
}
