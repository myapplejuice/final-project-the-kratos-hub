import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "../../components/screen-comps/app-text";
import { Images } from '../../common/settings/assets';
import { UserContext } from "../../common/contexts/user-context";
import { activityOptions, dietOptions, goalOptions } from "../../common/utils/global-options";
import { scaleFont } from "../../common/utils/scale-fonts";
import { routes } from "../../common/settings/constants";
import { colors, nutritionColors } from "../../common/settings/styling";
import { goalsActivityFeedbackText, goalsDietaryFeedbackTips, goalsWeightGoalFeedbackText } from "../../common/utils/text-generator";
import usePopups from "../../common/hooks/use-popups";
import APIService from "../../common/services/api-service";
import { recalculateUserInformation, recommendedWaterIntake } from "../../common/utils/metrics-calculator";
import Divider from "../../components/screen-comps/divider";
import AppScroll from "../../components/screen-comps/app-scroll";
import { convertFluid, convertHeight, convertWeight } from "../../common/utils/unit-converter";
import { formatDate } from "../../common/utils/date-time";


export default function Goals() {
    const { user, setUser } = useContext(UserContext);
    const { createPicker, createInput, createOptions, createToast, hideSpinner, showSpinner } = usePopups();

    const [activityFeedbacks, setActivityFeedbacks] = useState([]);
    const [weightGoalFeedbacks, setWeightGoalFeedbacks] = useState([]);
    const [activity, setActivity] = useState({});
    const [goal, setGoal] = useState({});
    const [diet, setDiet] = useState({});
    const [dietTips, setDietTips] = useState([]);

    useEffect(() => {
        function updateFeedbacks() {
            const activityFeedbacks = goalsActivityFeedbackText(user, 1);
            const weightGoalFeedBacks = goalsWeightGoalFeedbackText(user, 1);

            setActivityFeedbacks(activityFeedbacks);
            setWeightGoalFeedbacks(weightGoalFeedBacks);
        };

        const activity = activityOptions.find(item => item.key === user.metrics.activityLevel);
        const goal = goalOptions.find(item => item.key === user.nutrition.goal);
        const diet = dietOptions.find(item => item.key === user.nutrition.diet);
        const dietTips = goalsDietaryFeedbackTips(user, 1);

        setDiet(diet);
        setDietTips(dietTips);
        setActivity(activity);
        setGoal(goal);

        updateFeedbacks();
        const intervalId = setInterval(updateFeedbacks, 60 * 1000);
        return () => clearInterval(intervalId);
    }, [user]);

    async function handleHeightChange() {
        const guide = user.preferences.heightUnit.key === "ft/in"
            ? "Enter your height in feet and inches"
            : "Enter your height in cm";

        createInput({
            title: "Update Height",
            text: guide,
            confirmText: "Save",
            placeholders: user.preferences.heightUnit.key === "ft/in" ? [["ft", "in"]] : ["cm"],
            initialValues: user.preferences.heightUnit.key === "ft/in" ? [[user.metrics.heightFt, user.metrics.heightIn]] : [user.metrics.heightCm],
            extraConfigs: user.preferences.heightUnit.key === "ft/in" ? [[{ keyboardType: "numeric" }, { keyboardType: "numeric" }]] : [{ keyboardType: "numeric" }],
            onSubmit: async (values) => {
                try {
                    let payload = {};

                    if (user.preferences.heightUnit.key === "ft/in") {
                        let [[feet, inches]] = values;
                        feet = Number(feet);
                        inches = Number(inches);

                        if (feet === user.metrics.heightFt && inches === user.metrics.heightIn)
                            return;

                        const totalInches = (feet || 0) * 12 + (inches || 0);
                        const minInches = 20; // ~50 cm
                        const maxInches = 100; // ~254 cm
                        if (totalInches < minInches || totalInches > maxInches) {
                            createToast({ message: `Enter a valid height in ft/in (${Math.floor(minInches / 12)}'${minInches % 12}"–${Math.floor(maxInches / 12)}'${maxInches % 12}")!` });
                            return;
                        }

                        const cm = convertHeight({ feet, inches }, 'ft/in', 'cm');
                        payload = { heightCm: cm };

                    } else {
                        let [cmInput] = values;
                        const hCm = Number(cmInput);

                        if (hCm === user.metrics.heightCm)
                            return;

                        if (!cmInput || isNaN(hCm) || hCm < 50 || hCm > 250) {
                            createToast({ message: "Enter a valid height in cm (50-250)!" });
                            return;
                        }

                        payload = { heightCm: hCm };
                    }

                    const updatedUser = recalculateUserInformation({
                        ...user,
                        metrics: { ...user.metrics, ...payload },
                    });

                    const metricsPayload = { ...updatedUser.metrics };
                    const nutritionPayload = { ...updatedUser.nutrition };

                    showSpinner();
                    const result = await APIService.user.update({ metrics: metricsPayload, nutrition: nutritionPayload });

                    if (result.success) {
                        setUser(updatedUser);
                        createToast({ message: "Height updated" });
                    } else {
                        createToast({ message: `Failed to update height: ${result.message}` });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update height! " + err.message });
                } finally {
                    hideSpinner();
                }
            },
        });
    }

    async function handleWeightChange() {
        createInput({
            title: "Update Weight",
            text:
                user.preferences.weightUnit.key === "lb"
                    ? "Enter your weight in lb"
                    : "Enter your weight in kg",
            confirmText: "Save",
            placeholders: [user.preferences.weightUnit.key === "lb" ? "lb" : "kg"],
            initialValues: [
                user.preferences.weightUnit.key === "lb"
                    ? user.metrics.weightLb
                    : user.metrics.weightKg,
            ],
            extraConfigs: [{ keyboardType: "numeric" }],
            onSubmit: async (values) => {
                try {
                    let payload = {};

                    if (user.preferences.weightUnit.key === "lb") {
                        let [lbInput] = values;
                        const weightLb = Number(lbInput);

                        if (weightLb === user.metrics.weightLb)
                            return;

                        if (!lbInput || isNaN(weightLb) || weightLb < 50 || weightLb > 800) {
                            createToast({ message: "Enter a valid weight in lbs (50-800)!" });
                            return;
                        }

                        const weightKg = convertWeight(weightLb, 'lb', 'kg');
                        payload = { weightKg };

                    } else {
                        let [kgInput] = values;
                        const weightKg = Number(kgInput);

                        if (weightKg === user.metrics.weightKg)
                            return;

                        if (!kgInput || isNaN(weightKg) || weightKg < 20 || weightKg > 400) {
                            createToast({ message: "Enter a valid weight in kg (20-400)!" });
                            return;
                        }

                        payload = { weightKg };
                    }

                    const updatedUser = recalculateUserInformation({
                        ...user,
                        metrics: { ...user.metrics, ...payload },
                    });

                    const metricsPayload = { ...updatedUser.metrics };
                    const nutritionPayload = { ...updatedUser.nutrition };

                    showSpinner();
                    const result = await APIService.user.update({ metrics: metricsPayload, nutrition: nutritionPayload });

                    if (result.success) {
                        setUser(updatedUser);
                        createToast({ message: "Weight updated" });
                    } else {
                        createToast({ message: `Failed to update weight: ${result.message}` });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update weight!" + err.message });
                } finally {
                    hideSpinner();
                }
            },
        });
    }

    async function handleGenderChange() {
        createOptions({
            title: "Update Gender",
            options: ["Male", "Female"],
            current: user.gender === "male" ? "Male" : "Female",
            onConfirm: async (selectedGender) => {
                try {
                    selectedGender = selectedGender.toLowerCase();

                    if (!selectedGender || selectedGender === user.gender)
                        return;

                    const updatedUser = recalculateUserInformation({
                        ...user,
                        gender: selectedGender
                    });

                    const profilePayload = { gender: selectedGender };
                    const metricsPayload = { ...updatedUser.metrics };
                    const nutritionPayload = { ...updatedUser.nutrition };

                    showSpinner();
                    const result = await APIService.user.update({ profile: profilePayload, metrics: metricsPayload, nutrition: nutritionPayload });

                    if (result.success) {
                        setUser(updatedUser);
                        createToast({ message: "Gender updated" });
                    } else {
                        createToast({
                            message: `Failed to update gender: ${result.message}`,
                        });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update gender!" + err.message });
                }
                finally {
                    hideSpinner();
                }
            },
        });
    }

    async function handleAgeChange() {
        createPicker({
            title: "Update Age",
            min: 10,
            max: 120,
            initialValue: user.age,
            onSubmit: async (selectedAge) => {
                console.log(selectedAge)
                try {
                    selectedAge = Number(selectedAge);

                    if (selectedAge === user.age)
                        return;

                    if (!selectedAge || isNaN(selectedAge) || selectedAge < 5 || selectedAge > 120) {
                        createToast({ message: "Enter a valid age (5-120)!" });
                        return;
                    }

                    const updatedUser = recalculateUserInformation({
                        ...user,
                        age: selectedAge
                    });

                    const profilePayload = { age: updatedUser.age };
                    const metricsPayload = { ...updatedUser.metrics };
                    const nutritionPayload = { ...updatedUser.nutrition };

                    showSpinner();
                    const result = await APIService.user.update({ profile: profilePayload, metrics: metricsPayload, nutrition: nutritionPayload });

                    if (result.success) {
                        setUser(updatedUser);
                        createToast({ message: "Age updated" });
                    } else {
                        createToast({ message: `Failed to update age: ${result.message}` });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update age!" + err.message });
                }
                finally {
                    hideSpinner();
                }
            }
        })
    }

    async function handleWaterChange() {
        const waterMlRecommendation = recommendedWaterIntake(user.metrics.weightKg);
        const water = convertFluid(waterMlRecommendation, 'ml', user.preferences.fluidUnit.key);
        const recommendation = `Recommended daily water intake (${water} ${user.preferences.fluidUnit.field})`;

        createInput({
            title: "Water Intake",
            text: `${recommendation}`,
            confirmText: "Save",
            placeholders: [user.preferences.fluidUnit.field],
            initialValues: [convertFluid(user.nutrition.waterMl, 'ml', user.preferences.fluidUnit.key)],
            extraConfigs: [{ keyboardType: "numeric" }],
            onSubmit: async (values) => {
                try {
                    const [waterVal] = values;

                    if (waterVal == null || isNaN(waterVal) || waterVal <= 0) {
                        createToast({ message: "Enter a valid number of water intake!" });
                        return;
                    }

                    let waterMl = Number(waterVal);

                    if (user.preferences.fluidUnit.key === 'floz')
                        waterMl = convertFluid(Number(waterVal), 'floz', 'ml');
                    else if (user.preferences.fluidUnit.key === 'cups')
                        waterMl = convertFluid(Number(waterVal), 'cups', 'ml');

                    if (waterMl === user.nutrition.waterMl) return;

                    const updatedUser = recalculateUserInformation({
                        ...user,
                        nutrition: {
                            ...user.nutrition,
                            waterMl: Number(waterMl),
                        },
                    });

                    const nutritionPayload = { ...updatedUser.nutrition };

                    showSpinner();
                    const result = await APIService.user.update({ nutrition: nutritionPayload });

                    if (result.success) {
                        const date = formatDate(new Date(), { format: 'YYYY-MM-DD' });
                        const nutritionLogsResult = await APIService.nutrition.days.updateDay(date, { targetWaterMl: waterMl });
                        const nutritionLogsUpdatedUser = {
                            ...updatedUser,
                            nutritionLogs: {
                                ...user.nutritionLogs,
                                ...nutritionLogsResult.data.updatedDays
                            }
                        }

                        setUser(nutritionLogsUpdatedUser);
                        createToast({ message: "Water intake updated" });
                    } else {
                        createToast({ message: `Failed to update water intake: ${result.message}` });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update water intake!" + err.message });
                } finally {
                    hideSpinner();
                }
            },
        });
    }

    return (
        <AppScroll hideNavBarOnScroll={true} hideTopBarOnScroll={true} extraBottom={100} topPadding={false}>
            <View style={[styles.card, { margin: 0, borderTopEndRadius: 0, borderTopStartRadius: 0, paddingTop: 90, marginBottom: 15, borderRadius: 30 }]}>
                <View style={styles.metricRow}>
                    <TouchableOpacity onPress={handleHeightChange} style={styles.metricItem}>
                        <View style={{ padding: 15, backgroundColor: "#d8001d44", borderRadius: 50 }}>
                            <Image source={Images.ruler} style={{ width: 20, height: 20, tintColor: "#FF536A" }} />
                        </View>
                        <AppText style={[styles.heightText, { marginTop: 12, fontSize: scaleFont(14) }]}>
                            {user.preferences.heightUnit.key === "cm" ? (
                                <>
                                    {user.metrics.heightCm}
                                    <AppText style={[styles.heightUnit, { fontSize: scaleFont(9) }]}> /cm</AppText>
                                </>
                            ) : (
                                <>
                                    {(() => {
                                        const { feet, inches } = convertHeight(user.metrics.heightCm, 'cm', 'ft/in');
                                        return (
                                            <>
                                                {feet}
                                                <AppText style={[styles.heightUnit, { fontSize: scaleFont(15) }]}>′</AppText>
                                                {inches}
                                                <AppText style={[styles.heightUnit, { fontSize: scaleFont(15) }]}>″</AppText>
                                            </>
                                        );
                                    })()}
                                </>
                            )}
                        </AppText>
                        <AppText style={styles.metricLabel}>Height</AppText>
                    </TouchableOpacity>


                    <TouchableOpacity onPress={handleWeightChange} style={styles.metricItem}>
                        <View style={{ padding: 15, backgroundColor: "rgba(146, 104, 12, 0.3)", borderRadius: 50 }}>
                            <Image source={Images.tape} style={{ width: 20, height: 20, tintColor: 'rgb(255,205,97)' }} />
                        </View>
                        <AppText style={[styles.weightText, { marginTop: 12, fontSize: scaleFont(14) }]}>
                            {convertWeight(user.metrics.weightKg, 'kg', user.preferences.weightUnit.key)}
                            <AppText style={styles.weightUnit}> /{user.preferences.weightUnit.field}</AppText>
                        </AppText>
                        <AppText style={styles.metricLabel}>Weight</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleGenderChange} style={styles.metricItem}>
                        <View style={{ padding: 15, backgroundColor: user.gender === "male" ? "rgba(97, 171, 255, 0.3)" : "rgba(161, 10, 86, 0.3)", borderRadius: 50 }}>
                            <Image source={Images.sex} style={{ width: 20, height: 20, tintColor: user.gender === "male" ? "#61ABFF" : "#FF69B4" }} />
                        </View>
                        <AppText style={{ color: user.gender === "male" ? "#61ABFF" : "#FF69B4", marginTop: 12, fontSize: scaleFont(14) }}>
                            {user.gender === 'male' ? 'Male' : 'Female'}
                        </AppText>
                        <AppText style={styles.metricLabel}>Gender</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleAgeChange} style={styles.metricItem}>
                        <View style={{ padding: 15, backgroundColor: "rgba(20, 165, 33, 0.3)", borderRadius: 50 }}>
                            <Image source={Images.age} style={{ width: 20, height: 20, tintColor: "rgba(126, 255, 137, 1)" }} />
                        </View>
                        <AppText style={{ color: "rgba(126, 255, 137, 1)", marginTop: 12, fontSize: scaleFont(14) }}>{user.age || ""}</AppText>
                        <AppText style={styles.metricLabel}>Age</AppText>
                    </TouchableOpacity>
                </View>

                <View style={{ alignItems: 'center', padding: 20, backgroundColor: colors.backgroundTop, borderRadius: 25, marginTop: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                        <View style={[styles.rowInfo, { width: '40%', marginTop: 0, padding: 0 }]}>
                            <AppText style={styles.rowInfoValue}>
                                {activityOptions.find(opt => opt.key === user.metrics.activityLevel)?.label || "Unknown Activity Level"}
                            </AppText>
                            <AppText style={styles.rowInfoLabel}>Activity Level</AppText>
                        </View>

                        <Divider orientation="vertical" />

                        <View style={[styles.rowInfo, { width: '40%', marginTop: 0, padding: 0 }]}>
                            <AppText style={styles.rowInfoValue}>
                                {goalOptions.find(opt => opt.key === user.nutrition.goal)?.label || "Unknown Goal"}
                            </AppText>
                            <AppText style={styles.rowInfoLabel}>Weight Goal</AppText>
                        </View>
                    </View>
                    <Divider orientation="horizontal" style={{ marginVertical: 15 }} />

                    <View style={[styles.rowInfo, { marginTop: 0, padding: 0 }]}>
                        <AppText style={styles.rowInfoValue}>
                            {diet?.label || "Unknown Goal"}
                        </AppText>
                        <AppText style={styles.rowInfoLabel}>Diet</AppText>
                    </View>
                </View>
            </View>

            <AppText style={[styles.sectionTitle, { marginHorizontal: 25, marginTop: 15, marginBottom: 10 }]}>
                Current Lifestyle
            </AppText>

            <TouchableOpacity onPress={() => router.push(routes.EDIT_ACTIVITY)} style={{ backgroundColor: colors.cardBackground, borderRadius: 20, padding: 20, marginBottom: 15, marginHorizontal: 15, height: 250, alignItems: 'center', justifyContent: 'center' }}>
                <View >
                    <Image source={activity.image} style={{ tintColor: activity.color, width: 60, height: 60 }} />
                </View>

                <AppText style={[{ color: activity.color, marginTop: 5, marginBottom: 5, fontWeight: 'bold', fontSize: scaleFont(25) }]}>
                    {activity.label}
                </AppText>

                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(15), fontWeight: 'bold' }}>Activity Level</AppText>
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11), textAlign: 'center' }}>{activityFeedbacks[0]}</AppText>
                </View>

            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push(routes.EDIT_WEIGHT_GOAL)} style={{ backgroundColor: colors.cardBackground, borderRadius: 20, padding: 20, marginBottom: 15, marginHorizontal: 15, height: 250, alignItems: 'center', justifyContent: 'center' }}>
                <View >
                    <Image source={goal.image} style={{ tintColor: goal.color, width: 60, height: 60 }} />
                </View>

                <AppText style={[{ color: goal.color, marginTop: 5, marginBottom: 5, fontWeight: 'bold', fontSize: scaleFont(25) }]}>
                    {goal.label}
                </AppText>

                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(15), fontWeight: 'bold' }}>Weight Goal</AppText>
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11), textAlign: 'center' }}>{weightGoalFeedbacks[0]}</AppText>
                </View>

            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push(routes.EDIT_DIET)} style={{ backgroundColor: colors.cardBackground, borderRadius: 20, padding: 20, marginBottom: 15, marginHorizontal: 15, height: 250, alignItems: 'center', justifyContent: 'center' }}>
                <View >
                    <Image source={diet.image} style={{ tintColor: diet.color, width: 60, height: 60 }} />
                </View>

                <AppText style={[{ color: diet.color, marginTop: 5, marginBottom: 5, fontWeight: 'bold', fontSize: scaleFont(25) }]}>
                    {diet.label}
                </AppText>

                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(15), fontWeight: 'bold' }}>Diet</AppText>
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11), textAlign: 'center' }}>{dietTips[0]}</AppText>
                </View>

            </TouchableOpacity>

            <TouchableOpacity onPress={handleWaterChange} style={{ backgroundColor: colors.cardBackground, borderRadius: 20, padding: 20, marginBottom: 15, marginHorizontal: 15, height: 250, alignItems: 'center', justifyContent: 'center' }}>
                <View >
                    <Image source={Images.water} style={{ tintColor: nutritionColors.water1, width: 60, height: 60 }} />
                </View>

                <AppText style={[{ color: nutritionColors.water1, marginTop: 5, marginBottom: 5, fontWeight: 'bold', fontSize: scaleFont(25) }]}>
                    {convertFluid(user.nutrition.waterMl, 'ml', user.preferences.fluidUnit.key)} {user.preferences.fluidUnit.field}
                </AppText>

                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(15), fontWeight: 'bold' }}>  Water Intake</AppText>
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11), textAlign: 'center' }}>Make you are drinking adequate amounts of water every day</AppText>
                </View>
            </TouchableOpacity>

            <View style={[styles.card, { padding: 20, marginTop: 0 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={Images.magnifier}
                        style={{ width: 22, height: 22, tintColor: 'white' }}
                    />
                    <View style={{ flex: 1, marginStart: 13 }}>
                        <AppText style={{ color: 'white', fontSize: scaleFont(11), }}>
                            Adjusting a metric or measurement here can affect other data about you, (e.g. weight influencing BMI and BMR).
                        </AppText>
                    </View>
                </View>
            </View>
        </AppScroll >
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        padding: 20,
        borderRadius: 20,
        margin: 15,
    },
    metricRow: {
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    metricItem: {
        flex: 1,
        alignItems: "center",
        paddingBottom: 10
    },
    metricLabel: {
        fontSize: scaleFont(10),
        color: "rgb(102,102,102)"
    },
    heightText: {
        fontSize: scaleFont(12),
        color: "rgba(255,83,106,1)"
    },
    weightText: {
        fontSize: scaleFont(12),
        color: "rgba(255,205,97,1)"
    },
    rowInfo: {
        justifyContent: "center",
        alignItems: "center",
        padding: 10
    },
    rowInfoValue: {
        color: "white",
        fontSize: scaleFont(12)
    },
    rowInfoLabel: {
        color: "rgb(102,102,102)", fontSize: scaleFont(10)
    },
    heightUnit: {
        color: "rgb(102, 102, 102)",
    },
    weightText: {
        fontSize: scaleFont(12),
        color: "rgba(255, 205, 97, 1)",
    },
    weightUnit: {
        fontSize: scaleFont(10),
        color: "rgb(102, 102, 102)",
    },
    sectionTitle: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    feedbackText: {
        color: 'white',
        fontSize: scaleFont(12)
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden'
    },
    sectionHeaderIcon: {
        width: 40,
        height: 40,
    },
    sectionHeaderText: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: scaleFont(18),
        fontWeight: '700',
        color: 'white',
        marginBottom: 2,
    },
    sectionSubtitle: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
    },
    feedbackContainer: {
        marginBottom: 20,
    },
    feedbackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginHorizontal: 10
    },
    feedbackDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
        marginRight: 12,
    },
    feedbackText: {
        color: colors.mutedText,
        fontSize: scaleFont(12),
        lineHeight: 18,
        flex: 1,
    },
    actionCard: {
        backgroundColor: colors.backgroundTop,
        borderLeftWidth: 4,
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionText: {
        flex: 1,
    },
    actionTitle: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: scaleFont(11),
        color: colors.mutedText,
    },
    waterIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    waterIconImage: {
        width: 18,
        height: 18,
    },
    actionArrow: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIcon: {
        width: 14,
        height: 14,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: 'rgba(102,102,102,0.3)',
        marginVertical: 24,
        marginHorizontal: -10,
    },

});