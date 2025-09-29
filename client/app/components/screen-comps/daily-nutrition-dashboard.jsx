import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Svg, {Circle} from "react-native-svg";
import Animated, { Easing, useSharedValue, useAnimatedProps, withTiming } from "react-native-reanimated";
import AppText from "../../components/screen-comps/app-text";
import { scaleFont } from "../../utils/scale-fonts";
import { colors, nutritionColors } from "../../utils/settings/styling";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DailyNutritionDashboard({ nutrition, preferences }) {
  const energyProgress = useSharedValue(0);
  const macros = [
    { label: "Carbohydrates", grams: nutrition.carbGramsRounded, rate: nutrition.carbRate, color: nutritionColors.carbs1 },
    { label: "Protein", grams: nutrition.proteinGramsRounded, rate: nutrition.proteinRate, color: nutritionColors.protein1 },
    { label: "Fat", grams: nutrition.fatGramsRounded, rate: nutrition.fatRate, color: nutritionColors.fat1 },
  ];

  const circleRadius = 60;
  const circumference = 2 * Math.PI * circleRadius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (energyProgress.value / 100) * circumference,
  }));

  useEffect(() => {
    // Animate energy progress (setEnergy / recommendedEnergy)
    const percent = Math.min((nutrition.setEnergyKcal / nutrition.recommendedEnergyKcal) * 100, 100);
    energyProgress.value = withTiming(percent, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [nutrition]);

  return (
    <View style={[styles.card, { padding: 20 }]}>
      <AppText style={{ fontSize: scaleFont(18), color: colors.mutedText, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Daily Nutrition Targets
      </AppText>

      {/* Circular Energy Gauge */}
      <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 25 }}>
        <Svg width={150} height={150}>
          <Circle
            cx={75}
            cy={75}
            r={circleRadius}
            stroke="rgba(102,102,102,0.2)"
            strokeWidth={12}
            fill="none"
          />
          <AnimatedCircle
            cx={75}
            cy={75}
            r={circleRadius}
            stroke={nutritionColors.energy1}
            strokeWidth={12}
            fill="none"
            strokeDasharray={`${circumference}, ${circumference}`}
            strokeLinecap="round"
            animatedProps={animatedProps}
            rotation="-90"
            originX={75}
            originY={75}
          />
        </Svg>
        <AppText style={{ position: 'absolute', fontSize: scaleFont(16), fontWeight: '600', color: nutritionColors.energy1 }}>
          {preferences.energyUnit === 'kcal' ? nutrition.setEnergyKcal + ' kcal' : nutrition.setEnergyKj + ' kJ'}
        </AppText>
        <AppText style={{ marginTop: 5, fontSize: scaleFont(10), color: colors.mutedText }}>Total Daily Energy</AppText>
      </View>

      {/* Horizontal Macro Bars */}
      {macros.map((macro, idx) => (
        <View key={idx} style={{ marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>{macro.label}</AppText>
            <AppText style={{ color: macro.color, fontWeight: '600' }}>{macro.grams} g</AppText>
          </View>
          <View style={{ height: 12, width: '100%', backgroundColor: 'rgba(102,102,102,0.2)', borderRadius: 6 }}>
            <View
              style={{
                height: '100%',
                width: `${macro.rate}%`,
                backgroundColor: macro.color,
                borderRadius: 6,
              }}
            />
          </View>
        </View>
      ))}

      <AppText style={{ fontSize: scaleFont(12), color: colors.mutedText, textAlign: 'center', marginTop: 10 }}>
        Macro Ratios by Total Daily Energy
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    margin: 15,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 5 },
      android: { elevation: 5 },
    }),
  },
});
