import { useContext, useEffect, useRef } from "react";
import { View,  StyleSheet,  TouchableOpacity,  Image,} from "react-native";
import { Images } from "../../common/settings/assets";
import { router, usePathname } from "expo-router";
import { colors } from "../../common/settings/styling";
import { UserContext } from "../../common/contexts/user-context";
import { scaleFont } from "../../common/utils/scale-fonts";
import { routes } from "../../common/settings/constants";
import AppText from '../screen-comps/app-text'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Animated } from "react-native";

export default function TopBar({ visible, hideInsetOnScroll = false }) {
    const { user } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const screen = usePathname();
    const topBarPosition = useRef(new Animated.Value(0)).current;
    const topBarOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(topBarPosition, {
            toValue: visible ? 0 : -45,
            duration: 300,
            useNativeDriver: true,
        }).start();
        Animated.timing(topBarOpacity, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const inMain = (
        screen === routes.HOMEPAGE ||
        screen === routes.TRAINING_HUB ||
        screen === routes.NUTRITION_HUB ||
        screen === routes.GOALS
    )

    const screenNames = {
        [routes.HOMEPAGE]: "Home",
        [routes.ABOUT]: "About",
        [routes.UNITS_CHANGE]: "Units & Formats",
        [routes.LEAN_BODY_MASS]: "Lean Body Mass",
        [routes.BODY_MASS_INDEX]: "Body Mass Index",
        [routes.TOTAL_DAILY_ENERGY_EXPENDITURE]: "Total Daily Energy Expenditure",
        [routes.BASAL_METABOLIC_RATE]: "Basal Metabolic Rate",
        [routes.BODY_FAT]: "Body Fat",
        [routes.EDIT_PROFILE]: "Edit Profile",
        [routes.PRIVACY_POLICY]: "Privacy Policy",
        [routes.TERMS_OF_SERVICE]: "Terms of Service",
        [routes.PROFILE]: "Profile",
        [routes.GOALS]: "Goals & Metrics",
        [routes.NUTRITION_HUB]: "Nutrition",
        [routes.TRAINING_HUB]: "Training",
        [routes.SETTINGS]: "Settings",
        [routes.EDIT_ACTIVITY]: "Update Activity Level",
        [routes.EDIT_WEIGHT_GOAL]: "Update Weight Goal",
        [routes.EDIT_DIET]: "Update Diet",
        [routes.MEALS_LOG]: "Meals Log",
        [routes.FOOD_SELECTION]: "Foods",
        [routes.FOOD_PROFILE]: "Foods",
        [routes.FOOD_CREATOR]: "Create Food",
        [routes.FOOD_EDITOR]: "Edit Food",
    };

    const styles = StyleSheet.create({
        wrapper: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            zIndex: 10,
        },
        inset: {
            height: insets.top, // always reserve safe area
            backgroundColor: colors.main,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            alignContent: 'center',
            paddingHorizontal: 20,
            backgroundColor: colors.main,
            height: 45,
        },
        title: {
            fontSize: scaleFont(16),
            color: 'white',
        },
        left: {
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center",
        },
        right: {
            flexDirection: 'row',
            alignItems: "center",
            alignContent: 'center'
        },
        burger: {
            width: 20,
            justifyContent: "space-between",
            height: 16,
        },
        burgerLine: {
            height: 2,
            backgroundColor: 'white',
            borderRadius: 2,
        },
        backButton: {
            justifyContent: "center",
            alignItems: "center",
        },
        icon: {
            width: 20,
            height: 20,
            resizeMode: "contain"
        },
        arrow: {
            width: 18,
            height: 18,
            marginRight: 8,
        },
        profileImage: {
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: colors.mainSecond
        },
        bellImage: {
            width: 24,
            height: 24,
            tintColor: 'white'
        },

        sidebarContainer: {
            flex: 1
        },
        closeButton: {
            width: 35,
            height: 35,
            justifyContent: "center",
            alignItems: "center",
        },

        section: { marginTop: 20, marginBottom: 10 },
        sectionTitle: { fontSize: scaleFont(12), color: "rgba(161,161,161,1)", marginBottom: 10 },
        sidebarItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
        sidebarText: { fontSize: scaleFont(15), marginLeft: 10, color: "#000" },
        logoutButton: { backgroundColor: "#ffe6e6", borderRadius: 10, paddingHorizontal: 10, marginBottom: 15, },

        // Sidebar Footer
        sidebarFooter: { marginTop: "auto", marginBottom: 20 },
        socialRow: { flexDirection: "row", marginBottom: 15 },
        socialButton: { marginRight: 6 },
        addressRow: { flexDirection: "row", alignItems: "center" },
        addressText: { marginLeft: 8, color: "rgba(161,161,161,1)", fontSize: 15 },
    });

    return (
        <View style={styles.wrapper}>
            {!hideInsetOnScroll && <View style={styles.inset} />}

            <Animated.View style={[styles.header, { transform: [{ translateY: topBarPosition }], opacity: topBarOpacity }]}>
                {hideInsetOnScroll && <View style={styles.inset} />}
                <View style={styles.left}>
                    {!inMain && (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Image style={styles.arrow} source={Images.backArrow} />
                        </TouchableOpacity>
                    )}
                    <AppText style={styles.title}>{screenNames[screen]}</AppText>
                </View>

                <View style={styles.right}>
                    {inMain && (
                        <>
                            <TouchableOpacity onPress={() => router.push(routes.PROFILE)} style={{ marginRight: 10 }}>
                                <Image style={styles.bellImage} source={Images.noMessage} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push(routes.PROFILE)} style={{ marginRight: 10 }}>
                                <Image style={styles.bellImage} source={Images.noNotification} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push(routes.PROFILE)}>
                                <Image
                                    style={styles.profileImage}
                                    source={user?.image ? user.image : Images.profilePic}
                                />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Animated.View>
        </View>
    );
}

