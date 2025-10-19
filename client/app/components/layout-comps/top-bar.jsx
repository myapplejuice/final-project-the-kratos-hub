import { useContext, useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, } from "react-native";
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
    const { user, additionalContexts } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const screen = usePathname();
    const topBarPosition = useRef(new Animated.Value(0)).current;
    const topBarOpacity = useRef(new Animated.Value(0)).current;
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
    const [chattedUser, setChattedUser] = useState({});

    useEffect(() => {
        const friendRequestsCount = user?.pendingFriends?.filter(f => f.adderId !== user.id && f.status === 'pending').length || 0;
        const notificationsCount = user?.notifications?.filter(n => !n.seen).length || 0;

        setNotificationsCount(friendRequestsCount + notificationsCount);
    }, [user?.pendingFriends, user?.notifications]);

    useEffect(() => {
        const unreadMessagesCount = user.friends?.reduce((total, friend) => total + friend.unreadCount, 0) || 0;
        setUnreadMessagesCount(unreadMessagesCount);
    }, [user.friends]);

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

    useEffect(() => {
        if (screen === routes.CHAT) {
            setChattedUser(additionalContexts.chattingFriendProfile);
        }
    }, [screen]);

    const inMain = (
        screen === routes.HOMEPAGE ||
        screen === routes.TRAINING_HUB ||
        screen === routes.NUTRITION_HUB ||
        screen === routes.GOALS ||
        screen === routes.COMMUNITY
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
        [routes.GOALS]: "Goals",
        [routes.NUTRITION_HUB]: "Nutrition",
        [routes.TRAINING_HUB]: "Training",
        [routes.SETTINGS]: "Settings",
        [routes.EDIT_ACTIVITY]: "Update Activity Level",
        [routes.EDIT_WEIGHT_GOAL]: "Update Weight Goal",
        [routes.EDIT_DIET]: "Update Diet",
        [routes.MEALS_LOG]: "Meals Diary",
        [routes.FOOD_SELECTION]: "Foods",
        [routes.FOOD_PROFILE]: "Foods",
        [routes.FOOD_CREATOR]: "Create Food",
        [routes.FOOD_EDITOR]: "Edit Food",
        [routes.MEAL_PLANS]: "Meal Plans",
        [routes.FOODS]: "My Foods",
        [routes.MEAL_PLANS_EDITOR]: "Edit Meal Plan",
        [routes.USER_PROFILE]: "User Profile",
        [routes.USDA_PROFILE]: "USDA Profile",
        [routes.NOTIFICATIONS]: "Notifications",
        [routes.FRIENDS]: "Friends",
        [routes.CHAT]: `${chattedUser ? chattedUser.firstname + " " + chattedUser.lastname : 'Chat'}`,
        [routes.PERSONAL_TRAINING_PROFILE]: "Trainer Profile",
        [routes.PERSONAL_TRAINING_EXPLANATION]: "What is A Trainer Profile?",
        [routes.SHIELD_OF_TRUST]: "Shield of Trust",
        [routes.SHIELD_APPLICATION]: "Shield Application",
        [routes.SHIELD_APPLICATIONS]: "My Shield Applications",
        [routes.SHIELD_APPLICATION_REVIEW]: "Shield Application Review",
        [routes.USER_TRAINER_PROFILE]: "Trainer",
        [routes.USER_FOODS]: "User Foods",
        [routes.COMMUNITY]: "Community Hub",
        [routes.USER_POSTS]: "My Posts",
        [routes.USER_POST]: "My Posts",
        [routes.POST_CREATOR]: "Create Post",
        [routes.USER_SAVED_POSTS]: "Saved Posts",

    };

    function handleUserProfilePress() {
        if (!chattedUser.id) return;

        router.push({
            pathname: routes.USER_PROFILE,
            params: {
                userId: chattedUser.id
            }
        });
    }

    function handleNavBack() {
        if (screen === routes.PERSONAL_TRAINING_PROFILE || screen === routes.SHIELD_APPLICATIONS)
            router.replace(routes.PROFILE);
        else if (screen === routes.SHIELD_APPLICATION_REVIEW || screen === routes.SHIELD_APPLICATION)
            router.replace(routes.SHIELD_APPLICATIONS);
        else if (screen === routes.SHIELD_APPLICATIONS)
            router.replace(routes.PROFILE);
        else
            router.back();
    }

    return (
        <View style={styles.wrapper}>
            {!hideInsetOnScroll && <View style={[styles.inset, { height: insets.top }]} />}

            <Animated.View style={[styles.header, { transform: [{ translateY: topBarPosition }], opacity: topBarOpacity }]}>
                {hideInsetOnScroll && <View style={[styles.inset, { height: insets.top }]} />}
                <View style={styles.left}>
                    {!inMain && (
                        <TouchableOpacity onPress={handleNavBack}>
                            <Image style={styles.arrow} source={Images.backArrow} />
                        </TouchableOpacity>
                    )}
                    {screen === routes.CHAT && (
                        <>
                            <TouchableOpacity onPress={handleUserProfilePress}>
                                <Image source={{ uri: chattedUser.imageURL }} style={styles.chattedUserImage} cachePolicy="disk" />
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity onPress={handleUserProfilePress} >
                        <AppText style={styles.title}>{screenNames[screen]}</AppText>
                    </TouchableOpacity>
                </View>

                <View style={styles.right}>
                    {inMain && (
                        <>

                            <View style={styles.bellWrapper}>
                                <TouchableOpacity onPress={() => router.push(routes.FRIENDS)}>
                                    <Image style={styles.bellImage} source={unreadMessagesCount > 0 ? Images.message : Images.noMessage} />
                                </TouchableOpacity>
                                {unreadMessagesCount > 0 && (
                                    <View style={styles.badge}>
                                        <AppText style={styles.badgeText}>
                                            {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                                        </AppText>
                                    </View>
                                )}
                            </View>

                            {/* Notifications Bell */}
                            <View style={[styles.bellWrapper, { marginHorizontal: 10 }]}>
                                <TouchableOpacity onPress={() => router.push(routes.NOTIFICATIONS)}>
                                    <Image style={styles.bellImage} source={notificationsCount > 0 ? Images.notification : Images.noNotification} />
                                </TouchableOpacity>
                                {notificationsCount > 0 && (
                                    <View style={styles.badge}>
                                        <AppText style={styles.badgeText}>
                                            {notificationsCount > 99 ? '99+' : notificationsCount}
                                        </AppText>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity onPress={() => router.push(routes.PROFILE)}>
                                <Image
                                    style={styles.profileImage}
                                    source={{ uri: user.imageURL }}
                                    cachePolicy="disk"
                                />
                            </TouchableOpacity>
                        </>
                    )}
                    {screen === routes.CHAT && chattedUser && (
                        <>
                            {chattedUser.isTrainer && (
                                <TouchableOpacity onPress={() => router.push(routes.PERSONAL_TRAINING_EXPLANATION)} style={{ alignSelf: 'center' }}>
                                    <Image
                                        source={Images.personalTrainer}
                                        style={{ width: 20, height: 20, tintColor: 'white' }}
                                    />
                                </TouchableOpacity>
                            )}

                            {chattedUser.isVerified && (
                                <TouchableOpacity onPress={() => router.push(routes.SHIELD_OF_TRUST)} style={{ alignSelf: 'center', marginStart: 8 }}>
                                    <Image
                                        source={Images.shield}
                                        style={{ width: 18, height: 18, tintColor: 'white' }}
                                    />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        zIndex: 10,
    },
    inset: {
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
        borderRadius: 17.5,
        borderWidth: 2,
        borderColor: colors.mainSecond,
    },
    chattedUserImage: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: colors.mainSecond,
        marginEnd: 10
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
    bellWrapper: {
        position: 'relative',
    },

    badge: {
        position: 'absolute',
        bottom: -2,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
    },

    badgeText: {
        color: 'white',
        fontSize: scaleFont(10),
        fontWeight: 'bold',
    },

});