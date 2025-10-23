import React, { useState, useEffect } from "react";

export default function Input({ 
    visible = false, 
    title = "", 
    message = "",
    inputs = [],
    onClose,
    onConfirm,
    confirmText = "Confirm",
    cancelText = "Cancel"
}) {
    const [inputValues, setInputValues] = useState({});

    // Initialize input values when component becomes visible
    useEffect(() => {
        if (visible) {
            const initialValues = {};
            inputs.forEach(input => {
                initialValues[input.name] = input.value || "";
            });
            setInputValues(initialValues);
        }
    }, [visible, inputs]);

    const handleInputChange = (name, value) => {
        setInputValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm(inputValues);
        }
    };

    const handleClose = () => {
        setInputValues({});
        if (onClose) onClose();
    };

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

    const dialogStyle = {
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "20px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    };

    const titleStyle = {
        marginBottom: "10px",
        fontSize: "18px",
        fontWeight: "600",
    };

    const messageStyle = {
        marginBottom: "20px",
        color: "#666",
        fontSize: "14px",
    };

    const inputGroupStyle = {
        marginBottom: "15px",
    };

    const labelStyle = {
        display: "block",
        marginBottom: "5px",
        fontWeight: "500",
        fontSize: "14px",
    };

    const inputStyle = {
        width: "100%",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "14px",
        boxSizing: "border-box",
    };

    const textareaStyle = {
        ...inputStyle,
        minHeight: "80px",
        resize: "vertical",
    };

    const selectStyle = {
        ...inputStyle,
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
        fontSize: "14px",
    };

    return (
        <div style={overlayStyle}>
            <div style={dialogStyle}>
                {title && <div style={titleStyle}>{title}</div>}
                {message && <div style={messageStyle}>{message}</div>}
                
                <div>
                    {inputs.map((input, index) => (
                        <div key={input.name || index} style={inputGroupStyle}>
                            <label style={labelStyle}>
                                {input.label}
                                {input.required && <span style={{color: "red"}}> *</span>}
                            </label>
                            {input.type === "textarea" ? (
                                <textarea
                                    style={textareaStyle}
                                    placeholder={input.placeholder}
                                    value={inputValues[input.name] || ""}
                                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                                    required={input.required}
                                />
                            ) : input.type === "select" ? (
                                <select
                                    style={selectStyle}
                                    value={inputValues[input.name] || ""}
                                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                                    required={input.required}
                                >
                                    <option value="">Select an option</option>
                                    {input.options?.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={input.type || "text"}
                                    style={inputStyle}
                                    placeholder={input.placeholder}
                                    value={inputValues[input.name] || ""}
                                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                                    required={input.required}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div style={actionsStyle}>
                    <button
                        style={{ ...buttonStyle, backgroundColor: "#95a5a6", color: "#fff" }}
                        onClick={handleClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        style={{ ...buttonStyle, backgroundColor: "#3498db", color: "#fff" }}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}