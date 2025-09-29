import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;  
const BASE_HEIGHT = 667;

// OLD FUNCTION USE IF WANT TO REVERT
export function scaleFont(size) {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

//export function scaleFont(size, factor = 0.5) {
//  const scaleWidth = SCREEN_WIDTH / BASE_WIDTH;
//  const scaleHeight = SCREEN_HEIGHT / BASE_HEIGHT;
//
//  // Combine width & height scaling
//  const scale = scaleWidth * (1 - factor) + scaleHeight * factor;
//
//  const newSize = size * scale;
//
//  return Math.round(PixelRatio.roundToNearestPixel(newSize));
//}

// Optional: clamp font size
//export function scaleFontClamped(size, min = 10, max = 40, factor = 0.5) {
//  return Math.min(Math.max(scaleFont(size, factor), min), max);
//}