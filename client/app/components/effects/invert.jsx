import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";

export default function Invert({
    inverted = false,
    duration = 300,
    axis = 'vertical',
    style,
    children,
}) {
    const anim = useRef(new Animated.Value(inverted ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: inverted ? 1 : 0,
            duration,
            useNativeDriver: true,
        }).start();
    }, [inverted]);

    // Map axis to transform
    const rotate = anim.interpolate({
        inputRange: [0, 1],
        outputRange: axis === 'vertical' ? ['0deg', '180deg'] : ['0deg', '180deg'],
    });

    const transform = axis === 'vertical' ? [{ rotateY: rotate }] : [{ rotateX: rotate }];

    return (
        <Animated.View style={[style, { transform }]}>
            {children}
        </Animated.View>
    );
}
