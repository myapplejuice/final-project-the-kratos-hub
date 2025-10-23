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
                if (input.type === "checkbox-group") {
                    // For checkbox groups, initialize as empty array
                    initialValues[input.name] = input.value || [];
                } else {
                    initialValues[input.name] = input.value || "";
                }
            });
            setInputValues(initialValues);
        }
    }, [visible, inputs]);

    const handleCheckboxChange = (name, value, inputConfig, checked) => {
        const currentValues = inputValues[name] || [];

        if (checked) {
            // Checkbox was checked
            const selectedOption = inputConfig.options?.find(opt => opt.value === value);

            if (selectedOption?.onClickRemoveOthers) {
                // If this option should remove others, set only this value
                setInputValues(prev => ({
                    ...prev,
                    [name]: [value]
                }));
            } else {
                // Add to existing values, but remove any options that have onClickRemoveOthers
                const valuesToRemove = inputConfig.options
                    ?.filter(opt => opt.onClickRemoveOthers)
                    .map(opt => opt.value) || [];

                const filteredValues = currentValues.filter(val => !valuesToRemove.includes(val));

                setInputValues(prev => ({
                    ...prev,
                    [name]: [...filteredValues, value]
                }));
            }
        } else {
            // Checkbox was unchecked - remove the value
            setInputValues(prev => ({
                ...prev,
                [name]: currentValues.filter(val => val !== value)
            }));
        }
    };

    const handleInputChange = (name, value, inputConfig) => {
        if (inputConfig.type === "checkbox-group") {
            // This won't be called for checkboxes since we handle them separately
            return;
        } else {
            // Normal input handling
            setInputValues(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            // For checkbox groups, convert array to comma-separated string
            const processedValues = { ...inputValues };
            inputs.forEach(input => {
                if (input.type === "checkbox-group" && Array.isArray(processedValues[input.name])) {
                    processedValues[input.name] = processedValues[input.name].join(',');
                }
            });
            onConfirm(processedValues);
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

    const checkboxGroupStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    };

    const checkboxOptionStyle = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
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
                                {input.required && <span style={{ color: "red" }}> *</span>}
                            </label>

                            {input.type === "textarea" ? (
                                <textarea
                                    style={textareaStyle}
                                    placeholder={input.placeholder}
                                    value={inputValues[input.name] || ""}
                                    onChange={(e) => handleInputChange(input.name, e.target.value, input)}
                                    required={input.required}
                                />
                            ) : input.type === "select" ? (
                                <select
                                    style={selectStyle}
                                    value={inputValues[input.name] || ""}
                                    onChange={(e) => handleInputChange(input.name, e.target.value, input)}
                                    required={input.required}
                                >
                                    <option value="">Select an option</option>
                                    {input.options?.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : input.type === "checkbox-group" ? (
                                <div style={checkboxGroupStyle}>
                                    {input.options?.map(option => {
                                        const currentValues = inputValues[input.name] || [];
                                        const isChecked = currentValues.includes(option.value);

                                        return (
                                            <label
                                                key={option.value}
                                                style={{
                                                    ...checkboxOptionStyle,
                                                    ...(isChecked ? { backgroundColor: "#e3f2fd" } : {})
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        isChecked ? "#e3f2fd" : "transparent";
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    name={input.name}
                                                    value={option.value}
                                                    checked={isChecked}
                                                    onChange={(e) => handleCheckboxChange(input.name, option.value, input, e.target.checked)}
                                                    style={{ margin: 0 }}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            ) : (
                                <input
                                    type={input.type || "text"}
                                    style={inputStyle}
                                    placeholder={input.placeholder}
                                    value={inputValues[input.name] || ""}
                                    onChange={(e) => handleInputChange(input.name, e.target.value, input)}
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