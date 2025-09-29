import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import { Images } from '../../common/settings/assets';

export default function FloatingIconsC() {
    const OPACITY_COUNT = 29;
    const staticGymIcons = useMemo(() => [
        { source: Images.icon1, left: 30, top: 30 },
        { source: Images.icon2, left: 250, top: 40 },
        { source: Images.icon3, left: 330, top: 46 },
        { source: Images.icon4, left: 120, top: 62 },

        { source: Images.icon5, left: 70, top: 102 },
        { source: Images.icon6, left: 270, top: 117 },
        { source: Images.icon7, left: 340, top: 133 },
        { source: Images.icon8, left: 20, top: 149 },

        { source: Images.icon9, left: 230, top: 172 },
        { source: Images.icon10, left: 300, top: 188 },
        { source: Images.icon11, left: 90, top: 204 },
        { source: Images.icon12, left: 140, top: 220 },

        { source: Images.icon13, left: 20, top: 244 },
        { source: Images.icon14, left: 200, top: 260 },
        { source: Images.icon15, left: 300, top: 276 },
        { source: Images.icon16, left: 30, top: 292 },

        { source: Images.icon17, left: 260, top: 314 },
        { source: Images.icon18, left: 100, top: 290 },
        { source: Images.icon19, left: 320, top: 346 },
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
        return Math.max(0, Math.min(left, BASE_WIDTH) * scaleX - canvasOffsetX);
    }

    function relativeTop(top) {
        return Math.max(0, top * scaleY - canvasOffsetY);
    }

    // Manage current icon sources in state to enable swapping
    const [iconsState, setIconsState] = useState(staticGymIcons.map(icon => icon.source));

    // Store animated opacity refs per icon
    const opacities = useRef(staticGymIcons.map(() => new Animated.Value(0.2))).current;

    useEffect(() => {
        const interval = setInterval(() => {
            let i = Math.floor(Math.random() * iconsState.length);
            let j;
            do {
                j = Math.floor(Math.random() * iconsState.length);
            } while (j === i);

            // Fade out both icons
            Animated.parallel([
                Animated.timing(opacities[i], {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacities[j], {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setIconsState(prev => {
                    const newState = [...prev];
                    [newState[i], newState[j]] = [newState[j], newState[i]];
                    return newState;
                });

                Animated.parallel([
                    Animated.timing(opacities[i], {
                        toValue: 0.2, // fade back to base opacity
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacities[j], {
                        toValue: 0.2,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [iconsState, opacities]);

    return iconsState.map((source, index) => {
        // Floating animation (vertical oscillation)
        const floating = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const direction = index % 2 === 0 ? -10 : 10;

            Animated.loop(
                Animated.sequence([
                    Animated.timing(floating, {
                        toValue: direction,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(floating, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, []);

        return (
            <Animated.Image
                key={index}
                source={source}
                style={[
                    styles.floatingIcon,
                    {
                        left: relativeLeft(staticGymIcons[index].left),
                        top: relativeTop(staticGymIcons[index].top),
                        width: 35,
                        height: 35,
                        opacity: opacities[index],
                        transform: [{ translateY: floating }],
                    },
                ]}
            />
        );
    });
}

const styles = StyleSheet.create({
    floatingIcon: {
        position: 'absolute',
        zIndex: 0,
    },
});
