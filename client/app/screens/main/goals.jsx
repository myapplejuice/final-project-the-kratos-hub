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
            confirmText: "SAVE",
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
                        createToast({ message: "Height successfully updated!" });
                    } else {
                        createToast({ message: `Failed to update height: ${result.message}` });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update height!" });
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
            confirmText: "SAVE",
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
                        createToast({ message: "Weight successfully updated!" });
                    } else {
                        createToast({ message: `Failed to update weight: ${result.message}` });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update weight!" });
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
                        createToast({ message: "Gender successfully updated!" });
                    } else {
                        createToast({
                            message: `Failed to update gender: ${result.message}`,
                        });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update gender!" });
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
                        createToast({ message: "Age successfully updated!" });
                    } else {
                        createToast({ message: `Failed to update age: ${result.message}` });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update age!" });
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
            confirmText: "SAVE",
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
                        createToast({ message: "Water intake successfully updated!" });
                    } else {
                        createToast({ message: `Failed to update water intake: ${result.message}` });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update water intake!" });
                } finally {
                    hideSpinner();
                }
            },
        });
    }

    return (
        <AppScroll backgroundColor={colors.cardBackground} hideNavBarOnScroll={true} hideTopBarOnScroll={true} extraBottom={100}>
            <View style={[styles.card, { margin: 0, borderRadius: 0 }]}>
                <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                        <AppText style={styles.heightText}>
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
                                                <AppText style={[styles.heightUnit, { fontSize: scaleFont(12) }]}>′</AppText>
                                                {inches}
                                                <AppText style={[styles.heightUnit, { fontSize: scaleFont(12) }]}>″</AppText>
                                            </>
                                        );
                                    })()}
                                </>
                            )}
                        </AppText>
                        <AppText style={styles.metricLabel}>Height</AppText>
                    </View>

                    <Divider length="70%" />

                    {/* WEIGHT */}
                    <View style={styles.metricItem}>
                        <AppText style={styles.weightText}>
                            {convertWeight(user.metrics.weightKg, 'kg', user.preferences.weightUnit.key)}
                            <AppText style={styles.weightUnit}> /{user.preferences.weightUnit.field}</AppText>
                        </AppText>
                        <AppText style={styles.metricLabel}>Weight</AppText>
                    </View>
                    <Divider length="70%" />

                    {/* GENDER */}
                    <View style={styles.metricItem}>
                        <AppText style={{ color: user.gender === "male" ? "#61ABFF" : "#FF69B4", fontSize: scaleFont(12) }}>{user.gender === 'male' ? 'Male' : 'Female'}</AppText>
                        <AppText style={styles.metricLabel}>Gender</AppText>
                    </View>
                    <Divider length="70%" />
                    {/* AGE */}
                    <View style={styles.metricItem}>
                        <AppText style={{ color: "rgba(126, 255, 137, 1)", fontSize: scaleFont(12) }}>{user.age || ""}</AppText>
                        <AppText style={styles.metricLabel}>Age</AppText>
                    </View>
                </View>

                <Divider orientation="horizontal" />

                <View style={styles.rowInfo}>
                    <AppText style={styles.rowInfoValue}>
                        {activityOptions.find(opt => opt.key === user.metrics.activityLevel)?.label || "Unknown Activity Level"}
                    </AppText>
                    <AppText style={styles.rowInfoLabel}>Activity Level</AppText>
                </View>

                <Divider orientation="horizontal" />

                <View style={[styles.rowInfo, { marginBottom: 0, paddingBottom: 0 }]}>
                    <AppText style={styles.rowInfoValue}>
                        {goalOptions.find(opt => opt.key === user.nutrition.goal)?.label || "Unknown Goal"}
                    </AppText>
                    <AppText style={styles.rowInfoLabel}>Current Goal</AppText>
                </View>
            </View>

            <View style={{ backgroundColor: colors.background }}>
                <View style={[styles.card, { padding: 10 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={Images.magnifier}
                            style={{ width: 22, height: 22, tintColor: 'white' }}
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <AppText style={{ color: 'white', fontSize: scaleFont(12), }}>
                                Adjusting a metric or measurement here can affect other data about you, (e.g. weight influencing BMI and BMR).
                            </AppText>
                        </View>
                    </View>
                </View>
                <AppText style={[styles.sectionTitle, { marginHorizontal: 25, fontSize: scaleFont(15), marginBottom: 0 }]}>
                    Stay on track with your goals & physical info!
                </AppText>
                <AppText style={{ marginHorizontal: 25, fontSize: scaleFont(10), color: colors.mutedText, marginBottom: 10, }}>
                    Tap below...
                </AppText>
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginHorizontal: 15 }}>

                    {[
                        {
                            key: "height",
                            label: "Height",
                            value: user.preferences.heightUnit === "metric" ? `${user.metrics.heightCm} cm` : `${user.metrics.heightFt}'${user.metrics.heightIn}"`,
                            color: "#FF536A", // rgba(255,83,106,1)
                            image: Images.ruler,
                            onPress: handleHeightChange
                        },
                        {
                            key: "weight",
                            label: "Weight",
                            value: user.preferences.weightUnit === "metric" ? `${user.metrics.weightKg} kg` : `${user.metrics.weightLb} lb`,
                            color: "#FFCD61",
                            image: Images.tape,
                            onPress: handleWeightChange
                        },
                        {
                            key: "gender",
                            label: "Gender",
                            value: user.gender === "male" ? "Male" : "Female",
                            color: user.gender === "male" ? "#61ABFF" : "#FF69B4",
                            image: Images.sex,
                            onPress: handleGenderChange
                        },
                        {
                            key: "age",
                            label: "Age",
                            value: user.age || "",
                            color: "#7EFF89",
                            image: Images.age,
                            onPress: handleAgeChange
                        },
                    ].map((item, i) => (
                        <TouchableOpacity
                            key={item.key}
                            onPress={item.onPress}
                            style={{
                                width: "48%",
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: colors.cardBackground,
                                padding: 10,
                                borderRadius: 12,
                                marginBottom: i < 2 ? 15 : 0,
                            }}
                        >
                            <View
                                style={{
                                    padding: 10,
                                    borderRadius: 10,
                                    backgroundColor: item.color + "33",
                                }}
                            >
                                <Image source={item.image} style={{ width: 30, height: 30, tintColor: item.color }} />
                            </View>

                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <AppText style={{ fontWeight: "700", fontSize: scaleFont(14), color: item.color }}>
                                    {item.label}
                                </AppText>
                                <AppText style={[styles.sectionTitle, { fontSize: scaleFont(10), color: colors.mutedText, marginBottom: 0 }]}>
                                    Tap to update
                                </AppText>
                            </View>
                            <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: "white", marginLeft: 4, alignSelf: "center" }} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[styles.card, { marginBottom: 0 }]}>
                    <AppText style={styles.sectionTitle}>Activity Level & Lifestyle</AppText>
                    {activityFeedbacks.map((line, i) => (
                        <View key={i} style={styles.feedbackRow}>
                            <AppText style={styles.feedbackBullet}>• </AppText>
                            <AppText style={styles.feedbackText}>{line}</AppText>
                        </View>
                    ))}

                    <TouchableOpacity onPress={() => router.push(routes.EDIT_ACTIVITY)} style={[styles.activityRow, { backgroundColor: activity.color + '20', borderRadius: 15, borderColor: activity.color }]}>
                        <View style={[styles.activityIconWrapper, {}]}>
                            <Image source={activity.image} style={[styles.activityIcon, { tintColor: activity.color }]} />
                        </View>

                        <View style={styles.activityTextWrapper}>
                            <AppText style={[styles.activityLabel, { color: activity.color }]}>{activity.label}</AppText>
                            <AppText style={styles.activitySubText}>Been more active recently? Tap to update activity levels</AppText>
                        </View>

                        <Image source={Images.arrow} style={[styles.activityArrow]} />
                    </TouchableOpacity>

                    <Divider orientation="horizontal" style={{ backgroundColor: "rgba(102,102,102,0.2)", marginVertical: 15 }} thickness={2} />

                    <AppText style={styles.sectionTitle}>Weight Goal</AppText>
                    {weightGoalFeedbacks.map((line, i) => (
                        <View key={i} style={styles.feedbackRow}>
                            <AppText style={styles.feedbackBullet}>• </AppText>
                            <AppText style={styles.feedbackText}>{line}</AppText>
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={() => router.push(routes.EDIT_WEIGHT_GOAL)}
                        style={[styles.activityRow, { backgroundColor: goal.color + "20", borderRadius: 15, borderColor: goal.color }]} // gold-ish tint
                    >
                        <View style={[styles.activityIconWrapper]}>
                            <Image source={goal.image} style={[styles.activityIcon, { tintColor: goal.color }]} />
                        </View>

                        <View style={styles.activityTextWrapper}>
                            <AppText style={[styles.activityLabel, { color: goal.color }]}>
                                {goal.label}
                            </AppText>
                            <AppText style={styles.activitySubText}>New weight goals? Tap to update your weight goal</AppText>
                        </View>

                        <Image source={Images.arrow} style={[styles.activityArrow, {}]} />
                    </TouchableOpacity>

                    <Divider orientation="horizontal" style={{ backgroundColor: "rgba(102,102,102,0.2)", marginVertical: 15 }} thickness={2} />

                    <AppText style={styles.sectionTitle}>Current Diet</AppText>
                    {dietTips.map((tip, i) => (
                        <View key={i}>
                            <View style={styles.feedbackRow}>
                                <AppText style={styles.feedbackBullet}>• </AppText>
                                <AppText style={styles.feedbackText}>{tip}</AppText>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={() => router.push(routes.EDIT_DIET)}
                        style={[styles.activityRow, { backgroundColor: diet.color + '20', borderRadius: 15, borderColor: diet.color }]}
                    >
                        <View style={[styles.activityIconWrapper]}>
                            <Image source={diet.image} style={[styles.activityIcon, { tintColor: diet.color }]} />
                        </View>
                        <View style={styles.activityTextWrapper}>
                            <AppText style={[styles.activityLabel, { color: diet.color }]}>{diet.label}</AppText>
                            <AppText style={styles.activitySubText}>New diet plan and macros? Tap here to switch up your diet</AppText>
                        </View>
                        <Image source={Images.arrow} style={styles.activityArrow} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleWaterChange}
                        style={[styles.activityRow, { backgroundColor: nutritionColors.water1 + '20', borderRadius: 15 }]}
                    >
                        <View style={[styles.activityIconWrapper]}>
                            <Image source={Images.water} style={[styles.activityIcon, { tintColor: nutritionColors.water1 }]} />
                        </View>
                        <View style={[styles.activityTextWrapper]}>
                            <AppText style={[styles.activityLabel, { color: nutritionColors.water1 }]}>Water</AppText>
                            <AppText style={[styles.activitySubText]}>Make sure you're having enough water! Tap here to adjust water intake</AppText>
                        </View>
                        <Image source={Images.arrow} style={[styles.activityArrow]} />
                    </TouchableOpacity>
                </View>
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        padding: 15,
        borderRadius: 15,
        margin: 15,
    },

    metricRow: { flexDirection: "row", justifyContent: "space-evenly" },
    metricItem: { flex: 1, alignItems: "center", paddingBottom: 10 },
    metricLabel: { fontSize: scaleFont(10), color: "rgb(102,102,102)" },
    divider: { width: 1, backgroundColor: "rgba(102,102,102,0.2)", alignSelf: "center", height: "60%" },
    heightText: { fontSize: scaleFont(12), color: "rgba(255,83,106,1)" },
    weightText: { fontSize: scaleFont(12), color: "rgba(255,205,97,1)" },
    rowInfo: { justifyContent: "center", alignItems: "center", padding: 10 },
    rowInfoValue: { color: "white", fontSize: scaleFont(12) },
    rowInfoLabel: { color: "rgb(102,102,102)", fontSize: scaleFont(10) },
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

    introText: {
        color: 'white',
        fontSize: scaleFont(17),
        lineHeight: 24,
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
    feedbackText: {
        color: 'white',
        fontSize: scaleFont(12),
        lineHeight: 20,
        flex: 1,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        padding: 10
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
        marginLeft: 5,
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

});