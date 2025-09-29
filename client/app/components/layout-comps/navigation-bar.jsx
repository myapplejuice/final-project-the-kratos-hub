import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import React from "react";
import { colors } from "../../utils/settings/styling";
import { Images } from "../../utils/assets";
import { routes } from "../../utils/settings/constants";

export default function NavigationBar({ visible }) {
    const insets = useSafeAreaInsets();
    const screen = usePathname();
    const lastPress = React.useRef(0);

    const translateY = useSharedValue(0);

    React.useEffect(() => {
        translateY.value = withSpring(visible ? 0 : 150, {
            damping: 50,   // higher damping = less bounce
            stiffness: 150, // adjust speed
            mass: 1,       // optional, default 1
        });
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const navItems = [
        { key: "home", route: routes.HOMEPAGE, icon: Images.home, iconInactive: Images.noHome },
        { key: "goals", route: routes.GOALS, icon: Images.goals, iconInactive: Images.noGoals },
        { key: "meals", route: routes.NUTRITION_HUB, icon: Images.nutrition, iconInactive: Images.nutritionOutline },
        { key: "workouts", route: routes.TRAINING_HUB, icon: Images.workouts, iconInactive: Images.noWorkouts },
    ];

    function handleNav(target) {
        const now = Date.now();
        if (now - lastPress.current < 500) return;
        lastPress.current = now;

        if (screen === target) return;

        const isOnMain = screen === routes.HOMEPAGE;
        const isNavToMain = target === routes.HOMEPAGE;

        if (isOnMain) router.push(target);
        else if (isNavToMain) router.back();
        else router.replace(target);
    }

    return (
        <Animated.View style={[styles.container, { bottom: insets.bottom + 15 }, animatedStyle]}>
            <LinearGradient
                colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.8)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {navItems.map((item) => {
                const isActive = screen === item.route;
                return (
                    <TouchableOpacity
                        key={item.key}
                        style={styles.buttonWrapper}
                        onPress={() => handleNav(item.route)}
                    >
                        <View style={styles.iconContainer}>
                            {isActive && <View style={styles.activeOverlay} />}
                            <Image
                                source={isActive ? item.icon : item.iconInactive}
                                style={styles.icon}
                            />
                        </View>
                    </TouchableOpacity>
                );
            })}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 15,
        right: 15,
        backgroundColor: "transparent",
        zIndex: 9999,
        flexDirection: "row",
        justifyContent: "center",
        borderRadius: 70,
        alignItems: "center",
        overflow: "hidden",
        height: 60,
        borderWidth: 1,
        borderColor: colors.main + "30"
    },
    buttonWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    iconContainer: {
        width: 70,
        height: 40,
        borderRadius: 35,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    activeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.main + "44",
        borderRadius: 35,
    },
    icon: {
        width: 25,
        height: 25,
        tintColor: colors.main,
    },
});