import React, { useState } from "react";
import colors from "../utils/stylings";

export default function Options({
  visible = false,
  title = "",
  current = "",
  options = [], // [{ label: "Option 1", value: "A", color: "#3498db" }, ...]
  onClose = () => {},
  onConfirm = () => {},
  confirmText = "Select",
  cancelText = "Cancel",
}) {
  const [selected, setSelected] = useState(current);

  if (!visible) return null;

  function handleConfirm() {
    const chosen = options.find((opt) => opt.label === selected);
    onConfirm(chosen);
    onClose();
  }

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const boxStyle = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "25px 20px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    textAlign: "center",
    maxHeight: "80vh",
    overflowY: "auto",
  };

  const titleStyle = {
    marginBottom: "15px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#222",
  };

  const optionStyle = (opt) => ({
    padding: "12px 18px",
    margin: "6px 0",
    borderRadius: "8px",
    cursor: "pointer",
    border: `2px solid ${selected === opt.label ? opt.color || colors.main : "transparent"}`,
    backgroundColor:
      selected === opt.label
        ? (opt.color || colors.main) + "20"
        : "rgba(0,0,0,0.03)",
    transition: "all 0.25s ease",
  });

  const optionTextStyle = (opt) => ({
    color: selected === opt.label ? opt.color || colors.main : "#333",
    fontWeight: selected === opt.label ? "600" : "500",
  });

  const buttonRowStyle = {
    marginTop: "25px",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  };

  const buttonStyle = {
    flex: 1,
    padding: "10px 0",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.25s ease",
  };

  const cancelButton = {
    ...buttonStyle,
    backgroundColor: "#f1f1f1",
    color: "#444",
  };

  const confirmButton = {
    ...buttonStyle,
    backgroundColor: colors.main || "#3498db",
    color: "#fff",
  };

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        {title && <div style={titleStyle}>{title}</div>}

        <div>
          {options.map((opt, i) => (
            <div
              key={i}
              style={optionStyle(opt)}
              onClick={() => setSelected(opt.label)}
            >
              <span style={optionTextStyle(opt)}>{opt.label}</span>
            </div>
          ))}
        </div>

        <div style={buttonRowStyle}>
          <button style={cancelButton} onClick={onClose}>
            {cancelText}
          </button>
          <button style={confirmButton} onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
