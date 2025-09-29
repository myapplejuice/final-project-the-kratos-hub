import { useEffect, useRef } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";
import { scaleFont } from "../../utils/scale-fonts";
import { colors } from "../../utils/settings/styling";
import AppText from "../screen-comps/app-text";

export default function Spinner({ text = "Please wait..." }) {
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotate, {
                toValue: 1,
                duration: 800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
            <AppText style={styles.text}>{text}</AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    spinner: {
        width: 50,
        height: 50,
        borderRadius: 30,
        borderWidth: 6,
        borderTopColor: colors.main,
        borderRightColor: colors.main + "80",
        borderBottomColor: colors.main + "40",
        borderLeftColor: "transparent",
        marginBottom: 15,
    },
    text: {
        fontSize: scaleFont(16),
        color: "white",
        fontWeight: "500",
        textAlign: "center",
    },
});

