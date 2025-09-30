import React, { useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet } from "react-native";

export default function ExpandInOut({
    visible,
    inDuration = 300,
    outDuration = 300,
    removeWhenHidden = false,
    collapseWhenHidden = false,
    style,
    children,
}) {
    const [contentHeight, setContentHeight] = useState(0);
    const [shouldRender, setShouldRender] = useState(visible);

    const heightAnim = useRef(new Animated.Value(0)).current;

    // Animate when visible or contentHeight changes
    useEffect(() => {
        if (visible) setShouldRender(true);

        Animated.timing(heightAnim, {
            toValue: visible ? contentHeight : 0,
            duration: visible ? inDuration : outDuration,
            useNativeDriver: false,
        }).start(() => {
            if (!visible && removeWhenHidden) setShouldRender(false);
        });
    }, [visible, contentHeight]);

    if (!shouldRender) return null;

    return (
        <Animated.View
            style={[
                style,
                { height: heightAnim, overflow: 'hidden' },
                !visible && collapseWhenHidden ? { width: 0, height: 0 } : null,
            ]}
        >
            {/* Hidden View to measure content */}
            <View
                style={styles.measure}
                onLayout={(e) => {
                    const newHeight = e.nativeEvent.layout.height;
                    if (newHeight !== contentHeight) {
                        setContentHeight(newHeight);
                    }
                }}
            >
                {children}
            </View>

            {/* Visible content */}
            <View style={{ width: '100%' }}>{children}</View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    measure: {
        position: 'absolute',
        opacity: 0,
        width: '100%',
    },
});
