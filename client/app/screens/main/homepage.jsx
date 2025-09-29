import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import DateDisplay from "../../components/screen-comps/date-display";
import AnimatedButton from "../../components/screen-comps/animated-button";
import AppText from "../../components/screen-comps/app-text";
import { Images } from '../../common/settings/assets';
import { UserContext } from "../../common/contexts/user-context";
import { convertEnergy, convertWeight } from "../../common/utils/unit-converter";
import { formatTime } from "../../common/utils/date-time";
import { scaleFont } from "../../common/utils/scale-fonts";
import { routes, } from "../../common/settings/constants";
import { colors } from "../../common/settings/styling";
import { homeBottomTabsText, homeGreetingText, homeIntroText, homeStatsTabsText } from "../../common/utils/text-generator";
import { LinearGradient } from "expo-linear-gradient";
import Divider from "../../components/screen-comps/divider";
import AppScroll from "../../components/screen-comps/app-scroll";

export default function Homepage() {
    const { user } = useContext(UserContext);
    const [currentTime, setCurrentTime] = useState();
    const [introText, setIntroText] = useState('');
    const [statsIntroText, setStatsIntroText] = useState('');
    const [greeting, setGreeting] = useState('');
    const [greetingEmoji, setGreetingEmoji] = useState("");
    const [greetingEmojiBackground, setGreetingEmojiBackground] = useState('');
    const [goalsTapMessage, setGoalsTapMesasage] = useState("");
    const [loggersTapsMessage, setLoggersTapsMessage] = useState("");
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1350,
            useNativeDriver: true,
        }).start();

        const updateHomeTexts = () => {
            const [text, emoji, color] = homeGreetingText();
            const { goalMessage, loggerMessage } = homeBottomTabsText();
            const introText = homeIntroText();
            const statsIntroText = homeStatsTabsText();

            setGreeting(text);
            setGreetingEmoji(emoji);
            setGreetingEmojiBackground(color);
            setIntroText(introText);
            setGoalsTapMesasage(goalMessage);
            setLoggersTapsMessage(loggerMessage);
            setStatsIntroText(statsIntroText);
        };

        updateHomeTexts();
        const interval = setInterval(updateHomeTexts, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!currentTime) {
            const time = formatTime(new Date(), { format: user.preferences.timeFormat.key });
            setCurrentTime(time);
        }

        const interval = setInterval(() => {
            setCurrentTime(
                formatTime(new Date(), { format: user.preferences.timeFormat.key })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [user.preferences]);

    const tabs = [
        {
            label: "Basal Metabolic Rate",
            value: convertEnergy(user.metrics.bmr, 'kcal', user.preferences.energyUnit.key) + " " + user.preferences.energyUnit.field,
            icon: Images.kcalBurn,
            route: routes.BASAL_METABOLIC_RATE,
            bgColor: colors.statImageBackground,
            iconColor: colors.white
        },
        {
            label: "Body Mass Index",
            value: user.metrics.bmi,
            icon: Images.bmi,
            route: routes.BODY_MASS_INDEX,
            bgColor: '#9B59B633',
            iconColor: '#9B59B6'
        },
        {
            label: "Estimated Body Fat",
            value: user.metrics.bodyFat + "%",
            icon: Images.bodyFat,
            route: routes.BODY_FAT,
            bgColor: '#E74C3C33',
            iconColor: '#E74C3C'
        },
        {
            label: "Lean Body Mass",
            value: convertWeight(user.metrics.leanBodyMass, 'kg', user.preferences.weightUnit.key) + ` ${user.preferences.weightUnit.field}`,
            icon: Images.muscleFibers,
            route: routes.LEAN_BODY_MASS,
            bgColor: '#4DB6AC33',
            iconColor: '#4DB6AC'
        },
        {
            label: "Total Daily Energy Expenditure",
            value: convertEnergy(user.metrics.tdee, 'kcal', user.preferences.energyUnit.key) + " " + user.preferences.energyUnit.field,
            icon: Images.tdee,
            route: routes.TOTAL_DAILY_ENERGY_EXPENDITURE,
            bgColor: '#3498DB33',
            iconColor: '#3498DB'
        }
    ];

    return (
        <AppScroll backgroundColor={colors.main} paddingColor={colors.background} extraBottom={100} hideNavBarOnScroll={true} hideTopBarOnScroll={true}>
            <LinearGradient
                colors={[
                    colors.main + "FF",
                    colors.main,
                    colors.main + "CC",
                    colors.main + "88",
                    colors.main + "44",
                    colors.background,
                    "transparent"
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ paddingHorizontal: 20, margin: 0, backgroundColor: colors.background }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignContent: 'center', marginBottom: 10 }}>
                    <DateDisplay styles={{ textAlign: 'center', marginBottom: 0, marginTop: 0 }} dateStyle={{ color: 'white' }} dayStyle={{ color: 'white' }} />
                    <View style={{ backgroundColor: '#ffffff48', padding: 10, borderRadius: 15, height: 40, alignItems: 'center', justifyContent: 'center', alignContent: 'center' }}>
                        <AppText style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: scaleFont(16) }}>{currentTime}</AppText>
                    </View>
                </View>

                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppText style={{ fontSize: scaleFont(40), backgroundColor: greetingEmojiBackground, padding: 5, borderRadius: 15 }}>
                            {greetingEmoji}
                        </AppText>
                        <AppText numberOfLines={2} style={[styles.introText, { fontSize: scaleFont(25), fontWeight: '700', marginLeft: 15, flexShrink: 1 }]}>
                            {greeting}, {user.firstname}!
                        </AppText>
                    </View>

                    <AppText style={[styles.introText, { fontSize: scaleFont(16), marginTop: 5 }]}>
                        {introText}
                    </AppText>

                </Animated.View>
            </LinearGradient>
            <View style={{ backgroundColor: colors.background }}>
                <TouchableOpacity
                    onPress={() => router.push(routes.PROFILE)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.cardBackground,
                        paddingHorizontal: 15,
                        marginHorizontal: 15,
                        paddingVertical: 10,
                        borderRadius: 15,
                        marginTop: 30
                    }}
                >
                    <Image source={Images.profileOutline} style={{ width: 24, height: 24, marginRight: 8, tintColor: 'white' }} />
                    <AppText style={{ color: 'white', fontSize: scaleFont(11), flexShrink: 1 }}>
                        Tap here or your profile picture above to view your profile
                    </AppText>
                </TouchableOpacity>
                <AppText style={{ marginTop: 15, color: 'white', paddingHorizontal: 25 }}>
                    {statsIntroText}
                </AppText>
                <View style={userStatsCard.statsContainer}>
                    {tabs.map((item, index) => (
                        <View key={index}>
                            <TouchableOpacity onPress={() => router.push(item.route)} style={[userStatsCard.statItem, index !== 4 && { marginBottom: 15 }, index !== 0 && { marginTop: 15 }]}>
                                <View style={userStatsCard.statItemLeft}>
                                    <View style={[userStatsCard.statImageContainer, item.label !== 'Basal Metabolic Rate' && { backgroundColor: item.bgColor }]}>
                                        <Image source={item.icon} style={[userStatsCard.statImage, item.label !== 'Basal Metabolic Rate' && { tintColor: item.iconColor }]} />
                                    </View>
                                    <View style={userStatsCard.titleContainer}>
                                        <AppText style={userStatsCard.statLabel}>{item.label}</AppText>
                                        <AppText style={userStatsCard.statValue}>{item.value}</AppText>
                                    </View>
                                </View>
                                <Image source={Images.backArrow} style={userStatsCard.statArrow} />
                            </TouchableOpacity>
                            {index !== 4 && <Divider orientation="horizontal" color={colors.divider} thickness={1} style={{ borderRadius: 40 }} />}
                        </View>
                    ))}
                </View>

                <AppText style={{ marginBottom: 15, color: 'white', paddingHorizontal: 25 }}>{goalsTapMessage}</AppText>
                <View style={[userStatsCard.statsContainer, { marginTop: 0 }]}>
                    <TouchableOpacity onPress={() => router.push(routes.GOALS)} style={{ width: '100%' }}>

                        <View style={[userStatsCard.statItem]}>
                            <View style={userStatsCard.statItemLeft}>
                                <View style={[userStatsCard.statImageContainer, { backgroundColor: 'rgba(61, 61, 61, 1)' }]}>
                                    <Image source={Images.noGoals} style={[userStatsCard.statImage, { tintColor: 'white', width: 25, height: 25 }]} />
                                </View>
                                <AppText style={[userStatsCard.statValue, { fontSize: scaleFont(15) }]}>
                                    Manage Your Goals & Metrics
                                </AppText>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <AppText style={{ marginBottom: 15, color: 'white', paddingHorizontal: 25 }}>{loggersTapsMessage}</AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 }}>
                    <AnimatedButton
                        title={"Nutrition"}
                        onPress={() => router.push(routes.NUTRITION_HUB)}
                        style={{ width: '48%', justifyContent: 'center', alignContent: 'center', alignItems: 'center', padding: 15, backgroundColor: colors.accentGreen, borderRadius: 15 }}
                        textStyle={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(12) }}
                    />
                    <AnimatedButton
                        title={"Training"}
                        onPress={() => router.push(routes.TRAINING_HUB)}
                        style={{ width: '48%', justifyContent: 'center', alignContent: 'center', alignItems: 'center', padding: 15, backgroundColor: colors.accentBlue, borderRadius: 15 }}
                        textStyle={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(12) }}
                    />
                </View>
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        backgroundColor: colors.background,
    },
    introText: {
        color: 'white',
        fontSize: scaleFont(17),
    },
    sectionTitle: {
        fontSize: scaleFont(19),
        fontWeight: '700',
        color: 'white',
        marginBottom: 12,
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    feedbackBullet: {
        color: 'white',
        fontSize: scaleFont(14),
        marginRight: 6,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    activityIconWrapper: {
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityIcon: {
        width: 50,
        height: 50,
    },
    activityTextWrapper: {
        flex: 1,
        marginLeft: 12,
    },
    activityLabel: {
        fontWeight: '700',
        fontSize: scaleFont(26),
    },
    activitySubText: {
        fontSize: scaleFont(13),
        color: colors.mutedText,
        marginTop: 2,
    },
    activityArrow: {
        width: 20,
        height: 20,
        tintColor: 'white',
        marginLeft: 6,
        alignSelf: 'center',
    },
});

const userStatsCard = StyleSheet.create({
    statsContainer: { margin: 15, backgroundColor: colors.cardBackground, borderRadius: 15, padding: 15 },
    statItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    statImageContainer: { backgroundColor: colors.statImageBackground, padding: 8, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    statImage: { width: 35, height: 35, resizeMode: 'contain' },
    statLabel: { fontSize: scaleFont(13), color: colors.mutedText },
    statValue: { fontSize: scaleFont(13), fontWeight: '700', color: colors.white, marginTop: 2 },
    statArrow: { width: 20, height: 20, transform: [{ scaleX: -1 }], resizeMode: 'contain' }
});