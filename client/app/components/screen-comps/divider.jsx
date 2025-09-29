import React from 'react';
import { View } from 'react-native';
import { colors } from '../../utils/settings/styling';

export default function Divider({
  orientation = 'vertical', // 'vertical' or 'horizontal'
  color = colors.divider,
  thickness = 1,
  length = '100%', // can be number or '100%'
  style = {}
}) {
  const dividerStyle =
    orientation === 'vertical'
      ? { width: thickness, height: length, backgroundColor: color, borderRadius: 20 }
      : { height: thickness, width: length, backgroundColor: color, borderRadius: 20 };

  return <View style={[dividerStyle, style]} />;
}
