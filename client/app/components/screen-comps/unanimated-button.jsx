import { useRef } from 'react';
import { scaleFont } from '../../common/utils/scale-fonts'
import AppText from './app-text';
import { Animated, TouchableWithoutFeedback, StyleSheet, Image, } from 'react-native';

export default function UnAnimatedButton({
    title,
    onPress,
    style,
    textStyle,
    disabled = false,
    disabledAffectStyle = true,
    leftImage,
    rightImage,
}) {
    const isDeafenInStyle = style?.some(styleElement => styleElement && styleElement.opacity !== undefined);
    const scale = useRef(new Animated.Value(1)).current;
    const deafen = useRef(new Animated.Value(1)).current;
    const combinedTransforms = [{ scale }];
    if (style?.transform) {
        combinedTransforms.push(...style.transform);
    }

    const handlePressIn = () => {
        Animated.timing(deafen, { toValue: 0.5, duration: 100, useNativeDriver: true }).start();
    };
    const handlePressOut = () => {
        Animated.timing(deafen, { toValue: 1, duration: 100, useNativeDriver: true }).start();
    };

    const styles = StyleSheet.create({
        button: {
            backgroundColor: 'rgb(26, 26, 27)',
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center'
        },
        text: {
            color: 'white',
            fontSize: scaleFont(16),
            fontWeight: 'bold',
        },
        disabled: {
            opacity: 0.5,
        },
    });

    return (
        <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={disabled}
        >
            <Animated.View
                style={[styles.button, style, disabled && disabledAffectStyle && styles.disabled,]}
            >
                {leftImage && (<Image source={leftImage} style={{ width: 18, height: 18, marginRight: 8, tintColor: 'white' }} />)}
                <AppText style={[styles.text, textStyle]}>
                    {title}
                </AppText>
                {rightImage && (<Image source={rightImage} style={{ width: 18, height: 18, marginLeft: 8, tintColor: 'white' }} />)}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}
