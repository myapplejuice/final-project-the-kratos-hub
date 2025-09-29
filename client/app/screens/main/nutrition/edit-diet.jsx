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
import { convertEnergy} from "../../../common/utils/unit-converter";
import { formatDate } from "../../../common/utils/date-time";
import AppText from "../../../components/screen-comps/app-text";
import PercentageBar from "../../../components/screen-comps/percentage-bar";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import AnimatedButton from "../../../components/screen-comps/animated-button";
import APIService from "../../../common/services/api-service";
import AppScroll from "../../../components/screen-comps/app-scroll";

export default function EditDiet() {
    const { createOptions, createToast, hideSpinner, showSpinner } = usePopups();
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
                        createToast({ message: "Diet type successfully updated!" });
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
                createToast({ message: "Diet type successfully updated!" });
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
        try {
            showSpinner();
            let setEnergyKcal = energyIntake;

            if (user.preferences.energyUnit.key === "kj")
                setEnergyKcal = convertEnergy(Number(energyIntake), "kj", "kcal");

            console.log(setEnergyKcal)
            if (setEnergyKcal === user.nutrition.setEnergyKcal) {
                createToast({ message: "No changes made!" });
                return;
            }

            if (setEnergyKcal <= 0) {
                createToast({ message: "Energy intake can't be 0 or below!" });
                return;
            }

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
            <TouchableOpacity
                onPress={handleDietOptions}
                style={[styles.card, { backgroundColor: diet.color + '20' }]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={diet.image}
                        style={{
                            width: 45,
                            height: 45,
                            marginRight: 15,
                            tintColor: diet.color,
                        }}
                    />
                    <View style={{ flex: 1 }}>
                        <AppText
                            style={[
                                styles.headerText,
                                { color: diet.color, fontSize: scaleFont(20) },
                            ]}
                        >
                            {diet.label}
                        </AppText>
                        <AppText style={styles.subText}>{diet.description}</AppText>
                    </View>
                    <Image
                        source={Images.arrow}
                        style={{ width: 20, height: 20, tintColor: 'white' }}
                    />
                </View>
            </TouchableOpacity>

            <View style={[styles.card, { padding: 10, marginTop: 15, }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={Images.magnifier}
                        style={{ width: 22, height: 22, tintColor: 'white' }}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <AppText style={{ color: 'white', fontSize: scaleFont(12), }}>
                            Energy intake drives your weight goals.  Pick a diet that fits your health and lifestyle.
                        </AppText>
                    </View>
                </View>
            </View>

            <View style={[styles.card]}>
                <AppText style={styles.sectionTitle}>Macronutrient Breakdown</AppText>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
                    <View style={styles.macroBox}>
                        <Image source={Images.carbs1} style={[styles.macroIcon, { tintColor: nutritionColors.carbs1 }]} />
                        <AppText style={styles.macroLabel}>Carbs</AppText>
                        <AppText style={styles.macroValue}>{currentCarbGrams}g</AppText>
                    </View>
                    <View style={styles.macroBox}>
                        <Image source={Images.protein5} style={[styles.macroIcon, { tintColor: nutritionColors.protein1 }]} />
                        <AppText style={styles.macroLabel}>Protein</AppText>
                        <AppText style={styles.macroValue}>{currentProteinGrams}g</AppText>
                        <AppText style={styles.requirementText}>
                            Req: {user.nutrition.proteinRequirement}g
                        </AppText>
                    </View>
                    <View style={styles.macroBox}>
                        <Image source={Images.butter} style={[styles.macroIcon, { tintColor: nutritionColors.fat1 }]} />
                        <AppText style={styles.macroLabel}>Fat</AppText>
                        <AppText style={styles.macroValue}>{currentFatGrams}g</AppText>
                    </View>
                </View>

                <PercentageBar
                    values={[
                        { percentage: Number(currentCarbRate), color: nutritionColors.carbs1 },
                        { percentage: Number(currentProteinRate), color: nutritionColors.protein1 },
                        { percentage: Number(currentFatRate), color: nutritionColors.fat1 },
                    ]}
                    barHeight={10}
                    showPercentage={true}
                    minVisiblePercentage={3}
                />

                <AppText style={[styles.subText, { textAlign: 'center', marginTop: 10, fontSize: scaleFont(9) }]}>
                    Macronutrient Distribution (% of Total Energy)
                </AppText>


                {dietKey === 'custom' && (
                    <View style={{ marginTop: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <AppTextInput
                                value={String(currentCarbRate)}
                                onChangeText={setCurrentCarbRate}
                                style={[styles.inputNew]}
                                placeholder="% Carbs"
                                keyboardType="numeric"
                            />
                            <AppTextInput
                                value={String(currentProteinRate)}
                                onChangeText={setCurrentProteinRate}
                                style={[styles.inputNew, { marginHorizontal: 15 }]}
                                placeholder="% Protein"
                                keyboardType="numeric"
                            />
                            <AppTextInput
                                value={String(currentFatRate)}
                                onChangeText={setCurrentFatRate}
                                style={[styles.inputNew]}
                                placeholder="% Fat"
                                keyboardType="numeric"
                            />
                        </View>
                        <AnimatedButton
                            onPress={handleCustomDiet}
                            style={styles.button}
                            textStyle={styles.buttonText}
                            title="Confirm Macro Changes"
                        />
                    </View>
                )}
            </View>

            <View style={[styles.card]}>
                <View style={{ marginBottom: 8 }}>
                    <AppText style={styles.sectionTitle}>Daily Energy Intake</AppText>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <AppText style={styles.subText}>Weight Goal:</AppText>
                    <AppText style={[styles.highlightValue, { color: goalOptions.find(option => option.key === user.nutrition.goal).color }]}>
                        {goalOptions.find(option => option.key === user.nutrition.goal).label}
                    </AppText>
                </View>

                <View style={{ backgroundColor: adjustColor(colors.cardBackground, '30'), marginBottom: 15, padding: 15, borderRadius: 15 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                        <AppText style={styles.subText}>Current:</AppText>
                        <AppText style={styles.highlightValue}>
                            {convertEnergy(user.nutrition.setEnergyKcal, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                        </AppText>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                        <AppText style={styles.subText}>TDEE:</AppText>
                        <AppText style={styles.highlightValue}>
                            {convertEnergy(user.metrics.tdee, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                        </AppText>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <AppText style={styles.subText}>Recommended:</AppText>
                        <AppText style={[styles.highlightValue, { color: colors.main }]}>
                            {convertEnergy(user.nutrition.recommendedEnergyKcal, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                        </AppText>
                    </View>
                </View>

                <AppTextInput
                    value={String(energyIntake)}
                    onChangeText={setEnergyIntake}
                    style={[styles.inputNew, { width: "100%", marginBottom: 0 }]}
                    placeholder={`Enter energy in ${user.preferences.energyUnit.field}`}
                    keyboardType="numeric"
                />

                <AnimatedButton
                    onPress={handleEnergyIntake}
                    style={styles.button}
                    textStyle={styles.buttonText}
                    title="Update Energy Intake"
                />
            </View>
        </AppScroll>
    );

}
const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 15,
        marginTop: 15,
        padding: 15,
        borderRadius: 15,
    },
    headerText: {
        fontSize: scaleFont(18),
        fontWeight: '700',
        color: 'white',
    },
    subText: {
        fontSize: scaleFont(11),
        color: colors.mutedText,
    },
    sectionTitle: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        color: 'white',
        marginBottom: 12,
    },
    macroBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    macroIcon: {
        width: 30,
        height: 30,
        marginBottom: 4,
    },
    macroLabel: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
    },
    macroValue: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: 'white',
    },
    inputNew: {
        flex: 1,
        height: 48,
        paddingHorizontal: 12,
        borderRadius: 15,
        backgroundColor: colors.inputBackground,
        color: 'white',
        borderWidth: 1,
        borderColor: colors.inputBorderColor,
    },
    button: {
        marginTop: 18,
        height: 50,
        borderRadius: 15,
        backgroundColor: colors.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: scaleFont(14),
    }, requirementText: {
        fontSize: scaleFont(10),
        color: colors.mutedText,
        marginTop: 2,
    },
    sectionHighlight: {
        fontSize: scaleFont(13),
        fontWeight: '600',
        color: nutritionColors.protein1,
        textAlign: 'center',
        marginBottom: 10,
    }, highlightValue: {
        fontSize: scaleFont(13),
        fontWeight: "700",
        color: "white",
    },
});
