import { useContext, useEffect, useState } from "react";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import AppScroll from "../../../components/screen-comps/app-scroll";
import AppText from "../../../components/screen-comps/app-text";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import Divider from "../../../components/screen-comps/divider";
import PercentageCircle from "../../../components/screen-comps/percentage-circle";
import { Images } from "../../../common/settings/assets";
import { UserContext } from "../../../common/contexts/user-context";
import { convertEnergy } from "../../../common/utils/unit-converter";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { colors, nutritionColors } from "../../../common/settings/styling";
import usePopups from "../../../common/hooks/use-popups";
import APIService from "../../../common/services/api-service";
import { router } from "expo-router";
import { routes } from "../../../common/settings/constants";
import { Keyboard } from "react-native";
import { formatDate } from "../../../common/utils/date-time";

export default function FoodProfile() {
    const { setUser, user, additionalContexts } = useContext(UserContext);
    const { createDialog, createAlert, showSpinner, hideSpinner } = usePopups();
    const [servingSize, setServingSize] = useState(additionalContexts.selectedFood.servingSize);
    const [energyKcal, setEnergyKcal] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [protein, setProtein] = useState(0);
    const [fat, setFat] = useState(0);
    const [additionalProps, setAdditionalProps] = useState([]);
    const [deleteVisible, setDeleteVisible] = useState(user.id === additionalContexts.selectedFood.creatorId || additionalContexts.foodProfileIntent === 'update');
    const [editVisible, setEditVisible] = useState(user.id === additionalContexts.selectedFood.creatorId && additionalContexts.foodProfileIntent === 'create');

    useEffect(() => {
        const factor = servingSize / additionalContexts.selectedFood.servingSize;
        const energyKcal = Math.round(additionalContexts.selectedFood.energyKcal * factor);
        const carbs = Math.round(additionalContexts.selectedFood.carbs * factor);
        const protein = Math.round(additionalContexts.selectedFood.protein * factor);
        const fat = Math.round(additionalContexts.selectedFood.fat * factor);
        const additionalProps = additionalContexts.selectedFood.additionalProps.map((prop) => ({
            ...prop,
            originalAmount: prop.amount,
            amount: Math.round(prop.amount * factor)
        }));

        setEnergyKcal(energyKcal);
        setCarbs(carbs);
        setProtein(protein);
        setFat(fat);
        setAdditionalProps(additionalProps);
    }, [servingSize, additionalContexts]);

    async function handleFoodDeletion() {
        const intent = additionalContexts.foodProfileIntent;

        createDialog({
            title: intent === 'create' ? 'Delete Food' : 'Remove Food',
            text: intent === 'create' ?
                "Are you sure you want to delete this food entry?" :
                "Are you sure you want to remove this food from the meal?",
            onConfirm: async () => {
                showSpinner();
                const foodId = additionalContexts.selectedFood.id;
                const mealId = additionalContexts.selectedMeal.id;
                const date = additionalContexts.dayLogDate || '';

                console.log(foodId, mealId, date)
                let result
                if (intent === 'create')
                    result = await APIService.nutrition.foods.delete({ foodId });
                else
                    result = await APIService.nutrition.meals.foods.delete({ mealId, foodId });

                hideSpinner();
                if (result.success) {
                    if (intent === 'create') {
                        setUser(prev => ({
                            ...prev,
                            foods: prev.foods.filter(f => f.id !== foodId)
                        }));
                    }
                    else {
                        setUser(prev => {
                            const formattedDate = formatDate(date, { format: "YYYY-MM-DD" });
                            const dayLog = prev.nutritionLogs[formattedDate];
                            if (!dayLog) return prev;

                            return {
                                ...prev,
                                nutritionLogs: {
                                    ...prev.nutritionLogs,
                                    [formattedDate]: {
                                        ...dayLog,
                                        meals: dayLog.meals.map(m =>
                                            m.id === mealId
                                                ? { ...m, foods: m.foods.filter(f => f.id !== foodId) }
                                                : m
                                        )
                                    }
                                }
                            };
                        });
                    }
                    createAlert({ title: 'Success', text: intent === 'create' ? "Food deleted, click OK to go back" : "Food removed, click OK to go back", onPress: () => router.back() });
                } else {
                    createAlert({ title: 'Failure', text: "Food delete/removal failed!\n" + result.message });
                }
            }
        })
    }

    async function handleFoodAddition() {
        Keyboard.dismiss();
        const food = additionalContexts.selectedFood;
        const meal = additionalContexts.selectedMeal;

        const payload = {
            mealId: meal.id,
            originalServingSize: food.servingSize,
            originalEnergyKcal: food.energyKcal,
            originalCarbs: food.carbs,
            originalProtein: food.protein,
            originalFat: food.fat,
            ...food,
            servingSize: Number(servingSize),
            energyKcal,
            carbs,
            protein,
            fat,
            additionalProps,
        };

        try {
            showSpinner();
            showSpinner();
            const date = formatDate(additionalContexts.dayLogDate, { format: 'YYYY-MM-DD' });
            const result = await APIService.nutrition.meals.foods.add({ food: payload });

            if (result.success) {
                payload.id = result.data.id;

                setUser(prev => ({
                    ...prev,
                    nutritionLogs: {
                        ...prev.nutritionLogs,
                        [date]: {
                            ...prev.nutritionLogs[date],
                            meals: prev.nutritionLogs[date].meals.map(m =>
                                m.id === meal.id
                                    ? {
                                        ...m,
                                        foods: [...m.foods, payload]
                                    }
                                    : m
                            )
                        }
                    }
                }));

                createAlert({ title: 'Success', text: "Food added to meal, click OK to go back", onPress: () => router.back() });
            } else {
                createAlert({ title: 'Failure', text: "Food addition failed!\n" + result.message });
            }
        } catch (err) {
            console.log(err);
        } finally {
            hideSpinner();
        }
    }

    return (
        <AppScroll contentStyle={{ padding: 15 }} extraTop={60} extraBottom={200}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <AppText style={styles.foodLabel}>{additionalContexts.selectedFood.label}</AppText>
                    <AppText style={styles.foodCategory}>{additionalContexts.selectedFood.category}</AppText>
                    <Divider orientation="horizontal" style={{ marginVertical: 10, opacity: 0.3 }} />
                    <AppText style={styles.creator}>{additionalContexts.selectedFood.creatorName}</AppText>
                    <AppText style={styles.creator}>{additionalContexts.selectedFood.isUSDA ? 'USDA' : additionalContexts.selectedFood.isPublic ? 'Public' : 'Private'}</AppText>
                </View>
                <View style={{ flexDirection: 'row' }}>

                    {deleteVisible &&
                        <TouchableOpacity style={[styles.editBtn, { marginEnd: editVisible ? 7 : 0 }]} onPress={handleFoodDeletion}>
                            <Image source={Images.trash} style={{ width: 22, height: 22, tintColor: colors.accentPink }} />
                        </TouchableOpacity>
                    }
                    {editVisible &&
                        <TouchableOpacity style={styles.editBtn} onPress={() => router.push(routes.FOOD_EDITOR)}>
                            <Image source={Images.edit} style={{ width: 20, height: 20, tintColor: 'white' }} />
                        </TouchableOpacity>
                    }
                </View>
            </View>

            {/* Macro Circle */}
            {(() => {
                const carbs = additionalContexts.selectedFood.carbs || 0;
                const protein = additionalContexts.selectedFood.protein || 0;
                const fat = additionalContexts.selectedFood.fat || 0;
                const totalCalories = carbs * 4 + protein * 4 + fat * 9;

                const carbRatio = (carbs * 4 / totalCalories) * 100 || 0;
                const proteinRatio = (protein * 4 / totalCalories) * 100 || 0;
                const fatRatio = (fat * 9 / totalCalories) * 100 || 0;

                return (
                    <View style={styles.circleContainer}>
                        <PercentageCircle
                            size={130}
                            innerRadiusRatio={0.7}
                            segments={[
                                { label: "Carbs", percentage: Number(carbRatio), color: nutritionColors.carbs1 },
                                { label: "Protein", percentage: Number(proteinRatio), color: nutritionColors.protein1 },
                                { label: "Fat", percentage: Number(fatRatio), color: nutritionColors.fat1 },
                            ]}
                        />
                    </View>
                );
            })()}

            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginBottom: 15 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={Images.dot} style={{ width: 18, height: 18, tintColor: nutritionColors.carbs1 }} />
                    <AppText style={{ fontSize: scaleFont(14), color: 'white' }}>Carbs</AppText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={Images.dot} style={{ width: 18, height: 18, tintColor: nutritionColors.protein1 }} />
                    <AppText style={{ fontSize: scaleFont(14), color: 'white' }}>Protein</AppText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={Images.dot} style={{ width: 18, height: 18, tintColor: nutritionColors.fat1 }} />
                    <AppText style={{ fontSize: scaleFont(14), color: 'white' }}>Fat</AppText>
                </View>
            </View>

            {/* Serving Size & Add */}
            <View style={styles.servingContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <AppTextInput
                        placeholder="Enter serving size"
                        style={styles.servingInput}
                        onChangeText={(val) => { if (/^(?![.,])\d*\.?\d*$/.test(val)) { setServingSize(val); } }}
                        value={servingSize?.toString() || ''}
                        keyboardType="numeric"
                    />
                    <AppText style={styles.servingInfo}>{additionalContexts.selectedFood.servingUnit}</AppText>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={handleFoodAddition}>
                    <Image source={Images.plus} style={{ width: 18, height: 18, tintColor: 'white', marginRight: 8 }} />
                    <AppText style={{ color: 'white', fontSize: scaleFont(14) }}>Add</AppText>
                </TouchableOpacity>
            </View>


            {/* Macro Table */}
            <View style={styles.macroRow}>
                <View style={styles.macroItem}>
                    <AppText style={[styles.macroLabel, { color: nutritionColors.energy1 }]}>Energy ({user.preferences.energyUnit.field})</AppText>
                    <AppText style={styles.macroValue}>{convertEnergy(energyKcal, 'kcal', user.preferences.energyUnit.key)}</AppText>
                </View>
                <View style={styles.macroItem}>
                    <AppText style={[styles.macroLabel, { color: nutritionColors.carbs1 }]}>Carbs (g)</AppText>
                    <AppText style={styles.macroValue}>{carbs}</AppText>
                </View>
                <View style={styles.macroItem}>
                    <AppText style={[styles.macroLabel, { color: nutritionColors.protein1 }]}>Protein (g)</AppText>
                    <AppText style={styles.macroValue}>{protein}</AppText>
                </View>
                <View style={styles.macroItem}>
                    <AppText style={[styles.macroLabel, { color: nutritionColors.fat1 }]}>Fat (g)</AppText>
                    <AppText style={styles.macroValue}>{fat}</AppText>
                </View>
            </View>

            {additionalProps.length > 0 ?
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 }}>
                    {additionalProps.map((prop, index) => (
                        <View key={index} style={styles.additionalPropCard}>
                            <AppText style={styles.additionalPropLabel}>{prop.label}</AppText>
                            <AppText style={styles.additionalPropValue}>{prop.amount} {prop.unit}</AppText>
                        </View>
                    ))}
                </View>
                :
                <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 50 }}>
                    <Image source={Images.noDoc} style={{ height: 60, width: 60, tintColor: colors.mutedText }} />
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(15), fontWeight: 'bold', textAlign: 'center', width: '70%', marginTop: 15 }}>This food does not have any additional properties documented</AppText>
                </View>}
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 25,
    },
    foodLabel: {
        fontSize: scaleFont(26),
        fontWeight: '700',
        color: colors.main,
    },
    foodCategory: {
        fontSize: scaleFont(16),
        color: colors.mainOpacied,
        marginTop: 2,
    },
    creator: {
        fontSize: scaleFont(14),
        color: colors.mutedText,
        marginTop: 2,
    },
    editBtn: {
        padding: 8,
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
            android: { elevation: 3 },
        }),
    },
    circleContainer: {
        alignItems: 'center',
        marginVertical: 25,
    },
    servingContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.cardBackground,
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
    },
    servingInput: {
        flex: 1,
        height: 50,
        color: 'white',
        backgroundColor: colors.inputBackground,
        borderRadius: 15,
        paddingHorizontal: 15,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accentGreen,
        padding: 15,
        marginTop: 15,
        width: '100%',
        justifyContent: 'center',
        borderRadius: 15,
    },
    servingInfo: {
        fontSize: scaleFont(14),
        color: colors.mutedText,
        marginLeft: 10,
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    macroItem: {
        alignItems: 'center',
    },
    macroLabel: {
        fontSize: scaleFont(14),
        color: colors.mutedText,
        marginBottom: 5,
    },
    macroValue: {
        fontSize: scaleFont(16),
        fontWeight: '700',
        color: 'white',
    },
    additionalPropCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        padding: 15,
        borderRadius: 15,
        marginTop: 15,
        minWidth: '48%',
    },
    additionalPropLabel: {
        fontSize: scaleFont(14),
        color: colors.mutedText,
    },
    additionalPropValue: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: 'white',
    },
});
