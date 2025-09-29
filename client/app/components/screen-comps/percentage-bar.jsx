import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import AppText from './app-text';
import { colors } from '../../utils/settings/styling';

export default function PercentageBar({
  values = [],
  barHeight = 20,
  barWidth = '100%',
  showPercentage = true,
  containerStyle,
  barContainerStyle,
  segmentStyle,
  titleTextStyle,
  percentageTextStyle,
  minVisiblePercentage = 12,
  fadeDuration = 300,
}) {
  const totalEntered = values.reduce((sum, item) => sum + (item.percentage || 0), 0);
  const emptyPercentage = Math.max(0, 100 - totalEntered);

  const allZero = totalEntered === 0;

  // Refs for animations (skip animations if allZero)
  const opacityTitleRefs = useRef(
    values.map(item =>
      Array.isArray(item.title)
        ? item.title.map(() => new Animated.Value(allZero ? 0 : 1))
        : [new Animated.Value(allZero ? 0 : 1)]
    )
  ).current;

  const opacityPercentageRefs = useRef(
    values.map(item =>
      Array.isArray(item.percentageText)
        ? item.percentageText.map(() => new Animated.Value(allZero ? 0 : 1))
        : [new Animated.Value(allZero ? 0 : 1)]
    )
  ).current;

  useEffect(() => {
    if (allZero) return; // don't animate if all are zero

    values.forEach((item, index) => {
      const widthPercent = (item.percentage / totalEntered) * (100 - emptyPercentage);

      // Titles
      const titles = Array.isArray(item.title)
        ? item.title
        : [{ text: item.title, fadeOnCompress: true }];

      titles.forEach((part, i) => {
        const shouldBeVisible = part.fadeOnCompress !== false && widthPercent < minVisiblePercentage ? 0 : 1;
        Animated.timing(opacityTitleRefs[index][i], {
          toValue: shouldBeVisible,
          duration: fadeDuration,
          useNativeDriver: true,
        }).start();
      });

      // Percentages
      const percentages = Array.isArray(item.percentageText)
        ? item.percentageText
        : [{ text: `${Math.round(item.percentage)}%`, fadeOnCompress: true }];

      percentages.forEach((part, i) => {
        const shouldBeVisible = part.fadeOnCompress !== false && widthPercent < minVisiblePercentage ? 0 : 1;
        Animated.timing(opacityPercentageRefs[index][i], {
          toValue: shouldBeVisible,
          duration: fadeDuration,
          useNativeDriver: true,
        }).start();
      });
    });
  }, [values, totalEntered, emptyPercentage, allZero]);

  return (
    <View style={[styles.container, containerStyle, { width: barWidth }]}>
      {/* Titles */}
      {!allZero && (
        <View style={styles.labelsRow}>
          {values.map((item, index) => {
            const widthPercent = (item.percentage / totalEntered) * (100 - emptyPercentage);
            const titles = Array.isArray(item.title) ? item.title : [{ text: item.title, fadeOnCompress: true }];

            return (
              <View
                key={index}
                style={{
                  flex: widthPercent,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  minWidth: 0,
                  overflow: 'visible',
                }}
              >
                {titles.map((part, i) => (
                  <Animated.View key={i} style={{ opacity: opacityTitleRefs[index][i] }}>
                    <AppText style={[styles.title, titleTextStyle, { color: item.color }]} numberOfLines={1}>
                      {part.text}
                    </AppText>
                  </Animated.View>
                ))}
              </View>
            );
          })}
          {emptyPercentage > 0 && <View style={{ flex: emptyPercentage }} />}
        </View>
      )}

      {/* Bar */}
      <View
        style={[
          styles.barContainer,
          barContainerStyle,
          { height: barHeight, maxWidth: '100%', backgroundColor: colors.emptyBar },
        ]}
      >
        {!allZero &&
          values.map((item, index) => {
            const widthPercent = (item.percentage / totalEntered) * (100 - emptyPercentage);
            return (
              <View
                key={index}
                style={[
                  { flex: widthPercent, backgroundColor: item.color || '#3498db', height: '100%' },
                  segmentStyle,
                ]}
              />
            );
          })}
        {emptyPercentage > 0 && <View style={{ flex: emptyPercentage, backgroundColor: colors.emptyBar }} />}
      </View>

      {/* Percentages */}
      {showPercentage && (
        <View style={[styles.labelsRow, { marginTop: 2 }]}>
          {allZero ? (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <AppText style={[styles.percentage, percentageTextStyle]}>0%</AppText>
            </View>
          ) : (
            values.map((item, index) => {
              const widthPercent = (item.percentage / totalEntered) * (100 - emptyPercentage);
              const percentages = Array.isArray(item.percentageText)
                ? item.percentageText
                : [{ text: `${Math.round(item.percentage)}%`, fadeOnCompress: true }];

              return (
                <View
                  key={index}
                  style={{
                    flex: widthPercent,
                    alignItems: 'center',
                    minWidth: 0,
                    overflow: 'visible',
                  }}
                >
                  {percentages.map((part, i) => (
                    <Animated.View key={i} style={{ opacity: opacityPercentageRefs[index][i] }}>
                      <AppText style={[styles.percentage, percentageTextStyle]} numberOfLines={1}>
                        {part.text}
                      </AppText>
                    </Animated.View>
                  ))}
                </View>
              );
            })
          )}
          {emptyPercentage > 0 && !allZero && <View style={{ flex: emptyPercentage }} />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'column' },
  barContainer: { flexDirection: 'row', borderRadius: 4, overflow: 'hidden' },
  labelsRow: { flexDirection: 'row' },
  title: { fontSize: 12, fontWeight: '600' },
  percentage: { fontSize: 10, color: '#555' },
});