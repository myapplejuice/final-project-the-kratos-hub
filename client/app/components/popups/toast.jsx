import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Dimensions } from "react-native";
import { scaleFont } from "../../utils/scale-fonts";
import AppText from "../screen-comps/app-text";
import { colors } from "../../utils/settings/styling";

const { height, width } = Dimensions.get("window");

export default function Toast({ message = "", onFinish = () => {} }) {
  const translateY = useRef(new Animated.Value(50)).current; // start below
  const opacityAnim = useRef(new Animated.Value(0)).current; // start transparent

  useEffect(() => {
    // Fade in + move up
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(onFinish);
      }, 2000);
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
          opacity: opacityAnim,
        },
      ]}
    >
      <AppText style={styles.toastText}>{message}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: -100, // position from bottom
    left: width * 0.1,
    width: width * 0.8,
    backgroundColor: "#008cffde",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    zIndex: 9999,
    alignItems: "center",
  },
  toastText: {
    color: "#fff",
    fontSize: scaleFont(16),
    textAlign: "center",
  },
});
