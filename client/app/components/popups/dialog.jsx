import React from "react";
import { Animated, View, StyleSheet, Text, TouchableOpacity, Platform } from "react-native";
import { scaleFont } from "../../common/utils/scale-fonts";
import usePopupAnimation from "./popup-animation";
import { colors } from "../../common/settings/styling";
import AppText from "../screen-comps/app-text";

export default function Dialog({ title = "", text = "", onAbort = () => { }, onConfirm = () => { }, abortText = "Cancel", confirmText = "Yes" }) {
    const { opacity, translateY } = usePopupAnimation();

    return (
        <Animated.View style={[styles.overlay, { opacity }]}>
            <Animated.View style={[styles.alertBox, { transform: [{ translateY }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <AppText style={styles.title}>{title}</AppText>
                        <View style={styles.titleLine} />
                    </View>
                    <AppText style={styles.text}>{text}</AppText>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.buttonContainer, styles.cancelButton]}
                        onPress={onAbort}
                    >
                        <AppText style={[styles.buttonText, styles.cancelButtonText]}>
                            {abortText}
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buttonContainer, styles.confirmButton]}
                        onPress={onConfirm}
                    >
                        <AppText style={[styles.buttonText, styles.confirmButtonText]}>
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
        zIndex: 9999,
    },
    alertBox: {
        backgroundColor: colors.cardBackground,
        width: "85%",
        maxWidth: 400,
        borderRadius: 20,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    header: {
        paddingHorizontal: 18,
        paddingTop: 24,
        paddingBottom: 16,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    titleContainer: {
        marginBottom: 12,
    },
    title: {
        color: "white",
        fontWeight: "700",
        fontSize: scaleFont(20),
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
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
    },
    buttonContainer: {
        alignItems: "center",
        borderRadius: 15,
        minHeight: 50,
        width: "48%",
        justifyContent: "center",
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        backgroundColor: "rgba(26, 26, 26, 1)",
    },
    confirmButton: {
        backgroundColor: colors.main,
        borderWidth: 1,
        borderColor: colors.main,
    },
    buttonText: {
        fontSize: scaleFont(15),
        textAlign: "center",
    },
    cancelButtonText: {
        color: colors.mutedText,
    },
    confirmButtonText: {
        color: "white",
    },
});