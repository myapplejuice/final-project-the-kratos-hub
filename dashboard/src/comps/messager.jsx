import React, { useState } from "react";
import colors from "../utils/stylings";

export default function Messager({ visible = false, title, onClose, onSend, sendLabel = "Send" }) {
    const [message, setMessage] = useState("");

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
        zIndex: 9999,
    };

    const containerStyle = {
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "20px",
        maxWidth: "500px",
        width: "90%",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        textAlign: "center",
    };

    const titleStyle = {
        marginBottom: "15px",
        fontSize: "18px",
        fontWeight: "600",
    };

    const inputStyle = {
        width: "100%",
        minHeight: "100px",
        padding: "10px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        resize: "vertical",
    };

    const actionsStyle = {
        marginTop: "20px",
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
    };

    const buttonStyle = {
        padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        backgroundColor: colors.primary || "#3498db",
        color: "#fff",
    };

    const handleSend = () => {
        if (onSend) onSend(message);
        setMessage(""); // clear input after sending
        if (onClose) onClose(); // optional close after send
    };

    return (
        <div style={overlayStyle}>
            <div style={containerStyle}>
                {title && <div style={titleStyle}>{title}</div>}
                <textarea
                    style={inputStyle}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <div style={actionsStyle}>
                    {onClose && (
                        <button style={{ ...buttonStyle, backgroundColor: "#ccc", color: "#000" }} onClick={onClose}>
                            Cancel
                        </button>
                    )}
                    <button style={buttonStyle} onClick={handleSend}>
                        {sendLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
