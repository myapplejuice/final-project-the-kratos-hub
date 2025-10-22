import React from "react";
import colors from "../utils/stylings";

export default function Dialog({ visible = false, title, children, onClose, actions = [] }) {
  if (!visible) return null;

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
    zIndex: 9999, // indicate clickable
  };

  const dialogStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    textAlign: "center",
  };

  const titleStyle = {
    marginBottom: "15px",
    fontSize: "18px",
    fontWeight: "600",
  };

  const actionsStyle = {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  };

  const buttonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  // handle any click inside dialog to close
  const handleClick = () => {
    if (onClose) onClose(); // optional callback
  };

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        {title && <div style={titleStyle}>{title}</div>}
        <div>{children}</div>
        {actions.length > 0 && (
          <div style={actionsStyle}>
            {actions.map((action, idx) => (
              <button
                key={idx}
                style={{ ...buttonStyle, backgroundColor: action.color || "#3498db", color: "#fff" }}
                onClick={handleClick} // click button also closes dialog
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
