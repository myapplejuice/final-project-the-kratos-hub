import { Animated, View, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { scaleFont } from "../../utils/scale-fonts";
import usePopupAnimation from "./popup-animation";
import { colors } from "../../utils/settings/styling";
import { useState } from "react";
import AppText from "../screen-comps/app-text";

export default function Options({
    title = "",
    current = "",
    options = [],
    onAbort = () => {},
    onConfirm = () => {},
    abortText = "CANCEL",
    confirmText = "SELECT",
}) {
    const { opacity, translateY } = usePopupAnimation();
    const [selected, setSelected] = useState(current);

    return (
        <Animated.View style={[styles.overlay, { opacity }]}>
            <Animated.View style={[styles.box, { transform: [{ translateY }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <AppText style={styles.title}>{title}</AppText>
                        <View style={styles.titleLine} />
                    </View>
                </View>

                {/* Options */}
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                    {options.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.optionCard,
                                selected === opt && styles.optionSelected,
                            ]}
                            onPress={() => setSelected(opt)}
                            activeOpacity={0.8}
                        >
                            <AppText style={styles.optionText}>{opt}</AppText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Footer buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.buttonContainer, styles.confirmButton]}
                        onPress={() => onConfirm(selected)}
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
    box: {
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
        paddingBottom: 12,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    titleContainer: {
        marginBottom: 8,
    },
    title: {
        color: "white",
        fontWeight: "700",
        fontSize: scaleFont(20),
        marginBottom: 6,
    },
    titleLine: {
        width: 40,
        height: 3,
        backgroundColor: colors.main,
        borderRadius: 2,
    },
    scroll: {
        maxHeight: 260,
        paddingHorizontal: 15,
        marginTop: 20
    },
    optionCard: {
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginVertical: 5,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    optionSelected: {
        backgroundColor: colors.main + "25",
        borderColor: colors.main,
    },
    optionText: {
        fontSize: scaleFont(15),
        color: "white",
        fontWeight: "500",
        textAlign: "center",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 15,
    },
    buttonContainer: {
        borderRadius: 15,
        minHeight: 50,
        width: "100%",
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
