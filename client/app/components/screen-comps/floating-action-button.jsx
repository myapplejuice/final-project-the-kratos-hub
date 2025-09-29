import React, { useContext, useEffect, useRef } from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import { NavBarContext } from "../../utils/contexts/nav-bar-context";

export default function FloatingActionButton({
    icon,
    size = 60,
    style = {},
    onPress = () => { },
    iconSize = 24,
    iconStyle = {},
    position = { bottom: 20, right: 20 },
    visible = true,
    syncWithNavBar = false,
    enableFade = true,
    enableSlide = true,
    label = "",              // new prop
    labelStyle = {},         // new prop for custom styling
    labelSpacing = 8,        // space between icon and label
}) {
    const { navBarVisibility } = useContext(NavBarContext);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(enableFade ? 0 : 1)).current;
    const translateYAnim = useRef(new Animated.Value(enableSlide ? 20 : 0)).current;

    const targetVisible = visible && (!syncWithNavBar || navBarVisibility);
    const pointerEventsValue = targetVisible ? "auto" : "none";

    useEffect(() => {
        const animations = [];

        if (targetVisible) {
            if (enableFade) animations.push(Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }));
            if (enableSlide) animations.push(Animated.spring(translateYAnim, { toValue: 0, useNativeDriver: true }));
        } else {
            if (enableFade) animations.push(Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }));
            if (enableSlide) animations.push(Animated.timing(translateYAnim, { toValue: 20, duration: 200, useNativeDriver: true }));
        }

        Animated.parallel(animations).start();
    }, [targetVisible, enableFade, enableSlide]);

    const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    zIndex: 999,
                    ...position,
                    opacity: enableFade ? opacityAnim : 1,
                    transform: [
                        { translateY: enableSlide ? translateYAnim : 0 },
                        { scale: scaleAnim },
                    ],
                },
            ]}
            pointerEvents={pointerEventsValue}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.button, { width: size, height: size, borderRadius: size / 2 }, style]}
            >
                <Animated.View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                        source={icon}
                        style={{ width: iconSize, height: iconSize, tintColor: "white", ...iconStyle }}
                    />
                    {label ? (
                        <Animated.Text
                            style={[
                                { color: "white", marginLeft: labelSpacing, fontWeight: "600" },
                                labelStyle
                            ]}
                        >
                            {label}
                        </Animated.Text>
                    ) : null}
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});
