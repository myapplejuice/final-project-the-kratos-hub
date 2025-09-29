import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Circle as SvgCircle } from "react-native-svg";

export default function PercentageCircle({
  size = 200,
  segments = [],
  text = false,
  centerColor = "#000",
  innerRadiusRatio = 0.5,
}) {
  const radius = (size - 2) / 2; // leave 1px padding
  const innerRadius = radius * innerRadiusRatio;
  const degToRad = (deg) => (deg * Math.PI) / 180;
  const percentToAngle = (percent) => (percent / 100) * 2 * Math.PI;

  const paths = [];
  let startAngle = 0;

  segments.forEach((seg, index) => {
    if (seg.percentage <= 0) return; // skip 0% slices

    // Full circle: use Circle if percentage >= 99.999
    if (seg.percentage >= 99.999) {
      paths.push(
        <SvgCircle
          key={index}
          cx={radius + 1}
          cy={radius + 1}
          r={radius}
          fill={seg.color}
        />
      );
      return;
    }

    const angle = percentToAngle(seg.percentage);
    const endAngle = startAngle + angle;

    const x1 = radius + radius * Math.cos(startAngle);
    const y1 = radius + radius * Math.sin(startAngle);
    const x2 = radius + radius * Math.cos(endAngle);
    const y2 = radius + radius * Math.sin(endAngle);

    const largeArcFlag = seg.percentage > 50 ? 1 : 0;

    const pathData = `
      M ${radius} ${radius}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      Z
    `;

    paths.push(<Path key={index} d={pathData} fill={seg.color} />);
    startAngle += angle;
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {paths}
        {/* Inner circle */}
        <SvgCircle cx={radius} cy={radius} r={innerRadius} fill={centerColor} />
      </Svg>
      {text && (
        <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontWeight: "bold", fontSize: 18, color: "#fff" }}>
            {segments.reduce((sum, s) => sum + s.percentage, 0)}%
          </Text>
        </View>
      )}
    </View>
  );
}