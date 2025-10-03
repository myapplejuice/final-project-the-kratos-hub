import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import DateDisplay from "../../components/screen-comps/date-display";
import AppText from "../../components/screen-comps/app-text";
import { Images } from '../../common/settings/assets';
import { UserContext } from "../../common/contexts/user-context";
import { convertEnergy, convertWeight } from "../../common/utils/unit-converter";
import { formatTime } from "../../common/utils/date-time";
import { scaleFont } from "../../common/utils/scale-fonts";
import { routes, } from "../../common/settings/constants";
import { colors } from "../../common/settings/styling";
import { homeGreetingText, homeIntroText } from "../../common/utils/text-generator";
import Divider from "../../components/screen-comps/divider";
import AppScroll from "../../components/screen-comps/app-scroll";
import FadeInOut from "../../components/effects/fade-in-out";

export default function Homepage() {
    const { user } = useContext(UserContext);
    const [currentTime, setCurrentTime] = useState();
    const [introText, setIntroText] = useState('');
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const updateHomeTexts = () => {
            const [text, emoji, color] = homeGreetingText();
            const introText = homeIntroText();

            setGreeting(text);
            setIntroText(introText);
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

    const BMRTab = [
        {
            label: "Basal Metabolic Rate",
            value: convertEnergy(user.metrics.bmr, 'kcal', user.preferences.energyUnit.key) + " " + user.preferences.energyUnit.field,
            icon: Images.kcalBurn,
            route: routes.BASAL_METABOLIC_RATE,
            bgColor: colors.statImageBackground,
            iconColor: colors.white
        },
    ];

    const tabsGroupOne = [
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
        }
    ];

    const tabsGroupTwo = [
        {
            label: "Lean Body Mass",
            value: convertWeight(user.metrics.leanBodyMass, 'kg', user.preferences.weightUnit.key) + ` ${user.preferences.weightUnit.field}`,
            icon: Images.muscleFibers,
            route: routes.LEAN_BODY_MASS,
            bgColor: '#4DB6AC33',
            iconColor: '#4DB6AC'
        },
        {
            label: "Energy Expenditure",
            value: convertEnergy(user.metrics.tdee, 'kcal', user.preferences.energyUnit.key) + " " + user.preferences.energyUnit.field,
            icon: Images.tdee,
            route: routes.TOTAL_DAILY_ENERGY_EXPENDITURE,
            bgColor: '#3498DB33',
            iconColor: '#3498DB'
        }
    ];

    return (
        <AppScroll paddingColor={colors.background} topPadding={false} extraBottom={100} hideNavBarOnScroll={true} hideTopBarOnScroll={true}>
            <View style={{ paddingHorizontal: 20, paddingTop: 100, paddingBottom: 30, margin: 0, backgroundColor: colors.main, borderBottomEndRadius: 30, borderBottomStartRadius: 30, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignContent: 'center' }}>
                    <DateDisplay styles={{ textAlign: 'center' }} dateStyle={{ color: 'white' }} dayStyle={{ color: 'white' }} />
                    <View style={{ flexDirection: 'row', backgroundColor: '#ffffff48', padding: 12, borderRadius: 15, alignItems: 'center', justifyContent: 'center', alignContent: 'center' }}>
                        <AppText style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: scaleFont(17) }}>{currentTime}</AppText>
                    </View>
                </View>

                <Divider orientation="horizontal" thickness={2} color="rgba(255, 255, 255, 0.25)" style={{ marginVertical: 20 }} />

                <FadeInOut visible={true}>
                    <AppText numberOfLines={2} style={[styles.introText, { fontSize: scaleFont(25), fontWeight: '700', flexShrink: 1 }]}>
                        {greeting}, {user.firstname}!
                    </AppText>
                    <AppText style={[styles.introText, { fontSize: scaleFont(16), marginTop: 5, color: 'rgba(255, 255, 255, 0.75)' }]}>
                        {introText}
                    </AppText>
                </FadeInOut>
            </View>

            <View style={{ backgroundColor: colors.background, marginTop: 20 }}>
                <View style={{ marginBottom: 15 }}>
                    <AppText style={{ marginTop: 15, color: 'white', paddingHorizontal: 25, fontSize: scaleFont(20), fontWeight: 'bold' }}>
                        Today's Overview
                    </AppText>
                </View>
                <View style={{ backgroundColor: 'transparent', justifyContent: 'space-between', marginHorizontal: 15, marginBottom: 15 }}>
                    {BMRTab.map((item, index) => (
                        <TouchableOpacity onPress={() => router.push(item.route)} key={index} style={{ backgroundColor: colors.cardBackground, padding: 30, height: 180, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={item.icon} style={[userStatsCard.statImage, item.label !== 'Basal Metabolic Rate' && { tintColor: item.iconColor }, { width: 50, height: 50 }]} />
                            <View style={{ alignItems: 'center' }}>
                                <AppText style={{ fontSize: scaleFont(15), fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }}>{item.value}</AppText>
                                <AppText style={{ fontSize: scaleFont(12), color: colors.mutedText, textAlign: 'center', marginTop: 5 }}>{item.label}</AppText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: 'transparent', justifyContent: 'space-between', marginHorizontal: 15, marginBottom: 15 }}>
                    {tabsGroupOne.map((item, index) => (
                        <TouchableOpacity onPress={() => router.push(item.route)} key={index} style={{ backgroundColor: colors.cardBackground, padding: 20, width: '48%', height: 180, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={item.icon} style={[userStatsCard.statImage, item.label !== 'Basal Metabolic Rate' && { tintColor: item.iconColor }, { width: 50, height: 50 }]} />
                            <View style={{ justifyContent: 'flex-start' }}>
                                <AppText style={{ fontSize: scaleFont(15), fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }}>{item.value}</AppText>
                                <AppText style={{ fontSize: scaleFont(12), color: colors.mutedText, textAlign: 'center', marginTop: 5 }}>{item.label}</AppText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: 'transparent', justifyContent: 'space-between', marginHorizontal: 15 }}>
                    {tabsGroupTwo.map((item, index) => (
                        <TouchableOpacity onPress={() => router.push(item.route)} key={index} style={{ backgroundColor: colors.cardBackground, padding: 20, width: '48%', height: 180, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={item.icon} style={[userStatsCard.statImage, item.label !== 'Basal Metabolic Rate' && { tintColor: item.iconColor }, { width: 50, height: 50 }]} />
                            <View style={{ justifyContent: 'flex-start' }}>
                                <AppText style={{ fontSize: scaleFont(15), fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }}>{item.value}</AppText>
                                <AppText style={{ fontSize: scaleFont(12), color: colors.mutedText, textAlign: 'center', marginTop: 5 }}>{item.label}</AppText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity onPress={() => router.push(routes.GOALS)} style={{ backgroundColor: colors.cardBackground, padding: 15, borderRadius: 20, marginTop: 15, marginHorizontal: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ backgroundColor: colors.lightMutedText, padding: 12, borderRadius: 15 }}>
                            <Image source={Images.noGoals} style={[userStatsCard.statImage, { tintColor: 'white', width: 35, height: 35 }]} />
                        </View>
                        <View style={{ marginStart: 15 }}>
                            <AppText style={{ fontSize: scaleFont(18), color: 'white', fontWeight: 'bold' }}>
                                Manage Goals & Metrics
                            </AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11), flexShrink: 1 }}>
                                Set your goals and track your progress
                            </AppText>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, marginHorizontal: 15 }}>
                    <TouchableOpacity onPress={() => router.push(routes.NUTRITION_HUB)} style={{ padding: 15, backgroundColor: colors.accentGreen, borderRadius: 20, height: 180, justifyContent: 'center', alignItems: 'center', width: '48%' }}>
                        <Image source={Images.nutrition} style={[userStatsCard.statImage, { width: 50, height: 50, tintColor: 'white' }]} />
                        <AppText style={{ fontSize: scaleFont(18), color: 'white', fontWeight: 'bold', marginTop: 10 }}>Nutrition</AppText>
                        <AppText style={{ fontSize: scaleFont(12), color: 'white', marginTop: 5 }}>Track meals & progress</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push(routes.TRAINING_HUB)} style={{ padding: 15, backgroundColor: colors.accentBlue, borderRadius: 20, height: 180, justifyContent: 'center', alignItems: 'center', width: '48%' }}>
                        <Image source={Images.nutrition} style={[userStatsCard.statImage, { width: 50, height: 50, tintColor: 'white' }]} />
                        <AppText style={{ fontSize: scaleFont(18), color: 'white', fontWeight: 'bold', marginTop: 10 }}>Training</AppText>
                        <AppText style={{ fontSize: scaleFont(12), color: 'white', marginTop: 5 }}>Log your workouts</AppText>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => router.push(routes.PROFILE)}
                    style={{
                        backgroundColor: colors.cardBackground,
                        marginHorizontal: 15,
                        marginTop: 15,
                        padding: 20,
                        borderRadius: 20,
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <Image source={Images.profileOutline} style={{ width: 24, height: 24, marginRight: 8, tintColor: 'white' }} />
                        <AppText style={{ color: 'white', fontSize: scaleFont(18), flexShrink: 1, fontWeight: 'bold' }}>
                            View Your Profile
                        </AppText>
                    </View>
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11), flexShrink: 1, marginTop: 5 }}>
                        Tap here to modify your profile and app settings
                    </AppText>
                </TouchableOpacity>
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
    statsContainer: { margin: 15, backgroundColor: colors.cardBackground, borderRadius: 20, padding: 15 },
    statItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    statImageContainer: { backgroundColor: colors.statImageBackground, padding: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    statImage: { width: 35, height: 35, resizeMode: 'contain' },
    statLabel: { fontSize: scaleFont(13), color: colors.mutedText },
    statArrow: { width: 20, height: 20, transform: [{ scaleX: -1 }], resizeMode: 'contain' }
});