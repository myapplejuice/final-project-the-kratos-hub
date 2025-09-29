import React from "react";
import { Animated, StyleSheet, TouchableOpacity, Platform, View } from "react-native";
import { scaleFont } from "../../utils/scale-fonts";
import usePopupAnimation from "./popup-animation";
import { colors } from "../../utils/settings/styling";
import AppText from "../screen-comps/app-text";

export default function Alert({
    title = "Alert",
    text = "Something happened.",
    onPress = () => {},
    buttonText = "OK"
}) {
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

                {/* Single Action Button */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.buttonContainer, styles.confirmButton]}
                        onPress={onPress}
                    >
                        <AppText style={[styles.buttonText, styles.confirmButtonText]}>
                            {buttonText}
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
        padding:15,
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
        justifyContent: "flex-end",
        padding:15,
    },
    buttonContainer: {
        alignItems: "center",
        borderRadius: 14,
        minHeight: 50,
        width: "100%",
        justifyContent: "center",
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
    confirmButtonText: {
        color: "white",
    },
});
