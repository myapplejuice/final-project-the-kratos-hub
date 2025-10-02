import { useContext, useEffect, useState } from "react";
import { View, StyleSheet,  TouchableOpacity,Platform } from "react-native";
import { colors } from "../../../common/settings/styling"; 
import { scaleFont } from "../../../common/utils/scale-fonts";
import { UserContext } from "../../../common/contexts/user-context";
import { activityOptions } from "../../../common/utils/global-options";
import { adjustColor } from "../../../common/utils/random-functions";
import { Image } from "expo-image";
import { Images } from "../../../common/settings/assets";
import usePopups from "../../../common/hooks/use-popups";
import { BMIByLeanMass, recalculateUserInformation } from "../../../common/utils/metrics-calculator";
import { goalsActivityTip } from "../../../common/utils/text-generator";
import AppText from "../../../components/screen-comps/app-text";
import APIService from "../../../common/services/api-service";
import AppScroll from "../../../components/screen-comps/app-scroll";
import { convertEnergy } from "../../../common/utils/unit-converter";

export default function EditActivity() {
    const { createToast, hideSpinner, showSpinner } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [activity, setActivity] = useState("");
    const [tip, setTip] = useState("");

    useEffect(() => {
        const activityKey = user.metrics.activityLevel;
        const activityLevel = activityOptions.find(item => item.key === activityKey);
        const tip = goalsActivityTip(activityKey);

        setActivity(activityLevel);
        setTip(tip);
    }, [user]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTip(prevTip => {
                let attempts = 0;
                let newTip = goalsActivityTip(user.metrics.activityLevel);
                while (newTip === prevTip && attempts < 5) {
                    newTip = goalsActivityTip(user.metrics.activityLevel);
                    attempts++;
                }
                return newTip;
            });
        }, 30000);

        return () => clearInterval(intervalId);
    }, [user]);

    async function handleActivityUpdate(newActivityKey) {
        try {
            if (newActivityKey === user.metrics.activityLevel) return;

            const updatedUser = recalculateUserInformation({
                ...user,
                metrics: { ...user.metrics, activityLevel: newActivityKey },
            });

            const metricsPayload = { ...updatedUser.metrics };
            const nutritionPayload = { ...updatedUser.nutrition };

            showSpinner();
            const result = await APIService.user.update({ metrics: metricsPayload, nutrition: nutritionPayload });

            if (result.success) {
                setUser(updatedUser);
                createToast({ message: "Activity level successfully updated!" });
            } else {
                createToast({ message: `Failed to update activity: ${result.message}` });
            }
        } catch (err) {
            console.log(err.message);
            createToast({ message: "Failed to update activity!" });
        }
        finally {
            hideSpinner();
        }
    }

    return (
        <AppScroll extraTop={60} extraBottom={100}>
            <View style={[styles.card, { marginTop: 0, padding: 15 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Image
                        source={activity.image}
                        style={{ width: 45, height: 45, marginRight: 12, tintColor: activity.color }}
                    />
                    <AppText style={{ color: activity.color, fontWeight: '700', fontSize: scaleFont(20) }}>
                        {activity.label}
                    </AppText>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View style={styles.statBox}>
                        <Image source={Images.bmr} style={[styles.statIcon]} />
                        <AppText style={styles.statLabel}>BMR</AppText>
                        <AppText style={styles.statValue}>
                            {convertEnergy(user.metrics.bmr, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                        </AppText>
                    </View>

                    <View style={styles.statBox}>
                        <Image source={Images.kcalBurn} style={styles.statIcon} />
                        <AppText style={styles.statLabel}>TDEE</AppText>
                        <AppText style={styles.statValue}>
                            {convertEnergy(user.metrics.tdee, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                        </AppText>
                    </View>

                    <View style={styles.statBox}>
                        <Image source={Images.bmi} style={[styles.statIcon, { tintColor: '#9B59B6' }]} />
                        <AppText style={styles.statLabel}>BMI</AppText>
                        <AppText style={styles.statValue}>{user.metrics.bmi}</AppText>
                    </View>

                    <View style={styles.statBox}>
                        <Image source={Images.muscleFibers} style={[styles.statIcon, { tintColor: '#3498DB' }]} />
                        <AppText style={styles.statLabel}>Lean BMI</AppText>
                        <AppText style={styles.statValue}>{BMIByLeanMass(user.metrics.weightKg, user.metrics.heightCm, user.metrics.leanBodyMass)}</AppText>
                    </View>
                </View>

                <View style={[styles.tipBox, { backgroundColor: activity.color + "33" }]}>
                    <Image source={Images.energyOutline} style={styles.tipIcon} />
                    <AppText style={styles.tipText}>{tip}</AppText>
                </View>
            </View>



            {activityOptions.map((item, i) => (
                <TouchableOpacity
                    key={i}
                    style={{
                        padding: 15,
                        backgroundColor: user.metrics.activityLevel === item.key ? item.color + "20" : styles.card.backgroundColor,
                        borderColor: user.metrics.activityLevel === item.key ? item.color : adjustColor(styles.card.backgroundColor, 100, "lighten"),
                        flexDirection: 'row',
                        borderRadius: 12, marginHorizontal: 15, marginBottom: 15,
                        justifyContent: 'space-between', alignItems: 'center'
                    }}
                    onPress={() => handleActivityUpdate(item.key)}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ backgroundColor: item.color + '40', borderRadius: 12, padding: 10, justifyContent: 'center' }}>
                            <Image source={item.image} style={{ tintColor: item.color, width: 35, height: 35, margin: 0, padding: 0 }} />
                        </View>
                        <View style={{ marginLeft: 10, justifyContent: 'center' }}>
                            <AppText style={{ color: item.color, fontSize: scaleFont(18), fontWeight: 'bold' }}>{item.label}</AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12), marginTop: 5 }}>{item.description}</AppText>
                        </View>
                    </View>
                    {user.metrics.activityLevel === item.key && (
                        <Image source={Images.done} style={{ width: 25, height: 25, tintColor: item.color }} />
                    )}
                </TouchableOpacity>
            ))}
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
    card: {
        backgroundColor: colors.cardBackground,
        padding: 15,
        borderRadius: 15,
        margin: 15,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 5 },
            android: { elevation: 5 },
        }),
    },
    introText: {
        color: 'white',
        fontSize: scaleFont(14),
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        color: 'white',
        marginBottom: 12,
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        width: '100%',
    },
    feedbackBullet: {
        color: 'white',
        fontSize: scaleFont(14),
        marginRight: 6,
    },
    feedbackText: {
        color: 'white',
        fontSize: scaleFont(14),
        lineHeight: 20,
        flex: 1,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    activityIconWrapper: {
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityIcon: {
        width: 40,
        height: 40,
    },
    activityTextWrapper: {
        flex: 1,
        marginLeft: 12,
    },
    activityLabel: {
        fontWeight: '700',
        fontSize: scaleFont(22),
    },
    activitySubText: {
        fontSize: scaleFont(12),
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
    statBox: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    statIcon: {
        width: 28,
        height: 28,
        marginBottom: 6,
    },
    statLabel: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        marginBottom: 2,
    },
    statValue: {
        fontSize: scaleFont(14),
        color: 'white',
        fontWeight: '600',
    }, tipBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 15, // always applied
        overflow: 'hidden', // ensures rounding works on Android
    },
    tipIcon: {
        width: 28,
        height: 28,
        marginRight: 10,
        tintColor: 'white',
    },
    tipText: {
        color: 'white',
        flex: 1,
    },

});
