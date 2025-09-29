import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function ProgressDots({
  steps = [],
  activeColor = 'rgb(0,140,255)',
  inactiveColor = '#444',
  activeSize = 12,
  inactiveSize = 8,
}) {
  const animations = useRef(steps.map(() => new Animated.Value(inactiveSize))).current;

  useEffect(() => {
    steps.forEach((isActive, index) => {
      Animated.spring(animations[index], {
        toValue: isActive ? activeSize : inactiveSize,
        useNativeDriver: false,
        speed: 20,
        bounciness: 10,
      }).start();
    });
  }, [steps]);

  return (
    <View style={styles.dotsContainer}>
      {steps.map((isActive, index) => (
        <View key={index} style={styles.dotWrapper}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: isActive ? activeColor : inactiveColor,
                width: animations[index],
                height: animations[index],
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
 dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dotWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 999,
  },
});