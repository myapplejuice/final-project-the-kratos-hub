import { useContext, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { colors } from "../../../common/settings/styling";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { UserContext } from "../../../common/contexts/user-context";
import { goalOptions } from "../../../common/utils/global-options";
import { adjustColor } from "../../../common/utils/random-functions";
import { Image } from "expo-image";
import { Images } from "../../../common/settings/assets";
import APIService from "../../../common/services/api-service";
import usePopups from "../../../common/hooks/use-popups";
import { recalculateUserInformation } from "../../../common/utils/metrics-calculator";
import { convertWeight} from "../../../common/utils/unit-converter";
import { formatDate } from "../../../common/utils/date-time";
import { goalsWeightGoalTip } from "../../../common/utils/text-generator";
import AppText from "../../../components/screen-comps/app-text";
import AppScroll from "../../../components/screen-comps/app-scroll";

export default function EditWeightGoal() {
    const { createToast, hideSpinner, showSpinner } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [goal, setGoal] = useState("");
    const [tip, setTip] = useState("");

    useEffect(() => {
        const goalLevel = goalOptions.find(item => item.key === user.nutrition.goal);
        const tip = goalsWeightGoalTip(user.nutrition.goal);

        setGoal(goalLevel);
        setTip(tip);
    }, [user]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTip(prevTip => {
                let newTip = goalsWeightGoalTip(goal);
                while (newTip === prevTip) {
                    newTip = goalsWeightGoalTip(goal);
                }
                return newTip;
            });
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

    async function handleGoalUpdate(newGoalKey) {
        try {
            if (newGoalKey === user.nutrition.goal) return;

            const updatedUser = recalculateUserInformation({
                ...user,
                nutrition: { ...user.nutrition, goal: newGoalKey },
            });

            const metricsPayload = { ...updatedUser.metrics };
            const nutritionPayload = { ...updatedUser.nutrition };

            showSpinner();
            const result = await APIService.user.update({ metrics: metricsPayload, nutrition: nutritionPayload });

            if (result.success) {
                const date = formatDate(new Date(), { format: "YYYY-MM-DD" });
                const result = await APIService.nutrition.days.updateDay(date, { goal: newGoalKey });
                const newDays = result.data.updatedDays;
                const nutritionLogsUpdatedUser = {
                    ...updatedUser,
                    nutritionLogs: {
                        ...user.nutritionLogs,
                        ...newDays
                    }
                }
                setUser(nutritionLogsUpdatedUser);
                createToast({ message: "Weight goal successfully updated!" });
            } else {
                createToast({ message: `Failed to update weight goal: ${result.message}` });
            }
        } catch (err) {
            console.log(err.message);
            createToast({ message: "Failed to update weight goal!" });
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
                        source={goal.image}
                        style={{ width: 45, height: 45, marginRight: 12, tintColor: goal.color }}
                    />
                    <AppText style={{ color: goal.color, fontWeight: '700', fontSize: scaleFont(20) }}>
                        {goal.label}
                    </AppText>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <View style={styles.statBox}>
                        <Image source={Images.tape} style={[styles.statIcon, { tintColor: "#FFCD61" }]} />
                        <AppText style={styles.statLabel}>Weight</AppText>
                        <AppText style={styles.statValue}>
                            {convertWeight(user.metrics.weightKg, 'kg', user.preferences.weightUnit.field)} {user.preferences.weightUnit.field}
                        </AppText>
                    </View>

                    <View style={styles.statBox}>
                        <Image source={Images.muscleFibers} style={[styles.statIcon, { tintColor: '#6FCF97' }]} />
                        <AppText style={styles.statLabel}>Lean Mass</AppText>
                        <AppText style={styles.statValue}>
                            {convertWeight(user.metrics.leanBodyMass, 'kg', user.preferences.weightUnit.field)} {user.preferences.weightUnit.field}
                        </AppText>
                    </View>

                    <View style={[styles.statBox]}>
                        <Image source={Images.heartRate} style={[styles.statIcon, { tintColor: '#E74C3C' }]} />
                        <AppText style={styles.statLabel}>Body Fat</AppText>
                        <AppText style={styles.statValue}>{user.metrics.bodyFat}%</AppText>
                    </View>
                </View>

                <View style={[styles.tipBox, { backgroundColor: goal.color + "33" }]}>
                    <Image source={Images.energyOutline} style={styles.tipIcon} />
                    <AppText style={styles.tipText}>{tip}</AppText>
                </View>
            </View>

            {goalOptions.map((item, i) => (
                <TouchableOpacity
                    key={i}
                    style={{
                        padding: 10,
                        backgroundColor: user.nutrition.goal === item.key ? item.color + "20" : styles.card.backgroundColor,
                        borderColor: user.nutrition.goal === item.key ? item.color : adjustColor(styles.card.backgroundColor, 100, "lighten"),
                        flexDirection: 'row',
                        borderRadius: 12, marginHorizontal: 15, marginBottom: 15,
                        justifyContent: 'space-between', alignItems: 'center'
                    }}
                    onPress={() => handleGoalUpdate(item.key)}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ backgroundColor: item.color + '40', borderRadius: 12, padding: 10, justifyContent: 'center' }}>
                            <Image source={item.image} style={{ tintColor: item.color, width: 35, height: 35, margin: 0, padding: 0 }} />
                        </View>
                        <View style={{ marginLeft: 10, justifyContent: 'center' }}>
                            <AppText style={{ color: item.color, fontSize: scaleFont(18), fontWeight: 'bold' }}>{item.label}</AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12), marginTop: 5, flexShrink: 1 }}>{item.description}</AppText>
                        </View>
                    </View>
                    {user.nutrition.goal === item.key && (
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
    goalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    goalIconWrapper: {
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    goalIcon: {
        width: 40,
        height: 40,
    },
    goalTextWrapper: {
        flex: 1,
        marginLeft: 12,
    },
    goalLabel: {
        fontWeight: '700',
        fontSize: scaleFont(22),
    },
    goalSubText: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        marginTop: 2,
    },
    goalArrow: {
        width: 20,
        height: 20,
        tintColor: 'white',
        marginLeft: 6,
        alignSelf: 'center',
    },
    statBox: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 5,
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
