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
    const [measured, setMeasured] = useState(false);
    const [shouldRender, setShouldRender] = useState(visible);

    const heightAnim = useRef(new Animated.Value(0)).current;

    // Animate when visible changes
    useEffect(() => {
        if (visible) setShouldRender(true);

        if (measured) {
            Animated.timing(heightAnim, {
                toValue: visible ? contentHeight : 0,
                duration: visible ? inDuration : outDuration,
                useNativeDriver: false,
            }).start(() => {
                if (!visible && removeWhenHidden) setShouldRender(false);
            });
        }
    }, [visible, contentHeight, measured]);

    // Hidden measurement render (only for measuring height)
    const measureContent = !measured && (
        <View
            style={styles.measure}
            onLayout={(e) => {
                setContentHeight(e.nativeEvent.layout.height);
                setMeasured(true);
                heightAnim.setValue(visible ? e.nativeEvent.layout.height : 0);
            }}
        >
            {children}
        </View>
    );

    if (!shouldRender) return measureContent || null;

    return (
        <Animated.View
            style={[
                style,
                { height: heightAnim, overflow: 'hidden' },
                !visible && collapseWhenHidden ? { width: 0, height: 0 } : null,
            ]}
        >
            {/* Actual visible content */}
            {measured && <View style={{ width: '100%' }}>{children}</View>}
            {/* Measurement content (only shows once if needed) */}
            {measureContent}
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
