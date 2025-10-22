import React from "react";

export default function LoadingSpinner({ visible = true }) {
    if (!visible) return null;

    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    };

    const spinnerStyle = {
        border: "6px solid #f3f3f3",
        borderTop: "6px solid #3498db",
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        animation: "spin 1s linear infinite",
    };

    return (
        <>
            <div style={overlayStyle}>
                <div style={spinnerStyle}></div>
            </div>

            {/* keyframes for spin animation */}
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
            </style>
        </>
    );
}
