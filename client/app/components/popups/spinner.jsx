import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";
import { scaleFont } from "../../common/utils/scale-fonts";
import { colors } from "../../common/settings/styling";
import AppText from "../screen-comps/app-text";
import AnimatedButton from "../screen-comps/animated-button";
import FadeInOut from "../effects/fade-in-out";

export default function Spinner({ text = "Please wait...", timerDuration = 5000, abandonable = false, onHide = () => { } }) {
    const rotate = useRef(new Animated.Value(0)).current;
    const [button, setButton] = useState(false);
    const [fallbackText, setFallbackText] = useState(false);
    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });


    useEffect(() => {
        Animated.loop(
            Animated.timing(rotate, {
                toValue: 1,
                duration: 800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        const timer = setTimeout(() => {
            if (abandonable) {
                setButton(true);
            }
            setFallbackText(true);
        }, timerDuration);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.overlay}>
            <View style={{ flex: 1.3, justifyContent: 'flex-end', alignItems: 'center' }}>
                <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
                <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'center', height: 60 }}>
                    <FadeInOut visible={!fallbackText} inDuration={0} style={{ position: 'absolute' }}>
                        <AppText style={styles.text}>{text}</AppText>
                    </FadeInOut>
                    <FadeInOut visible={fallbackText} style={{ position: 'absolute' }}>
                        <AppText style={styles.text}>
                            {`This is taking a little longer than usual...\n${abandonable ? 'Press "Hide" to continue using the app.' : 'Still working, please wait'}`}
                        </AppText>
                    </FadeInOut>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <FadeInOut visible={button} >
                    <AnimatedButton title={"Hide"} onPress={onHide} style={{ marginTop: 5, backgroundColor: colors.main + '90', padding: 10, width: 200 }} />
                </FadeInOut>
            </View>
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

