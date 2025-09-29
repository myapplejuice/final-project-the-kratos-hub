import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import AppText from "./app-text";
import { scaleFont } from "../../common/utils/scale-fonts";

export default function ProgressBar({
  title,
  current = 0,
  max = 100,
  unit = "",
  color = "#00C8FF",
  styleType = "header", // "header" | "inline"
  height = 10,
  width = "100%",
  borderRadius = 5,
  valueText,
  titleStyle,
  valueStyle,
  showText = true, // control text presence
}) {
  const percent = Math.min((current / max) * 100, 100);

  // Animated bar width
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: percent === 0 ? 0 : percent,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  return (
    <View style={{ width }}>
      {/* Header Text */}
      {styleType === "header" && showText && (
        <View style={styles.row}>
          <AppText style={[styles.title, titleStyle]}>{title}</AppText>
          <AppText style={[styles.value, { color }, valueStyle]}>
            {valueText ?? `${current} / ${max} ${unit}`}
          </AppText>
        </View>
      )}

      {/* Inline Title */}
      {styleType === "inline" && showText && (
        <AppText style={[styles.title, { textAlign: "center", marginBottom: 5 }, titleStyle]}>
          {title}
        </AppText>
      )}

      {/* Progress Bar */}
      <View
        style={{
          height,
          width: "100%",
          backgroundColor: "rgba(102,102,102,0.2)",
          borderRadius,
        }}
      >
        <Animated.View
          style={{
            height: "100%",
            width: barWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: color,
            borderRadius,
          }}
        />
      </View>

      {/* Inline Value */}
      {styleType === "inline" && showText && (
        <AppText style={[styles.value, { color, textAlign: "center", marginTop: 5 }, valueStyle]}>
          {valueText ?? `${current} / ${max} ${unit}`}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  title: {
    color: "#999",
    fontSize: scaleFont(10),
  },
  value: {
    fontSize: scaleFont(14),
    fontWeight: "600",
  },
});
