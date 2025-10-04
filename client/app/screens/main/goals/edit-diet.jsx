import { useContext, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Keyboard } from "react-native";
import { colors, nutritionColors } from "../../../common/settings/styling";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { UserContext } from "../../../common/contexts/user-context";
import { dietOptions, goalOptions } from "../../../common/utils/global-options";
import { adjustColor } from "../../../common/utils/random-functions";
import { Image } from "expo-image";
import { Images } from "../../../common/settings/assets";
import usePopups from "../../../common/hooks/use-popups";
import { macrosFromCalories, recalculateUserInformation } from "../../../common/utils/metrics-calculator";
import { convertEnergy } from "../../../common/utils/unit-converter";
import { formatDate } from "../../../common/utils/date-time";
import AppText from "../../../components/screen-comps/app-text";
import PercentageBar from "../../../components/screen-comps/percentage-bar";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import AnimatedButton from "../../../components/screen-comps/animated-button";
import APIService from "../../../common/services/api-service";
import AppScroll from "../../../components/screen-comps/app-scroll";

export default function EditDiet() {
    const { createOptions, createToast, hideSpinner, showSpinner, createDialog } = usePopups();
    const { user, setUser } = useContext(UserContext);

    const [diet, setDiet] = useState({});
    const [dietKey, setDietKey] = useState('');
    const [currentCarbGrams, setCurrentCarbGrams] = useState(0);
    const [currentProteinGrams, setCurrentProteinGrams] = useState(0);
    const [currentFatGrams, setCurrentFatGrams] = useState(0);
    const [currentCarbRate, setCurrentCarbRate] = useState(0);
    const [currentProteinRate, setCurrentProteinRate] = useState(0);
    const [currentFatRate, setCurrentFatRate] = useState(0);
    const [energyIntake, setEnergyIntake] = useState(0);

    useEffect(() => {
        const dietObj = dietOptions.find(item => item.key === user.nutrition.diet);

        setDiet(dietObj);
        setDietKey(dietObj.key);

        setCurrentCarbGrams(user.nutrition.carbGrams);
        setCurrentProteinGrams(user.nutrition.proteinGrams);
        setCurrentFatGrams(user.nutrition.fatGrams);

        setCurrentCarbRate(user.nutrition.carbRate);
        setCurrentProteinRate(user.nutrition.proteinRate);
        setCurrentFatRate(user.nutrition.fatRate);

        setEnergyIntake(convertEnergy(user.nutrition.setEnergyKcal, 'kcal', user.preferences.energyUnit.key));
    }, [user]);

    useEffect(() => {
        const macros = macrosFromCalories(user.nutrition.setEnergyKcal, 'custom', currentCarbRate, currentProteinRate, currentFatRate);

        setCurrentCarbGrams(macros.carbs);
        setCurrentProteinGrams(macros.protein);
        setCurrentFatGrams(macros.fat);
    }, [currentCarbRate, currentProteinRate, currentFatRate]);

    async function handleDietOptions() {
        Keyboard.dismiss();

        createOptions({
            title: "Select Diet",
            current: diet.label,
            options: dietOptions.map(item => item.label),
            onConfirm: async (label) => {
                try {
                    showSpinner();
                    const newDiet = dietOptions.find(item => item.label === label);
                    const newDietKey = newDiet.key;
                    if (newDietKey === dietKey) {
                        createToast({ message: "No changes made!" });
                        return;
                    }

                    let carbRate, proteinRate, fatRate;
                    if (newDietKey === "custom") {
                        carbRate = user.nutrition.carbRate;
                        proteinRate = user.nutrition.proteinRate;
                        fatRate = user.nutrition.fatRate;
                    }
                    else {
                        carbRate = newDiet.carbRate;
                        proteinRate = newDiet.proteinRate;
                        fatRate = newDiet.fatRate;
                    }

                    const newMacros = macrosFromCalories(user.nutrition.setEnergyKcal, newDietKey, carbRate, proteinRate, fatRate);
                    const carbGrams = newMacros.carbs;
                    const proteinGrams = newMacros.protein;
                    const fatGrams = newMacros.fat;

                    const updatedUser = recalculateUserInformation({
                        ...user,
                        nutrition: {
                            ...user.nutrition,
                            diet: newDietKey,
                            carbRate,
                            proteinRate,
                            fatRate,
                            carbGrams,
                            proteinGrams,
                            fatGrams,
                        },
                    });

                    const metricsPayload = { ...updatedUser.metrics };
                    const nutritionPayload = { ...updatedUser.nutrition };

                    const result = await APIService.user.update({ metrics: metricsPayload, nutrition: nutritionPayload });

                    if (result.success) {
                        const date = formatDate(new Date(), { format: "YYYY-MM-DD" });
                        const updatedDay = {
                            diet: newDietKey,
                            carbRate,
                            proteinRate,
                            fatRate,
                            targetCarbGrams: carbGrams,
                            targetProteinGrams: proteinGrams,
                            targetFatGrams: fatGrams
                        };

                        const nutritionLogsResult = await APIService.nutrition.days.updateDay(date, updatedDay);
                        const nutritionLogsUpdatedUser = {
                            ...updatedUser,
                            nutritionLogs: {
                                ...user.nutritionLogs,
                                ...nutritionLogsResult.data.updatedDays
                            }
                        }

                        setUser(nutritionLogsUpdatedUser);
                        createToast({ message: "Diet successfully updated!" });
                    } else {
                        createToast({ message: `Failed to update diet: ${result.message}` });
                    }
                } catch (err) {
                    console.log(err.message);
                    createToast({ message: "Failed to update diet!" });
                }
                finally {
                    hideSpinner();
                }
            }
        });
    }

    async function handleCustomDiet() {
        Keyboard.dismiss();

        try {
            showSpinner();

            const rateSum = Number(currentCarbRate) + Number(currentProteinRate) + Number(currentFatRate);
            if (rateSum !== 100) {
                createToast({ message: "Macro percentages must sum to 100!" });
                return;
            }

            let carbRate = Number(currentCarbRate);
            let proteinRate = Number(currentProteinRate);
            let fatRate = Number(currentFatRate);
            if (carbRate === user.nutrition.carbRate && proteinRate === user.nutrition.proteinRate && fatRate === user.nutrition.fatRate) {
                createToast({ message: "No changes made!" });
                return;
            }

            const newMacros = macrosFromCalories(user.nutrition.setEnergyKcal, "custom", carbRate, proteinRate, fatRate);
            const carbGrams = newMacros.carbs;
            const proteinGrams = newMacros.protein;
            const fatGrams = newMacros.fat;

            const updatedUser = recalculateUserInformation({
                ...user,
                nutrition: {
                    ...user.nutrition,
                    diet: "custom",
                    carbRate,
                    proteinRate,
                    fatRate,
                    carbGrams,
                    proteinGrams,
                    fatGrams,
                },
            });

            const metricsPayload = { ...updatedUser.metrics };
            const nutritionPayload = { ...updatedUser.nutrition };

            const result = await APIService.user.update({ metrics: metricsPayload, nutrition: nutritionPayload });

            if (result.success) {
                const date = formatDate(new Date(), { format: "YYYY-MM-DD" });
                const updatedDay = {
                    diet: "custom",
                    carbRate,
                    proteinRate,
                    fatRate,
                    targetCarbGrams: carbGrams,
                    targetProteinGrams: proteinGrams,
                    targetFatGrams: fatGrams
                };

                const nutritionLogsResult = await APIService.nutrition.days.updateDay(date, updatedDay);
                const nutritionLogsUpdatedUser = {
                    ...updatedUser,
                    nutritionLogs: {
                        ...user.nutritionLogs,
                        ...nutritionLogsResult.data.updatedDays
                    }
                }

                setUser(nutritionLogsUpdatedUser);
                createToast({ message: "Diet successfully updated!" });
            } else {
                createToast({ message: `Failed to update diet: ${result.message}` });
            }
        } catch (err) {
            console.log(err.message);
            createToast({ message: "Failed to update weight goal!" });
        }
        finally {
            hideSpinner();
        }
    }

    async function handleEnergyIntake() {
        Keyboard.dismiss();
        let setEnergyKcal = energyIntake;

        if (user.preferences.energyUnit.key === "kj")
            setEnergyKcal = convertEnergy(Number(energyIntake), "kj", "kcal");

        if (setEnergyKcal === user.nutrition.setEnergyKcal) {
            createToast({ message: "No changes made!" });
            return;
        }

        if (setEnergyKcal <= 0) {
            createToast({ message: "Energy intake can't be 0 or below!" });
            return;
        }

        const factor = Math.abs(setEnergyKcal - user.nutrition.recommendedEnergyKcal);

        if (factor > 500) {
            if (setEnergyKcal > user.nutrition.recommendedEnergyKcal) {
                return createDialog({ title: "Warning", text: "This energy intake is too high for your TDEE!\n\nAre you sure you want to continue?", onConfirm: () => confirmEnergyIntake(setEnergyKcal) });
            } else {
                return createDialog({  title: "Warning",text: "This energy intake is too low for your TDEE!\n\nAre you sure you want to continue?", onConfirm: () => confirmEnergyIntake(setEnergyKcal) });
            }
        }else {
            confirmEnergyIntake(setEnergyKcal);
        }
    }

    async function confirmEnergyIntake(setEnergyKcal) {
        showSpinner();
        try {
            const newMacros = macrosFromCalories(setEnergyKcal, dietKey, currentCarbRate, currentProteinRate, currentFatRate);
            const carbGrams = newMacros.carbs;
            const proteinGrams = newMacros.protein;
            const fatGrams = newMacros.fat;

            const updatedUser = recalculateUserInformation({
                ...user,
                nutrition: {
                    ...user.nutrition,
                    setEnergyKcal,
                    carbGrams,
                    proteinGrams,
                    fatGrams
                },
            });

            const metricsPayload = { ...updatedUser.metrics };
            const nutritionPayload = { ...updatedUser.nutrition };

            const result = await APIService.user.update({ metrics: metricsPayload, nutrition: nutritionPayload });

            if (result.success) {
                const date = new Date().toISOString().split('T')[0];
                const updatedDay = {
                    targetEnergyKcal: setEnergyKcal,
                    targetCarbGrams: carbGrams,
                    targetProteinGrams: proteinGrams,
                    targetFatGrams: fatGrams
                };
                const nutritionLogsResult = await APIService.nutrition.days.updateDay(date, updatedDay);

                const nutritionLogsUpdatedUser = {
                    ...updatedUser,
                    nutritionLogs: {
                        ...user.nutritionLogs,
                        ...nutritionLogsResult.data.updatedDays
                    }
                }

                setUser(nutritionLogsUpdatedUser);
                createToast({ message: "Daily energy intake updated!" });
            } else {
                createToast({ message: `Failed to update energy intake: ${result.message}` });
            }
        } catch (err) {
            console.log(err.message);
            createToast({ message: "Failed to update energy intake!" });
        }
        finally {
            hideSpinner();
        }
    }

    return (
        <AppScroll extraBottom={150}>
            {/* Current Diet Header */}
            <TouchableOpacity
                onPress={handleDietOptions}
                style={[styles.currentDietCard, { borderLeftColor: diet.color }]}
            >
                <View style={styles.currentDietContent}>
                    <View style={[styles.dietIconContainer, { backgroundColor: diet.color + '30', overflow: 'hidden' }]}>
                        <Image
                            source={diet.image}
                            style={[styles.dietIcon, { tintColor: diet.color }]}
                        />
                    </View>
                    <View style={styles.dietText}>
                        <AppText style={styles.currentDietLabel}>Current Diet Plan</AppText>
                        <AppText style={[styles.currentDietTitle, { color: diet.color }]}>
                            {diet.label}
                        </AppText>
                        <AppText style={styles.currentDietDescription}>{diet.description}</AppText>
                    </View>
                    <View style={[styles.arrowContainer]}>
                        <Image
                            source={Images.arrow}
                            style={[styles.arrowIcon, { tintColor: 'white' }]}
                        />
                    </View>
                </View>
            </TouchableOpacity>

            {/* Info Card */}
            <View style={styles.infoCard}>
                <View style={styles.infoContent}>
                    <View style={[styles.infoIcon]}>
                        <Image
                            source={Images.magnifier}
                            style={[styles.infoIconImage, { tintColor: 'white' }]}
                        />
                    </View>
                    <View style={styles.infoText}>
                        <AppText style={styles.infoTitle}>Energy & Nutrition</AppText>
                        <AppText style={styles.infoDescription}>
                            Energy intake drives your weight goals. Pick a diet that fits your health and lifestyle.
                        </AppText>
                    </View>
                </View>
            </View>

            {/* Macronutrient Section */}
            <View style={styles.macroCard}>
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>Macronutrient Breakdown</AppText>
                    <AppText style={styles.sectionSubtitle}>Daily distribution</AppText>
                </View>

                <View style={styles.macrosGrid}>
                    <View style={styles.macroItem}>
                        <View style={[styles.macroIconContainer, { backgroundColor: nutritionColors.carbs1 + '20' }]}>
                            <Image source={Images.carbs1} style={[styles.macroIcon, { tintColor: nutritionColors.carbs1 }]} />
                        </View>
                        <AppText style={styles.macroLabel}>Carbs</AppText>
                        <AppText style={styles.macroValue}>{currentCarbGrams}g</AppText>
                        <AppText style={styles.macroPercentage}>{currentCarbRate}%</AppText>
                    </View>

                    <View style={styles.macroItem}>
                        <View style={[styles.macroIconContainer, { backgroundColor: nutritionColors.protein1 + '20' }]}>
                            <Image source={Images.protein5} style={[styles.macroIcon, { tintColor: nutritionColors.protein1 }]} />
                        </View>
                        <AppText style={styles.macroLabel}>Protein</AppText>
                        <AppText style={styles.macroValue}>{currentProteinGrams}g</AppText>
                        <AppText style={styles.macroPercentage}>{currentProteinRate}%</AppText>
                        <AppText style={styles.requirementText}>
                            Req: {user.nutrition.proteinRequirement}g
                        </AppText>
                    </View>

                    <View style={styles.macroItem}>
                        <View style={[styles.macroIconContainer, { backgroundColor: nutritionColors.fat1 + '20' }]}>
                            <Image source={Images.butter} style={[styles.macroIcon, { tintColor: nutritionColors.fat1 }]} />
                        </View>
                        <AppText style={styles.macroLabel}>Fat</AppText>
                        <AppText style={styles.macroValue}>{currentFatGrams}g</AppText>
                        <AppText style={styles.macroPercentage}>{currentFatRate}%</AppText>
                    </View>
                </View>

                <View style={styles.percentageSection}>
                    <PercentageBar
                        values={[
                            { percentage: Number(currentCarbRate), color: nutritionColors.carbs1 },
                            { percentage: Number(currentProteinRate), color: nutritionColors.protein1 },
                            { percentage: Number(currentFatRate), color: nutritionColors.fat1 },
                        ]}
                        barHeight={12}
                        showPercentage={true}
                        minVisiblePercentage={3}
                    />
                    <AppText style={styles.percentageLabel}>
                        Macronutrient Distribution (% of Total Energy)
                    </AppText>
                </View>

                {dietKey === 'custom' && (
                    <View style={styles.customMacroSection}>
                        <AppText style={styles.customTitle}>Customize Macros</AppText>
                        <View style={styles.macroInputs}>
                            <View style={styles.macroInputGroup}>
                                <AppText style={[styles.macroInputLabel, { color: nutritionColors.carbs1 }]}>Carbs</AppText>
                                <AppTextInput
                                    value={String(currentCarbRate)}
                                    onChangeText={setCurrentCarbRate}
                                    style={[styles.macroInput, { borderColor: nutritionColors.carbs1 + '40' }]}
                                    placeholder="%"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.macroInputGroup}>
                                <AppText style={[styles.macroInputLabel, { color: nutritionColors.protein1 }]}>Protein</AppText>
                                <AppTextInput
                                    value={String(currentProteinRate)}
                                    onChangeText={setCurrentProteinRate}
                                    style={[styles.macroInput, { borderColor: nutritionColors.protein1 + '40' }]}
                                    placeholder="%"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.macroInputGroup}>
                                <AppText style={[styles.macroInputLabel, { color: nutritionColors.fat1 }]}>Fat</AppText>
                                <AppTextInput
                                    value={String(currentFatRate)}
                                    onChangeText={setCurrentFatRate}
                                    style={[styles.macroInput, { borderColor: nutritionColors.fat1 + '40' }]}
                                    placeholder="%"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        <AnimatedButton
                            onPress={handleCustomDiet}
                            style={[styles.actionButton, { backgroundColor: diet.color }]}
                            textStyle={styles.actionButtonText}
                            title="Confirm Macro Changes"
                        />
                    </View>
                )}
            </View>

            {/* Energy Intake Section */}
            <View style={styles.energyCard}>
                <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>Daily Energy Intake</AppText>
                    <AppText style={styles.sectionSubtitle}>Manage your calorie goals</AppText>
                </View>

                <View style={styles.goalBadge}>
                    <AppText style={styles.goalLabel}>Weight Goal:</AppText>
                    <View style={[styles.goalValue, { backgroundColor: goalOptions.find(option => option.key === user.nutrition.goal).color + '20' }]}>
                        <AppText style={[styles.goalValueText, { color: goalOptions.find(option => option.key === user.nutrition.goal).color }]}>
                            {goalOptions.find(option => option.key === user.nutrition.goal).label}
                        </AppText>
                    </View>
                </View>

                <View style={styles.energyStats}>
                    <View style={styles.energyStat}>
                        <AppText style={styles.energyStatLabel}>Current Intake</AppText>
                        <AppText style={styles.energyStatValue}>
                            {convertEnergy(user.nutrition.setEnergyKcal, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                        </AppText>
                    </View>
                    <View style={styles.energyStat}>
                        <AppText style={styles.energyStatLabel}>Your TDEE</AppText>
                        <AppText style={styles.energyStatValue}>
                            {convertEnergy(user.metrics.tdee, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                        </AppText>
                    </View>
                    <View style={styles.energyStat}>
                        <AppText style={styles.energyStatLabel}>Recommended</AppText>
                        <AppText style={[styles.energyStatValue, { color: colors.main }]}>
                            {convertEnergy(user.nutrition.recommendedEnergyKcal, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                        </AppText>
                    </View>
                </View>

                <View style={styles.energyInputSection}>
                    <AppText style={styles.energyInputLabel}>Adjust Daily Energy Intake</AppText>
                    <AppTextInput
                        value={String(energyIntake)}
                        onChangeText={setEnergyIntake}
                        style={styles.energyInput}
                        placeholder={`Enter energy in ${user.preferences.energyUnit.field}`}
                        keyboardType="numeric"
                    />
                    <AnimatedButton
                        onPress={handleEnergyIntake}
                        style={[styles.actionButton, { backgroundColor: colors.main }]}
                        textStyle={styles.actionButtonText}
                        title="Update Energy Intake"
                    />
                </View>
            </View>
        </AppScroll>
    );
}
const styles = StyleSheet.create({
    currentDietCard: {
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 20,
        borderLeftWidth: 4,
        overflow: 'hidden',
    },
    currentDietContent: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dietIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    dietIcon: {
        width: 30,
        height: 30,
    },
    dietText: {
        flex: 1,
    },
    currentDietLabel: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        fontWeight: '600',
        marginBottom: 2,
    },
    currentDietTitle: {
        fontSize: scaleFont(20),
        fontWeight: '700',
        marginBottom: 4,
    },
    currentDietDescription: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        lineHeight: 16,
    },
    arrowContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIcon: {
        width: 16,
        height: 16,
    },
    infoCard: {
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    infoContent: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoIconImage: {
        width: 25,
        height: 25,
    },
    infoText: {
        flex: 1,
    },
    infoTitle: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    infoDescription: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        lineHeight: 16,
    },
    macroCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 15,
        marginTop: 15,
        paddingTop: 20,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    energyCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 15,
        marginTop: 20,
        padding: 20,
        borderRadius: 20,
    },
    sectionHeader: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: scaleFont(18),
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
    },
    macrosGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    macroItem: {
        alignItems: 'center',
        flex: 1,
    },
    macroIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    macroIcon: {
        width: 24,
        height: 24,
    },
    macroLabel: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        marginBottom: 4,
        fontWeight: '600',
    },
    macroValue: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        color: 'white',
        marginBottom: 2,
    },
    macroPercentage: {
        fontSize: scaleFont(11),
        color: colors.mutedText,
    },
    requirementText: {
        fontSize: scaleFont(10),
        color: colors.mutedText,
        marginTop: 2,
    },
    percentageSection: {
        marginBottom: 20,
    },
    percentageLabel: {
        fontSize: scaleFont(10),
        color: colors.mutedText,
        textAlign: 'center',
        marginTop: 15,
    },
    customMacroSection: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 20,
    },
    customTitle: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: 'white',
        marginBottom: 12,
        textAlign: 'center',
    },
    macroInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    macroInputGroup: {
        alignItems: 'center',
        flex: 1,
    },
    macroInputLabel: {
        fontSize: scaleFont(11),
        fontWeight: '600',
        marginBottom: 6,
    },
    macroInput: {
        height: 44,
        width: '80%',
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: colors.inputBackground,
        color: 'white',
        borderWidth: 1,
        textAlign: 'center',
        fontSize: scaleFont(14),
    },
    goalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
    },
    goalLabel: {
        fontSize: scaleFont(14),
        color: colors.mutedText,
        fontWeight: '600',
    },
    goalValue: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    goalValueText: {
        fontSize: scaleFont(12),
        fontWeight: '700',
    },
    energyStats: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    energyStat: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    energyStatLabel: {
        fontSize: scaleFont(13),
        color: colors.mutedText,
    },
    energyStatValue: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: 'white',
    },
    energyInputSection: {
        marginTop: 10,
    },
    energyInputLabel: {
        fontSize: scaleFont(13),
        color: colors.mutedText,
        marginBottom: 8,
        fontWeight: '600',
    },
    energyInput: {
        height: 50,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: colors.inputBackground,
        color: 'white',
        borderWidth: 1,
        borderColor: colors.inputBorderColor,
        fontSize: scaleFont(14),
        marginBottom: 15,
    },
    actionButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: scaleFont(14),
    },
});
