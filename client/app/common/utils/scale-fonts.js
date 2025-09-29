import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;  

export function scaleFont(size) {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}