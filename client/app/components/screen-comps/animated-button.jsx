import { useRef } from 'react';
import { scaleFont } from "../../common/utils/scale-fonts";
import AppText from './app-text';

import {
    Animated,
    TouchableWithoutFeedback,
    Text,
    StyleSheet,
    Image,
    View
} from 'react-native';

export default function AnimatedButton({
    title,
    onPress,
    style,
    textStyle,
    disabled = false,
    disabledAffectStyle = true,
    leftImage,
    rightImage,
    leftImageStyle,
    rightImageStyle,
    leftImageContainerStyle,
    rightImageContainerStyle,
}) {
    const scale = useRef(new Animated.Value(1)).current;
    const deafen = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();

        Animated.spring(deafen, {
            toValue: 0.50,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();

        Animated.spring(deafen, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={disabled}
        >
            <Animated.View
                style={[
                    styles.button,
                    style,
                    { transform: [{ scale }], flexDirection: 'row' },
                    disabled && disabledAffectStyle && styles.disabled,
                ]}
            >
                {leftImage && (
                    <View style={[leftImageContainerStyle]}>
                        <Image source={leftImage} style={[{ width: 18, height: 18, tintColor: 'white' }, leftImageStyle]} />
                    </View>
                )}
                <AppText style={[styles.text, textStyle]}>
                    {title}
                </AppText>
                {rightImage && (
                    <View style={[rightImageContainerStyle]}>
                        <Image source={rightImage} style={[{ width: 18, height: 18, tintColor: 'white' }, rightImageStyle]} />
                    </View>
                )}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'rgb(26, 26, 27)',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
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