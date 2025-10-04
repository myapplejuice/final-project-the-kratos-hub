import React, { useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { scaleFont } from "../../common/utils/scale-fonts";
import { colors } from "../../common/settings/styling";
import AppText from "../screen-comps/app-text";
import AppTextInput from '../screen-comps/app-text-input'

export default function Input({
    title = "Update Details",
    text = "Enter new values below",
    confirmText = "Submit",
    confirmButtonStyle = {},
    confirmButtonTextStyle = {},
    cancelButtonStyle = {},
    cancelButtonTextStyle = {},
    placeholders = ["Enter value..."],
    initialValues = [],
    extraConfigs = [],
    largeTextIndices = [],
    onSubmit = (values) => { },
    onCancel = () => { },
}) {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(100)).current;
    const [values, setValues] = useState(
        placeholders.map((phItem, rowIndex) =>
            Array.isArray(phItem)
                ? phItem.map((_, colIndex) =>
                    initialValues?.[rowIndex]?.[colIndex] != null
                        ? String(initialValues[rowIndex][colIndex])
                        : ""
                )
                : initialValues?.[rowIndex] != null
                    ? String(initialValues[rowIndex])
                    : ""
        )
    );

    const inputRefs = useRef(
        placeholders.flatMap(phItem =>
            Array.isArray(phItem) ? phItem.map(() => React.createRef()) : [React.createRef()]
        )
    );

    useEffect(() => {
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (inputRefs.current[0]?.current) inputRefs.current[0].current.focus();
        });
    }, []);

    return (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <Animated.View style={[styles.alertBox, { transform: [{ translateY }] }]}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <AppText style={styles.title}>
                            {title}
                        </AppText>
                        <View style={styles.titleLine} />
                    </View>
                    <AppText style={styles.text}>
                        {text}
                    </AppText>
                </View>

                {/* Input Fields */}
                <ScrollView
                    style={styles.inputsContainer}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {placeholders.map((phItem, rowIndex) => {
                        if (Array.isArray(phItem)) {
                            return (
                                <View key={rowIndex} style={styles.rowInputContainer}>
                                    {phItem.map((ph, colIndex) => {
                                        const isLast = colIndex === phItem.length - 1;
                                        return (
                                            <View
                                                key={colIndex}
                                                style={[styles.rowInputWrapper, isLast && styles.rowInputLast]}
                                            >
                                                <AppTextInput
                                                    value={values[rowIndex][colIndex]}
                                                    ref={inputRefs.current[
                                                        placeholders
                                                            .slice(0, rowIndex)
                                                            .flatMap(item => (Array.isArray(item) ? item : [item]))
                                                            .length + colIndex
                                                    ]}
                                                    onChangeText={text => {
                                                        const newValues = [...values];
                                                        newValues[rowIndex][colIndex] = text;
                                                        setValues(newValues);
                                                    }}
                                                    placeholder={ph}
                                                    placeholderTextColor={colors.mutedText}
                                                    style={styles.input}
                                                    {...((extraConfigs[rowIndex]?.[colIndex]) || {})}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            );
                        }

                        return (
                            <View key={rowIndex} style={styles.inputWrapper}>
                                <AppTextInput
                                    value={values[rowIndex]}
                                    ref={inputRefs.current[
                                        placeholders
                                            .slice(0, rowIndex)
                                            .flatMap(item => (Array.isArray(item) ? item : [item]))
                                            .length
                                    ]}
                                    onChangeText={text => {
                                        const newValues = [...values];
                                        newValues[rowIndex] = text;
                                        setValues(newValues);
                                    }}
                                    placeholder={phItem}
                                    placeholderTextColor={colors.mutedText}
                                    style={[
                                        styles.input,
                                        largeTextIndices?.includes(rowIndex) && styles.largeTextInput // <-- add this
                                    ]}
                                    multiline={largeTextIndices?.includes(rowIndex)} // <-- enable multiline
                                    numberOfLines={largeTextIndices?.includes(rowIndex) ? 4 : 1} // <-- optional
                                    {...(extraConfigs[rowIndex] || {})}
                                />
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[
                            styles.buttonContainer,
                            styles.cancelButton,
                            cancelButtonStyle
                        ]}
                        onPress={onCancel}
                    >
                        <AppText style={[
                            styles.buttonText,
                            styles.cancelButtonText,
                            cancelButtonTextStyle
                        ]}>
                            Cancel
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.buttonContainer,
                            styles.confirmButton,
                            confirmButtonStyle
                        ]}
                        onPress={() => onSubmit(values)}
                    >
                        <AppText style={[
                            styles.buttonText,
                            styles.confirmButtonText,
                            confirmButtonTextStyle
                        ]}>
                            {confirmText}
                        </AppText>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999
    },
    alertBox: {
        backgroundColor: colors.cardBackground,
        width: "85%",
        maxWidth: 400,
        alignSelf: "center",
        padding: 0,
        borderRadius: 20,
        maxHeight: "50%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
        marginBottom: 350
    },
    header: {
        paddingHorizontal: 18,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    titleContainer: {
        marginBottom: 12,
    },
    title: {
        color: 'white',
        fontWeight: "700",
        fontSize: scaleFont(22),
        marginBottom: 8,
    },
    titleLine: {
        width: 40,
        height: 3,
        backgroundColor: colors.main,
        borderRadius: 2,
    },
    text: {
        color: colors.mutedText,
        fontSize: scaleFont(14),
    },
    inputsContainer: {
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 15
    },
    inputWrapper: {
        marginTop: 15,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        color: 'white',
        borderRadius: 12,
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        padding: 15,
        fontSize: scaleFont(12),
        fontWeight: '500',
    },
    rowInputContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15
    },
    rowInputWrapper: {
        flex: 1,
        marginRight: 12 // spacing between inputs
    },
    rowInput: {
        marginHorizontal: 6
    },

    rowInputLast: {
        marginRight: 0
    },
    rowInputFirst: {
        marginLeft: 0
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingBottom: 18,
    },
    buttonContainer: {
        alignItems: "center",
        borderRadius: 14,
        minHeight: 52,
        width: '48%',
        justifyContent: 'center'
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(26, 26, 26, 1)',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    confirmButton: {
        backgroundColor: colors.main,
        borderWidth: 1,
        borderColor: colors.main,
    },
    buttonText: {
        fontSize: scaleFont(15),
        textAlign: 'center',
    },
    cancelButtonText: {
        color: colors.mutedText,
    },
    confirmButtonText: {
        color: 'white',
    },
    largeTextInput: {
        minHeight: 100,
        textAlignVertical: 'top', // ensures text starts from the top
        paddingTop: 15,
        paddingBottom: 15,
    }
});