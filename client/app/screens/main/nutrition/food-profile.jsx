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

export default function FoodProfile() {
    const { setUser, user, additionalContexts } = useContext(UserContext);
    const { createDialog, createAlert, showSpinner, hideSpinner, createToast } = usePopups();
    const [servingSize, setServingSize] = useState(additionalContexts.selectedFood.servingSize);
    const [energyKcal, setEnergyKcal] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [protein, setProtein] = useState(0);
    const [fat, setFat] = useState(0);
    const [additionalProps, setAdditionalProps] = useState([]);
    const [intent, setIntent] = useState('');
    const [day, setDay] = useState({});
    const [selectedFood, setSelectedFood] = useState({});
    const [selectedMeal, setSelectedMeal] = useState({});

    useEffect(() => {
        const intent = additionalContexts.foodProfileIntent;
        const day = additionalContexts.day;
        const food = additionalContexts.selectedFood;
        const meal = additionalContexts.selectedMeal;

        setIntent(intent);
        setDay(day);
        setSelectedFood(food);
        setSelectedMeal(meal);
    }, [additionalContexts.foodProfileIntent, additionalContexts.selectedFood, additionalContexts.selectedMeal]);

    useEffect(() => {
        let factor;
        if (!servingSize)
            factor = 0;
        else
            factor = servingSize / (intent === 'meal/update' ? selectedFood.originalServingSize : selectedFood.servingSize);

        const energyKcal = Math.round((intent === 'meal/update' ? selectedFood.originalEnergyKcal : selectedFood.energyKcal) * factor);
        const carbs = Math.round((intent === 'meal/update' ? selectedFood.originalCarbs : selectedFood.carbs) * factor);
        const protein = Math.round((intent === 'meal/update' ? selectedFood.originalProtein : selectedFood.protein) * factor);
        const fat = Math.round((intent === 'meal/update' ? selectedFood.originalFat : selectedFood.fat) * factor);
        const additionalProps = (selectedFood.additionalProps || []).map((prop) => ({
            ...prop,
            originalAmount: intent === 'meal/update' ? prop.originalAmount : prop.amount,
            amount: Math.round((intent === 'meal/update' ? prop.originalAmount : prop.amount) * factor)
        }));

        setEnergyKcal(energyKcal);
        setCarbs(carbs);
        setProtein(protein);
        setFat(fat);
        setAdditionalProps(additionalProps);
    }, [servingSize, selectedFood, intent]);

    function handleFood() {
        Keyboard.dismiss();

        if (servingSize === '') {
            createAlert({ text: 'Please enter a valid serving size' });
            return;
        }

        const maxKcal = day.targetEnergyKcal || 0;
        const currentKcal = day.meals
            ?.map(m => m.foods?.reduce((sum, f) => sum + (f.energyKcal || 0), 0) || 0)
            .reduce((a, b) => a + b, 0) || 0;

        let projectedKcal;

        if (intent === 'meal/add' || !selectedFood) {
            projectedKcal = currentKcal + energyKcal;
        } else {
            projectedKcal = currentKcal - (selectedFood.energyKcal || 0) + energyKcal;
        }

        if (intent === 'meal/update') {
            if (servingSize === selectedFood.servingSize) {
                createToast({ message: 'No changes detected' })
                return;
            }
        }

        if (projectedKcal > maxKcal) {
            if (intent === 'meal/add') {
                createDialog({
                    title: 'Warning',
                    text: 'Adding this food would exceed your daily energy limit!\n\nAre you sure you want to continue?',
                    onConfirm: handleFoodAddition
                });
            } else if (servingSize > selectedFood.servingSize) {
                createDialog({
                    title: 'Warning',
                    text: currentKcal > maxKcal
                        ? 'You have already exceeded your daily energy limit! Further increase would only make it worse.\n\nAre you sure you want to continue?'
                        : 'Increasing serving size of this food would exceed your daily energy limit!\n\nAre you sure you want to continue?',
                    onConfirm: () => handleFoodUpdate()
                });
            } else {
                handleFoodUpdate();
            }
        } else {
            if (intent === 'meal/add')
                handleFoodAddition();
            else
                handleFoodUpdate();
        }
    }

    async function handleFoodDeletion() {
        Keyboard.dismiss();

        createDialog({
            title: intent === 'meal/add' ? 'Delete Food' : 'Remove Food',
            text: intent === 'meal/add' ?
                "Are you sure you want to delete this food entry?" :
                "Are you sure you want to remove this food from the meal?",
            onConfirm: async () => {
                showSpinner();
                try {
                    let result
                    result = intent === 'meal/add' ?
                        await APIService.nutrition.foods.delete({ foodId: selectedFood.id })
                        :
                        await APIService.nutrition.meals.foods.delete({ mealId: selectedMeal.id, foodId: selectedFood.id });

                    if (result.success) {
                        if (intent === 'meal/add') {
                            setUser(prev => ({
                                ...prev,
                                foods: prev.foods.filter(f => f.id !== selectedFood.id)
                            }));
                        }
                        else {
                            setUser(prev => {
                                const dayLog = prev.nutritionLogs[day.date];
                                if (!dayLog) return prev;

                                return {
                                    ...prev,
                                    nutritionLogs: {
                                        ...prev.nutritionLogs,
                                        [day.date]: {
                                            ...dayLog,
                                            meals: dayLog.meals.map(m =>
                                                m.id === selectedMeal.id
                                                    ? { ...m, foods: m.foods.filter(f => f.id !== selectedFood.id) }
                                                    : m
                                            )
                                        }
                                    }
                                };
                            });
                        }

                        createToast({ message: intent === 'meal/add' ? 'Food deleted' : 'Food removed' });
                        router.back();
                    } else {
                        createAlert({ title: 'Failure', text: "Food delete/removal failed!\n" + result.message });
                    }
                } catch (e) {
                    createAlert({ title: 'Failure', text: "Food delete/removal failed!\n" + e.message });
                } finally {
                    hideSpinner();
                }
            }
        })
    }

    async function handleFoodAddition() {
        showSpinner();
        const payload = {
            mealId: selectedMeal.id,
            originalServingSize: selectedFood.servingSize,
            originalEnergyKcal: selectedFood.energyKcal,
            originalCarbs: selectedFood.carbs,
            originalProtein: selectedFood.protein,
            originalFat: selectedFood.fat,
            ...selectedFood,
            ownerId: user.id,
            servingSize: Number(servingSize),
            energyKcal,
            carbs,
            protein,
            fat,
            additionalProps,
        };

        try {
            const result = await APIService.nutrition.meals.foods.add({ food: payload });

            if (result.success) {
                payload.id = result.data.id;

                setUser(prev => ({
                    ...prev,
                    nutritionLogs: {
                        ...prev.nutritionLogs,
                        [day.date]: {
                            ...prev.nutritionLogs[day.date],
                            meals: prev.nutritionLogs[day.date].meals.map(m =>
                                m.id === selectedMeal.id
                                    ? {
                                        ...m,
                                        foods: [...m.foods, payload]
                                    }
                                    : m
                            )
                        }
                    }
                }));

                createToast({ message: 'Food added' });
                router.back();
            } else {
                createAlert({ title: 'Failure', text: "Food addition failed!\n" + result.message });
            }
        } catch (err) {
            createAlert({ title: 'Failure', text: "Food addition failed!\n" + err });
        } finally {
            hideSpinner();
        }
    }

    async function handleFoodUpdate() {
        showSpinner();
        const payload = {
            mealId: selectedMeal.id,
            ...selectedFood,
            servingSize: Number(servingSize),
            energyKcal,
            carbs,
            protein,
            fat,
            additionalProps,
        };

        try {
            const result = await APIService.nutrition.meals.foods.update({ food: payload });

            if (result.success) {
                setUser(prev => ({
                    ...prev,
                    nutritionLogs: {
                        ...prev.nutritionLogs,
                        [day.date]: {
                            ...prev.nutritionLogs[day.date],
                            meals: prev.nutritionLogs[day.date].meals.map(m =>
                                m.id === selectedMeal.id
                                    ? {
                                        ...m,
                                        foods: m.foods.map(f =>
                                            f.id === selectedFood.id
                                                ? payload
                                                : f
                                        )
                                    }
                                    : m
                            )
                        }
                    }
                }))

                createToast({ message: 'Serving updated' });
                router.back();
            } else {
                createAlert({ title: 'Failure', text: "Updating serving failed!\n" + result.message });
            }
        } catch (err) {
            createAlert({ title: 'Failure', text: "Updating serving failed!\n" + err });
        } finally {
            hideSpinner();
        }
    }

    async function handleFoodAdoption() {
        Keyboard.dismiss();

        createDialog({
            title: "Save Food",
            message: "Are you sure you want to add this food to your list of My Foods?",
            onConfirm: async () => {
                showSpinner();
                try {
                    const payload = { ...selectedFood, isPublic: false, ownerId: user.id };
                    const result = await APIService.nutrition.foods.create(payload);

                    if (result.success) {
                        setUser(prevUser => ({ ...prevUser, foods: [...(prevUser.foods || []), result.data.food] }));

                        createToast({ message: "Food added" });
                        router.back();
                    }
                    else {
                        createAlert({ title: 'Failure', text: "Food addition failed!\n" + result.message });
                    }
                } catch (error) {
                    createAlert({ title: 'Failure', text: "Food addition failed!\n" + error });
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    return (
        <AppScroll contentStyle={{ padding: 15 }} extraTop={60} extraBottom={200}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexShrink: 1 }}>
                    <AppText style={styles.foodLabel}>{selectedFood.label}</AppText>
                    <AppText style={styles.foodCategory}>{selectedFood.category}</AppText>
                    <Divider orientation="horizontal" style={{ marginVertical: 10 }} />
                    <AppText style={styles.creator}>{selectedFood.isUSDA ? 'United States Department of Agriculture' : selectedFood.creatorName}</AppText>
                    <AppText style={[styles.creator, { fontSize: scaleFont(10) }]}>{selectedFood.isUSDA ? 'Public' : selectedFood.isPublic ? 'Public' : 'Private'}</AppText>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    {(intent === 'meal/update' || user.id === selectedFood.ownerId) &&
                        <TouchableOpacity style={[styles.editBtn, { marginEnd: intent === 'meal/add' ? 7 : 0 }]} onPress={handleFoodDeletion}>
                            <Image source={Images.trash} style={{ width: 22, height: 22, tintColor: colors.accentPink }} />
                        </TouchableOpacity>
                    }
                    {intent === 'meal/add' && selectedFood.ownerId === user.id &&
                        <TouchableOpacity style={styles.editBtn} onPress={() => router.push(routes.FOOD_EDITOR)}>
                            <Image source={Images.edit} style={{ width: 20, height: 20, tintColor: 'white' }} />
                        </TouchableOpacity>
                    }
                    {user.id !== selectedFood.ownerId &&
                        <TouchableOpacity style={[styles.editBtn, { marginEnd: intent === 'meal/add' ? 7 : 0 }]} onPress={handleFoodAdoption}>
                            <Image source={Images.plus} style={{ width: 22, height: 22, tintColor: 'white' }} />
                        </TouchableOpacity>
                    }
                </View>
            </View>

            {/* Macro Circle */}
            {(() => {
                const carbs = selectedFood.originalCarbs || selectedFood.carbs || 0;
                const protein = selectedFood.originalProtein || selectedFood.protein || 0;
                const fat = selectedFood.originalFat || selectedFood.fat || 0;
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
                    <AppText style={styles.servingInfo}>{selectedFood.servingUnit}</AppText>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={handleFood}>
                    <Image source={Images.plus} style={{ width: 18, height: 18, tintColor: 'white', marginRight: 8 }} />
                    <AppText style={{ color: 'white', fontSize: scaleFont(14) }}>{intent === 'meal/add' ? `Add` : `Update Serving`}</AppText>
                </TouchableOpacity>
            </View>


            {/* Macro Table */}
            <View style={styles.macroRow}>
                <View style={styles.macroItem}>
                    <AppText style={[styles.macroLabel, { color: nutritionColors.energy1 }]}>Energy ({user.preferences.energyUnit.field})</AppText>
                    <AppText style={styles.macroValue}>{convertEnergy(energyKcal || 0, 'kcal', user.preferences.energyUnit.key)}</AppText>
                </View>
                <View style={styles.macroItem}>
                    <AppText style={[styles.macroLabel, { color: nutritionColors.carbs1 }]}>Carbs (g)</AppText>
                    <AppText style={styles.macroValue}>{carbs || 0}</AppText>
                </View>
                <View style={styles.macroItem}>
                    <AppText style={[styles.macroLabel, { color: nutritionColors.protein1 }]}>Protein (g)</AppText>
                    <AppText style={styles.macroValue}>{protein || 0}</AppText>
                </View>
                <View style={styles.macroItem}>
                    <AppText style={[styles.macroLabel, { color: nutritionColors.fat1 }]}>Fat (g)</AppText>
                    <AppText style={styles.macroValue}>{fat || 0}</AppText>
                </View>
            </View>

            {additionalProps.length > 0 ?
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 }}>
                    {additionalProps.map((prop, index) => (
                        <TouchableOpacity onPress={() => { createAlert({ title: prop.label, text: prop.amount + ' ' + prop.unit }) }} key={index} style={styles.additionalPropCard}>
                            <AppText style={styles.additionalPropLabel} numberOfLines={1} ellipsizeMode="tail">{prop.label}</AppText>
                            <AppText style={styles.additionalPropValue}>{prop.amount || 0} {prop.unit}</AppText>
                        </TouchableOpacity>
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
        width: '48%',
    },
    additionalPropLabel: {
        fontSize: scaleFont(14),
        color: colors.mutedText,
        flexShrink: 1,   // lets it shrink & apply ellipsis
        flexGrow: 1,     // optional, ensures it takes remaining space
        marginRight: 8,
    },
    additionalPropValue: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: 'white',
        marginStart: 8
    },
});
