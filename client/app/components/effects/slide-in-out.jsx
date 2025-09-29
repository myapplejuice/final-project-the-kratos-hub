import React, { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export default function SlideInOut({
    visible,
    initialVisible = false,
    inDuration = 300,
    outDuration = 300,
    distance = 50,
    direction = "up", // "up" | "down" | "left" | "right"
    removeWhenHidden = false,
    collapseWhenHidden = false,
    style,
    children,
}) {
    function getOffset() {
        switch (direction) {
            case "up": return distance;
            case "down": return -distance;
            case "left": return distance;
            case "right": return -distance;
            default: return distance;
        }
    }

    const translate = useRef(
        new Animated.Value(initialVisible ? 0 : getOffset())
    ).current;
    const [shouldRender, setShouldRender] = useState(initialVisible || visible);

    useEffect(() => {
        if (visible) setShouldRender(true);

        Animated.timing(translate, {
            toValue: visible ? 0 : getOffset(),
            duration: visible ? inDuration : outDuration,
            useNativeDriver: true,
        }).start(() => {
            if (!visible && removeWhenHidden) {
                setShouldRender(false);
            }
        });
    }, [visible]);

    if (!shouldRender) return null;

    const transform =
        direction === "up" || direction === "down"
            ? [{ translateY: translate }]
            : [{ translateX: translate }];

    return (
        <Animated.View
            style={[
                style,
                { transform },
                !visible && collapseWhenHidden ? { width: 0, height: 0 } : null,
            ]}
            pointerEvents={!visible ? "none" : "auto"}
        >
            {children}
        </Animated.View>
    );
}