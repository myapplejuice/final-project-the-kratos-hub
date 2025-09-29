import  { useRef } from 'react';
import { scaleFont } from '../../utils/scale-fonts'
import { Text, StyleSheet, Animated, TouchableWithoutFeedback, } from 'react-native';
import AppText from './app-text';

export default function TextButton({
  onPress,
  mainText,
  linkText,
  containerStyle,
  mainTextStyle,
  linkTextStyle,
  disabled = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
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
          styles.container,
          containerStyle,
          { transform: [{ scale }] },
          disabled && styles.disabled,
        ]}
      >
        <AppText style={[styles.mainText, mainTextStyle]}>
          {mainText}
          {linkText ? (
            <>
              {"\n"}
              <AppText style={[styles.linkText, linkTextStyle]}>{linkText}</AppText>
            </>
          ) : null}
        </AppText>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  mainText: {
    textAlign: 'center',
    color: 'rgb(255, 255, 255)',
  },
  disabled: {
    opacity: 0.5,
  },
});