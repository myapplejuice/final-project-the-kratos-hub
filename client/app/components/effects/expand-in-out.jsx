import React, { useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet, LayoutAnimation, UIManager, Platform } from "react-native";

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function ExpandInOut({
    visible,
    initialVisible = false,
    inDuration = 300,
    outDuration = 300,
    removeWhenHidden = false,
    collapseWhenHidden = false,
    style,
    children,
}) {
    const [contentHeight, setContentHeight] = useState(0);
    const heightAnim = useRef(new Animated.Value(initialVisible ? 0 : 0)).current;
    const [shouldRender, setShouldRender] = useState(initialVisible || visible);

    useEffect(() => {
        if (visible) setShouldRender(true);

        Animated.timing(heightAnim, {
            toValue: visible ? contentHeight : 0,
            duration: visible ? inDuration : outDuration,
            useNativeDriver: false, // height can't use native driver
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
            <View
                style={styles.inner}
                onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
            >
                {children}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    inner: { position: 'relative', width: '100%' },
});
