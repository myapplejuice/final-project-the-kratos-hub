import React, { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export default function FadeInOut({
    visible,
    initialVisible = false,
    inDuration = 300,
    outDuration = 300,
    removeWhenHidden = false,
    collapseWhenHidden = false,
    style,
    children,
}) {
    const opacity = useRef(new Animated.Value(initialVisible ? 1 : 0)).current;
    const [shouldRender, setShouldRender] = useState(initialVisible || visible);

    useEffect(() => {
        if (visible) setShouldRender(true);

        Animated.timing(opacity, {
            toValue: visible ? 1 : 0,
            duration: visible ? inDuration : outDuration,
            useNativeDriver: true,
        }).start(() => {
            if (!visible && removeWhenHidden) {
                setShouldRender(false);
            }
        });
    }, [visible]);

    if (!shouldRender) return null;

    return (
        <Animated.View
            style={[
                style,
                { opacity },
                !visible && collapseWhenHidden ? { width: 0, height: 0 } : null,
            ]}
            pointerEvents={!visible ? "none" : "auto"}
        >
            {children}
        </Animated.View>
    );
}