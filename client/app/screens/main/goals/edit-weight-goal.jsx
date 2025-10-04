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
import { convertWeight } from "../../../common/utils/unit-converter";
import { formatDate } from "../../../common/utils/date-time";
import { goalsWeightGoalTip } from "../../../common/utils/text-generator";
import AppText from "../../../components/screen-comps/app-text";
import AppScroll from "../../../components/screen-comps/app-scroll";
import { LinearGradient } from "expo-linear-gradient";

export default function EditWeightGoal() {
    const { createToast, hideSpinner, showSpinner } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [goal, setGoal] = useState({color: colors.accentGreen});
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
    }, [user]);

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
            {/* Current Goal Header */}
            <View style={[styles.currentGoalCard, { borderLeftColor: goal?.color || colors.accentBlue, marginTop: 0 }]}>
                <LinearGradient colors={[goal.color + '20', goal.color + '08']} style={[styles.currentGoalContent, { backgroundColor: (goal?.color || colors.accentBlue) + '15' }]}>
                    <View style={styles.currentGoalHeader}>
                        <View style={[styles.goalIconContainer, { backgroundColor: (goal?.color || colors.accentBlue) + '40' }]}>
                            <Image
                                source={goal?.image || Images.target}
                                style={[styles.currentGoalIcon, { tintColor: 'white' }]}
                            />
                        </View>
                        <View style={styles.currentGoalText}>
                            <AppText style={styles.currentGoalLabel}>Current Weight Goal</AppText>
                            <AppText style={[styles.currentGoalTitle, { color: goal?.color || colors.accentBlue }]}>
                                {goal?.label || "Loading..."}
                            </AppText>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#FFCD6120' }]}>
                                <Image source={Images.tape} style={[styles.statIcon, { tintColor: '#FFCD61' }]} />
                            </View>
                            <AppText style={styles.statLabel}>Weight</AppText>
                            <AppText style={styles.statValue}>
                                {convertWeight(user.metrics.weightKg, 'kg', user.preferences.weightUnit.field)}
                            </AppText>
                            <AppText style={styles.statUnit}>{user.preferences.weightUnit.field}</AppText>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#6FCF9720' }]}>
                                <Image source={Images.muscleFibers} style={[styles.statIcon, { tintColor: '#6FCF97' }]} />
                            </View>
                            <AppText style={styles.statLabel}>Lean Mass</AppText>
                            <AppText style={styles.statValue}>
                                {convertWeight(user.metrics.leanBodyMass, 'kg', user.preferences.weightUnit.field)}
                            </AppText>
                            <AppText style={styles.statUnit}>{user.preferences.weightUnit.field}</AppText>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#E74C3C20' }]}>
                                <Image source={Images.heartRate} style={[styles.statIcon, { tintColor: '#E74C3C' }]} />
                            </View>
                            <AppText style={styles.statLabel}>Body Fat</AppText>
                            <AppText style={styles.statValue}>{user.metrics.bodyFat}%</AppText>
                            <AppText style={styles.statUnit}>Percentage</AppText>
                        </View>
                    </View>

                    {/* Tip Box */}
                    <View style={[styles.tipBox, { borderColor: 'rgba(255,255,255,0.1)' }]}>
                        <View style={[styles.tipIconContainer,]}>
                            <Image source={Images.energyOutline} style={[styles.tipIcon, { tintColor: 'white' }]} />
                        </View>
                        <View style={styles.tipContent}>
                            <AppText style={styles.tipTitle}>Pro Tip</AppText>
                            <AppText style={styles.tipText}>{tip}</AppText>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* Goal Options */}
            <View style={styles.optionsContainer}>
                <AppText style={styles.optionsTitle}>Choose Your Weight Goal</AppText>
                <AppText style={styles.optionsSubtitle}>Select the goal that matches your fitness objectives</AppText>

                {goalOptions.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.goalOption,
                            {
                                backgroundColor: user.nutrition.goal === item.key ? item.color + '20' : colors.cardBackground,
                                borderColor: user.nutrition.goal === item.key ? item.color : 'rgba(255,255,255,0.1)',
                                borderWidth: user.nutrition.goal === item.key ? 2 : 1,
                            }
                        ]}
                        onPress={() => handleGoalUpdate(item.key)}
                    >
                        <View style={styles.optionContent}>
                            <View style={[styles.optionIconContainer, { backgroundColor: item.color + '30' }]}>
                                <Image source={item.image} style={[styles.optionIcon, { tintColor: item.color }]} />
                            </View>
                            <View style={styles.optionText}>
                                <AppText style={[styles.optionLabel, { color: item.color }]}>
                                    {item.label}
                                </AppText>
                                <AppText style={styles.optionDescription}>
                                    {item.description}
                                </AppText>
                            </View>
                        </View>

                        {user.nutrition.goal === item.key && (
                            <View style={[styles.selectedBadge, { backgroundColor: item.color }]}>
                                <Image source={Images.done} style={styles.selectedIcon} />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    currentGoalCard: {
        margin: 15,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderLeftWidth: 4,
    },
    currentGoalContent: {
        padding: 20,
    },
    currentGoalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    goalIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    currentGoalIcon: {
        width: 30,
        height: 30,
    },
    currentGoalText: {
        flex: 1,
    },
    currentGoalLabel: {
        color: colors.mutedText,
        fontSize: scaleFont(12),
        marginBottom: 4,
        fontWeight: '600',
    },
    currentGoalTitle: {
        fontSize: scaleFont(22),
        fontWeight: '700',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statIcon: {
        width: 20,
        height: 20,
    },
    statLabel: {
        fontSize: scaleFont(10),
        color: colors.mutedText,
        marginBottom: 4,
        fontWeight: '600',
    },
    statValue: {
        fontSize: scaleFont(14),
        color: 'white',
        fontWeight: '700',
        marginBottom: 2,
    },
    statUnit: {
        fontSize: scaleFont(9),
        color: colors.mutedText,
    },
    tipBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    tipIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tipIcon: {
        width: 30,
        height: 30,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        color: 'white',
        fontSize: scaleFont(12),
        fontWeight: '700',
        marginBottom: 4,
    },
    tipText: {
        color: 'white',
        fontSize: scaleFont(12),
        lineHeight: 18,
        opacity: 0.9,
    },
    optionsContainer: {
        marginHorizontal: 15,
        marginBottom: 20,
    },
    optionsTitle: {
        fontSize: scaleFont(18),
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
        marginHorizontal: 15,
    },
    optionsSubtitle: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        marginBottom: 20,
        marginHorizontal: 15,
    },
    goalOption: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionIcon: {
        width: 24,
        height: 24,
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        lineHeight: 16,
    },
    selectedBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    selectedIcon: {
        width: 16,
        height: 16,
        tintColor: 'white',
    },
});