import React, { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export default function ScaleInOut({
    visible,
    initialVisible = false,
    inDuration = 300,
    outDuration = 300,
    from = 0.8,
    to = 1,
    removeWhenHidden = false,
    collapseWhenHidden = false,
    style,
    children,
}) {
    const scale = useRef(new Animated.Value(initialVisible ? to : from)).current;
    const [shouldRender, setShouldRender] = useState(initialVisible || visible);

    useEffect(() => {
        if (visible) setShouldRender(true);

        Animated.timing(scale, {
            toValue: visible ? to : from,
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
                { transform: [{ scale }] },
                !visible && collapseWhenHidden ? { width: 0, height: 0 } : null,
            ]}
            pointerEvents={!visible ? "none" : "auto"}
        >
            {children}
        </Animated.View>
    );
}