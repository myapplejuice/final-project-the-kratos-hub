import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppText from './app-text';

export default function MultiValueBars({ data = [], barHeight = 20, showPercentage = true, style, textStyle, percentageTextStyle }) {
  // Sum of values to calculate relative width if percentages not provided
  const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <View style={[styles.container, style]}>
      {data.map((item, index) => {
        const widthPercent = item.percentage ?? ((item.value / totalValue) * 100);
        return (
          <View key={index} style={styles.row}>
            {item.title && <AppText style={[styles.title, textStyle]}>{item.title}</AppText>}
            <View style={[styles.barContainer, { height: barHeight }]}>
              <View
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: item.color || '#3498db',
                  height: '100%',
                  borderRadius: 4,
                }}
              />
            </View>
            {showPercentage && (
              <AppText style={[styles.percentage, percentageTextStyle]}>{Math.round(widthPercent)}%</AppText>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    width: 100,
    fontSize: 14,
    marginRight: 8,
  },
  barContainer: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  percentage: {
    width: 40,
    fontSize: 14,
    textAlign: 'right',
  },
});
