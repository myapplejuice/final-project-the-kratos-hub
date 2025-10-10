import { useMemo } from 'react';
import { Image, Dimensions, StyleSheet } from 'react-native';
import { Images } from '../../common/settings/assets';
import { colors } from '../../common/settings/styling';

export default function StaticIcons({ color = colors.main }) {
  const staticGymIcons = useMemo(() => [
    { source: Images.icon1, left: 30, top: 30 + 50 },
    { source: Images.icon2, left: 250, top: 40 + 50 },
    { source: Images.icon3, left: 330, top: 46 + 50 },
    { source: Images.icon4, left: 120, top: 62 + 50 },

    { source: Images.icon5, left: 70, top: 99 + 3 + 50 },
    { source: Images.icon6, left: 270, top: 114 + 3 + 50 },
    { source: Images.icon7, left: 340, top: 130 + 3 + 50 },
    { source: Images.icon8, left: 20, top: 146 + 3 + 50 },

    { source: Images.icon9, left: 230, top: 167 + 5 + 50 },
    { source: Images.icon10, left: 300, top: 183 + 5 + 50 },
    { source: Images.icon11, left: 90, top: 199 + 5 + 50 },
    { source: Images.icon12, left: 140, top: 215 + 5 + 50 },

    { source: Images.icon13, left: 20, top: 236 + 8 + 50 },
    { source: Images.icon14, left: 200, top: 252 + 8 + 50 },
    { source: Images.icon15, left: 350, top: 268 + 8 + 50 },
    { source: Images.icon16, left: 30, top: 284 + 8 + 50 },

    { source: Images.icon17, left: 260, top: 304 + 10 + 50 },
    { source: Images.icon18, left: 100, top: 280 + 10 + 50 },
    { source: Images.icon19, left: 320, top: 336 + 10 + 50 },
    { source: Images.icon20, left: 180, top: 302 + 10 + 50 },

    { source: Images.icon21, left: 100, top: 373 + 13 + 50 },
    { source: Images.icon22, left: 30, top: 369 + 13 + 50 },
    { source: Images.icon23, left: 250, top: 405 + 13 + 50 },
    { source: Images.icon24, left: 170, top: 340 + 13 + 50 },

    { source: Images.icon25, left: 330, top: 441 + 15 + 50 },
    { source: Images.icon26, left: 180, top: 407 + 15 + 50 },
    { source: Images.icon27, left: 20, top: 430 + 15 + 50 },
    { source: Images.icon28, left: 100, top: 430 + 15 + 50 },
    { source: Images.icon29, left: 270, top: 350 + 15 + 50 },
  ], []);

  const maxLeft = useMemo(() => Math.max(...staticGymIcons.map(i => i.left)), [staticGymIcons]);
  const BASE_WIDTH = maxLeft + 20;
  const BASE_HEIGHT = 640;
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

  const canvasOffsetX = 10;
  const canvasOffsetY = 15;
  const scaleX = SCREEN_WIDTH / BASE_WIDTH;
  const scaleY = SCREEN_HEIGHT / BASE_HEIGHT;

  function relativeLeft(left) {
    const scaled = left * scaleX - canvasOffsetX;
    return Math.max(0, Math.min(scaled, SCREEN_WIDTH - 35));
  }

  function relativeTop(top) {
    const scaled = top * scaleY - canvasOffsetY;
    return Math.max(0, Math.min(scaled, SCREEN_HEIGHT - 35));
  }

  return staticGymIcons.map((icon, index) => (
    <Image
      key={index}
      source={icon.source}
      style={{
        position: 'absolute',
        zIndex: 1,
        left: relativeLeft(icon.left),
        top: relativeTop(icon.top),
        width: 35,
        height: 35,
        opacity: 0.2,
        tintColor: color,
      }}
    />
  ));
}
