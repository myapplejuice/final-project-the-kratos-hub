import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
import SocketService from "../../common/services/socket-service";

export default function Homepage() {
    const { setUser, user } = useContext(UserContext);
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

    useEffect(() => {
        const cleanup = SocketService.hook(setUser);
        return cleanup;
    }, []);

    return (
        <AppScroll paddingColor={colors.background} extraBottom={100} hideNavBarOnScroll={true} hideTopBarOnScroll={true}>
            <View style={{ paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30, margin: 0, backgroundColor: colors.main, borderBottomEndRadius: 30, borderBottomStartRadius: 30, overflow: 'hidden', marginBottom: 60 }}>
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

            {user.friends.some(f => f.unreadCount) > 0 && (
                <TouchableOpacity onPress={() => router.push(routes.FRIENDS)} style={[{ flexDirection: 'row', backgroundColor: colors.cardBackground, alignItems: 'center', margin: 15, padding: 15, borderRadius: 20, }]}>
                    <View style={{ marginEnd: 15 }}>
                        <Image source={Images.message} style={{ width: 25, height: 25, tintColor: 'white' }} />
                    </View>
                    <View>
                        <AppText style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(16) }}>You have unread messages!</AppText>
                        <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(12) }}>Tap here to view</AppText>
                    </View>
                </TouchableOpacity>
            )}

            <View style={{ backgroundColor: colors.background }}>
                <View style={{ marginBottom: 15 }}>
                    <AppText style={{ color: 'white', paddingHorizontal: 25, fontSize: scaleFont(20), fontWeight: 'bold' }}>
                        Today's Overview
                    </AppText>
                </View>
                <View style={{ backgroundColor: 'transparent', justifyContent: 'space-between', marginHorizontal: 15, marginBottom: 15 }}>
                    {[
                        {
                            label: "Basal Metabolic Rate",
                            value: convertEnergy(user.metrics.bmr, 'kcal', user.preferences.energyUnit.key) + " " + user.preferences.energyUnit.field,
                            icon: Images.kcalBurn,
                            route: routes.BASAL_METABOLIC_RATE,
                            bgColor: colors.statImageBackground,
                            iconColor: colors.white
                        },
                    ].map((item, index) => (
                        <TouchableOpacity onPress={() => router.push(item.route)} key={index} style={{ backgroundColor: colors.cardBackground, padding: 30, height: 180, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={item.icon} style={[styles.statImage, item.label !== 'Basal Metabolic Rate' && { tintColor: item.iconColor }, { width: 50, height: 50 }]} />
                            <View style={{ alignItems: 'center' }}>
                                <AppText style={{ fontSize: scaleFont(15), fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }}>{item.value}</AppText>
                                <AppText style={{ fontSize: scaleFont(12), color: colors.mutedText, textAlign: 'center', marginTop: 5 }}>{item.label}</AppText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: 'transparent', justifyContent: 'space-between', marginHorizontal: 15, marginBottom: 15 }}>
                    {[
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
                    ].map((item, index) => (
                        <TouchableOpacity onPress={() => router.push(item.route)} key={index} style={{ backgroundColor: colors.cardBackground, padding: 20, width: '48%', height: 180, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={item.icon} style={[styles.statImage, item.label !== 'Basal Metabolic Rate' && { tintColor: item.iconColor }, { width: 50, height: 50 }]} />
                            <View style={{ justifyContent: 'flex-start' }}>
                                <AppText style={{ fontSize: scaleFont(15), fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 15 }}>{item.value}</AppText>
                                <AppText style={{ fontSize: scaleFont(12), color: colors.mutedText, textAlign: 'center', marginTop: 5 }}>{item.label}</AppText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', backgroundColor: 'transparent', justifyContent: 'space-between', marginHorizontal: 15 }}>
                    {[
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
                    ].map((item, index) => (
                        <TouchableOpacity onPress={() => router.push(item.route)} key={index} style={{ backgroundColor: colors.cardBackground, padding: 20, width: '48%', height: 180, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={item.icon} style={[styles.statImage, item.label !== 'Basal Metabolic Rate' && { tintColor: item.iconColor }, { width: 50, height: 50 }]} />
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
                            <Image source={Images.noGoals} style={[styles.statImage, { tintColor: 'white', width: 35, height: 35 }]} />
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
                        <Image source={Images.nutrition} style={[styles.statImage, { width: 50, height: 50, tintColor: 'white' }]} />
                        <AppText style={{ fontSize: scaleFont(18), color: 'white', fontWeight: 'bold', marginTop: 10 }}>Nutrition</AppText>
                        <AppText style={{ fontSize: scaleFont(12), color: 'white', marginTop: 5 }}>Track meals & progress</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push(routes.TRAINING_HUB)} style={{ padding: 15, backgroundColor: colors.accentBlue, borderRadius: 20, height: 180, justifyContent: 'center', alignItems: 'center', width: '48%' }}>
                        <Image source={Images.workouts} style={[styles.statImage, { width: 50, height: 50, tintColor: 'white' }]} />
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
    introText: {
        color: 'white',
        fontSize: scaleFont(17),
    },

    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 100,
        paddingBottom: 30,
        margin: 0,
        backgroundColor: colors.main,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignContent: 'center',
    },
    timeBox: {
        flexDirection: 'row',
        backgroundColor: '#ffffff48',
        padding: 12,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
    },
    timeText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: scaleFont(17),
    },
    divider: {
        marginVertical: 20,
    },
    greeting: {
        fontSize: scaleFont(25),
        fontWeight: '700',
        flexShrink: 1,
    },
    introSubText: {
        fontSize: scaleFont(16),
        marginTop: 5,
        color: 'rgba(255, 255, 255, 0.75)',
    },

    sectionWrapper: {
        backgroundColor: colors.background,
        marginTop: 20,
    },
    sectionHeader: {
        marginBottom: 15,
    },
    sectionHeaderText: {
        marginTop: 15,
        color: 'white',
        paddingHorizontal: 25,
        fontSize: scaleFont(20),
        fontWeight: 'bold',
    },

    cardGrid: {
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginBottom: 15,
    },
    cardGridRow: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginBottom: 15,
    },
    statCard: {
        backgroundColor: colors.cardBackground,
        padding: 30,
        height: 180,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statCardSmall: {
        backgroundColor: colors.cardBackground,
        padding: 20,
        width: '48%',
        height: 180,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: scaleFont(15),
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: 15,
    },
    statLabel: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        textAlign: 'center',
        marginTop: 5,
    },

    // Goals & Profile
    goalsCard: {
        backgroundColor: colors.cardBackground,
        padding: 15,
        borderRadius: 20,
        marginTop: 15,
        marginHorizontal: 15,
    },
    goalsIconWrapper: {
        backgroundColor: colors.lightMutedText,
        padding: 12,
        borderRadius: 15,
    },
    goalsTitle: {
        fontSize: scaleFont(18),
        color: 'white',
        fontWeight: 'bold',
    },
    goalsSubtitle: {
        color: colors.mutedText,
        fontSize: scaleFont(11),
        flexShrink: 1,
    },

    hubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 15,
        marginHorizontal: 15,
    },
    hubCard: {
        padding: 15,
        borderRadius: 20,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        width: '48%',
    },
    hubTitle: {
        fontSize: scaleFont(18),
        color: 'white',
        fontWeight: 'bold',
        marginTop: 10,
    },
    hubSubtitle: {
        fontSize: scaleFont(12),
        color: 'white',
        marginTop: 5,
    },

    profileCard: {
        backgroundColor: colors.cardBackground,
        marginHorizontal: 15,
        marginTop: 15,
        padding: 20,
        borderRadius: 20,
    },
    profileRow: {
        flexDirection: 'row',
    },
    profileIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
        tintColor: 'white',
    },
    profileTitle: {
        color: 'white',
        fontSize: scaleFont(18),
        flexShrink: 1,
        fontWeight: 'bold',
    },
    profileSubtitle: {
        color: colors.mutedText,
        fontSize: scaleFont(11),
        flexShrink: 1,
        marginTop: 5,
        statImage: { width: 35, height: 35, resizeMode: 'contain' },
    },
});
