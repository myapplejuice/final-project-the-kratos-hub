import { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { scaleFont } from "../../utils/scale-fonts";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../utils/settings/styling";
import AppText from "../screen-comps/app-text";

export default function Selector({
    title = "",
    text = "",
    onCancel = () => { },
    onPressA = () => { },
    onPressB = () => { },
    optionAText = "Option A",
    optionBText = "Option B",
    onClose = () => { },
    cancelText = "Cancel"
}) {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(100)).current;

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
        ]).start();
    }, []);

    const styles = StyleSheet.create({
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "flex-end",
            alignItems: "center",
            zIndex: 99999,
        },
        alertBox: {
            backgroundColor: "rgb(24, 24, 24)",
            padding: 20,
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                },
                android: {
                    elevation: 10,
                },
            }),
            borderRadius: 30
        },
        title: {
            alignSelf: "flex-start",
            justifyContent: "flex-start",
            fontWeight: "bold",
            fontSize: scaleFont(20),
            color: colors.main,
        },
        text: {
            alignSelf: "flex-start",
            marginTop: 10,
            marginBottom: 15,
            color: "white",
            fontSize: scaleFont(12),
        },
        pressablesWrapper: {
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
        },
        pressableContainer: {
            marginVertical: 15,
            backgroundColor: colors.main,
            width: '48%',
            height: 50,
            borderRadius: 20,
            justifyContent: 'center'
        },
        pressable: {
            fontSize: scaleFont(12),
            textAlign: 'center',
            color: 'white'
        },
        cancelContainer: {
            backgroundColor: 'rgb(255, 58, 48)',
            borderColor: colors.main,
            height: 50,
            borderRadius: 20,
            justifyContent: 'center'
        },
        cancelPressable: {
            fontSize: scaleFont(12),
            textAlign: 'center',
            color: 'white'
        },
    });

    return (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={onClose}
            />
            <Animated.View style={[styles.alertBox, { transform: [{ translateY }] }]}>
                <SafeAreaView edges={["bottom"]}>
                    <AppText style={styles.title}>{title}</AppText>
                    <AppText style={styles.text}>{text}</AppText>
                    <View style={styles.pressablesWrapper}>
                        <TouchableOpacity style={styles.pressableContainer} onPress={onPressA}>
                            <AppText style={styles.pressable}>{optionAText}</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.pressableContainer} onPress={onPressB}>
                            <AppText style={styles.pressable}>{optionBText}</AppText>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.cancelContainer} onPress={onCancel}>
                        <AppText style={styles.cancelPressable}>{cancelText}</AppText>
                    </TouchableOpacity>
                </SafeAreaView>
            </Animated.View>
        </Animated.View>
    );
}
