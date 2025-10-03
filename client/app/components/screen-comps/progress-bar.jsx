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
  showWarningText = false, // control warning text visibility
  warningText = "Limit Exceeded",
  warningTextStyle,
  warningTextColor = "red",
}) {
  const percent = Math.min((current / max) * 100, 100);

  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: percent === 0 ? 0 : percent,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const isExceeded = current > max;

  return (
    <View style={{ width }}>
      {/* Header Style */}
      {styleType === "header" && showText && (
        <View style={styles.row}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppText style={[styles.title, titleStyle]}>{title}</AppText>
            {showWarningText && isExceeded && (
              <AppText
                style={[
                  { marginLeft: 5, color: warningTextColor, fontSize: scaleFont(10) },
                  warningTextStyle,
                ]}
              >
                {warningText}
              </AppText>
            )}
          </View>
          <AppText style={[styles.value, { color }, valueStyle]}>
            {valueText ?? `${current} / ${max} ${unit}`}
          </AppText>
        </View>
      )}

      {/* Inline Style */}
      {styleType === "inline" && showText && (
        <View style={{ alignItems: "center", marginBottom: 5 }}>
          <AppText style={[styles.title, titleStyle]}>{title}</AppText>
          {showWarningText && isExceeded && (
            <AppText
              style={[
                { color: warningTextColor, fontSize: scaleFont(10), marginTop: 2 },
                warningTextStyle,
              ]}
            >
              {warningText}
            </AppText>
          )}
        </View>
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
