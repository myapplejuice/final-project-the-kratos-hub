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
import { LinearGradient } from "expo-linear-gradient";

export default function EditActivity() {
    const { createToast, hideSpinner, showSpinner } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [activity, setActivity] = useState({color: colors.accentBlue});
    const [tip, setTip] = useState('');

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
            {/* Current Activity Header */}
            <View style={[styles.currentActivityCard, { borderLeftColor: activity.color, marginTop: 0 }]}>
                <LinearGradient
                    colors={[activity.color + '20', activity.color + '08']}
                    style={styles.currentActivityGradient}
                >
                    <View style={styles.currentActivityHeader}>
                        <View style={[styles.activityIconContainer, { backgroundColor: activity.color + '40' }]}>
                            <Image
                                source={activity.image}
                                style={[styles.currentActivityIcon]}
                            />
                        </View>
                        <View style={styles.currentActivityText}>
                            <AppText style={styles.currentActivityLabel}>Current Activity Level</AppText>
                            <AppText style={[styles.currentActivityTitle, { color: activity.color }]}>
                                {activity.label}
                            </AppText>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#e7b93933' }]}>
                                <Image source={Images.kcalBurn} style={[styles.statIcon]} />
                            </View>
                            <AppText style={styles.statLabel}>BMR</AppText>
                            <AppText style={styles.statValue}>
                                {convertEnergy(user.metrics.bmr, 'kcal', user.preferences.energyUnit.key)}
                            </AppText>
                            <AppText style={styles.statUnit}>{user.preferences.energyUnit.field}</AppText>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#f5990423' }]}>
                                <Image source={Images.tdee} style={[styles.statIcon, { tintColor: '#F39C12' }]} />
                            </View>
                            <AppText style={styles.statLabel}>TDEE</AppText>
                            <AppText style={styles.statValue}>
                                {convertEnergy(user.metrics.tdee, 'kcal', user.preferences.energyUnit.key)}
                            </AppText>
                            <AppText style={styles.statUnit}>{user.preferences.energyUnit.field}</AppText>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#9B59B620' }]}>
                                <Image source={Images.bmi} style={[styles.statIcon, { tintColor: '#9B59B6' }]} />
                            </View>
                            <AppText style={styles.statLabel}>BMI</AppText>
                            <AppText style={styles.statValue}>{user.metrics.bmi}</AppText>
                            <AppText style={styles.statUnit}>Score</AppText>
                        </View>

                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#3498DB20' }]}>
                                <Image source={Images.muscleFibers} style={[styles.statIcon, { tintColor: '#3498DB' }]} />
                            </View>
                            <AppText style={styles.statLabel}>Lean BMI</AppText>
                            <AppText style={styles.statValue}>
                                {BMIByLeanMass(user.metrics.weightKg, user.metrics.heightCm, user.metrics.leanBodyMass)}
                            </AppText>
                            <AppText style={styles.statUnit}>Score</AppText>
                        </View>
                    </View>

                    {/* Tip Box */}
                    <View style={[styles.tipBox, ]}>
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

            {/* Activity Options */}
            <View style={styles.optionsContainer}>
                <AppText style={styles.optionsTitle}>Choose Your Activity Level</AppText>
                <AppText style={styles.optionsSubtitle}>Select the option that best matches your daily routine</AppText>
                
                {activityOptions.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.activityOption,
                            {
                                backgroundColor: user.metrics.activityLevel === item.key ? item.color + '20' : colors.cardBackground,
                                borderColor: user.metrics.activityLevel === item.key ? item.color : 'rgba(255,255,255,0.1)',
                                borderWidth: user.metrics.activityLevel === item.key ? 2 : 1,
                            }
                        ]}
                        onPress={() => handleActivityUpdate(item.key)}
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
                        
                        {user.metrics.activityLevel === item.key && (
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
    currentActivityCard: {
        margin: 15,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderLeftWidth: 4,
    },
    currentActivityGradient: {
        padding: 20,
    },
    currentActivityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    activityIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    currentActivityIcon: {
        width: 30,
        height: 30,
        tintColor: 'white',
    },
    currentActivityText: {
        flex: 1,
    },
    currentActivityLabel: {
        color: colors.mutedText,
        fontSize: scaleFont(12),
        marginBottom: 4,
        fontWeight: '600',
    },
    currentActivityTitle: {
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
        borderColor: 'rgba(255,255,255,0.1)',
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
    activityOption: {
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