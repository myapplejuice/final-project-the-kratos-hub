import { useContext, useEffect, useRef, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { routes } from "../../../common/settings/constants";
import { Keyboard } from "react-native";

export default function FoodProfile() {
    const { createDialog, createAlert, showSpinner, hideSpinner, createToast } = usePopups();
    const context = useLocalSearchParams();
    const intent = context.foodProfileIntent;
    const day = context.day ? JSON.parse(context.day) : {};
    const selectedMeal = context.selectedMeal ? JSON.parse(context.selectedMeal) : {};
    const selectedPlan = context.selectedPlan ? JSON.parse(context.selectedPlan) : {};

    const { setUser, user } = useContext(UserContext);
    const [selectedFood, setSelectedFood] = useState(context.selectedFood ? JSON.parse(context.selectedFood) : {});
    const [servingSize, setServingSize] = useState(selectedFood.servingSize);
    const [energyKcal, setEnergyKcal] = useState(selectedFood.energyKcal);
    const [carbs, setCarbs] = useState(selectedFood.carbs);
    const [protein, setProtein] = useState(selectedFood.protein);
    const [fat, setFat] = useState(selectedFood.fat);
    const [additionalProps, setAdditionalProps] = useState((selectedFood.additionalProps || []).map((prop) => ({
        ...prop,
        originalAmount: Math.round(prop.amount),
        amount: Math.round(prop.amount)
    })));
    const screenMountedRef = useRef(false);

    // Update food on edit unless its in update intent
    useEffect(() => {
        hideSpinner();
        if (screenMountedRef.current === false) {
            screenMountedRef.current = true;
            return;
        }

        const editedFood = user.foods.find((food) => food.id === selectedFood.id);
        setSelectedFood(editedFood || {});
        setServingSize(editedFood?.servingSize || '');
        setEnergyKcal(editedFood?.energyKcal || 0);
        setCarbs(editedFood?.carbs || 0);
        setProtein(editedFood?.protein || 0);
        setFat(editedFood?.fat || 0);
        setAdditionalProps((editedFood?.additionalProps || []).map((prop) => ({
            ...prop,
            originalAmount: Math.round(prop.amount),
            amount: Math.round(prop.amount)
        })));
    }, [user.foods])

    // Update details on serving change
    useEffect(() => {
        let factor;
        if (!servingSize)
            factor = 0;
        else
            factor = servingSize / ((intent === 'meal/update' || intent === 'mealplan/update') ? selectedFood.originalServingSize : selectedFood.servingSize);

        const energyKcal = Math.round(((intent === 'meal/update' || intent === 'mealplan/update') ? selectedFood.originalEnergyKcal : selectedFood.energyKcal) * factor);
        const carbs = Math.round(((intent === 'meal/update' || intent === 'mealplan/update') ? selectedFood.originalCarbs : selectedFood.carbs) * factor);
        const protein = Math.round(((intent === 'meal/update' || intent === 'mealplan/update') ? selectedFood.originalProtein : selectedFood.protein) * factor);
        const fat = Math.round(((intent === 'meal/update' || intent === 'mealplan/update') ? selectedFood.originalFat : selectedFood.fat) * factor);
        const additionalProps = (selectedFood.additionalProps || []).map((prop) => ({
            ...prop,
            originalAmount: Math.round((intent === 'meal/update' || intent === 'mealplan/update') ? prop.originalAmount : prop.amount),
            amount: Math.round(((intent === 'meal/update' || intent === 'mealplan/update') ? prop.originalAmount : prop.amount) * factor)
        }));

        setEnergyKcal(energyKcal);
        setCarbs(carbs);
        setProtein(protein);
        setFat(fat);
        setAdditionalProps(additionalProps);
    }, [servingSize, intent]);

    function handleFood() {
        Keyboard.dismiss();

        if (servingSize === '') {
            createAlert({ text: 'Please enter a valid serving size' });
            return;
        }

        if (intent !== 'mealplan/add' && intent !== 'mealplan/update') {
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
                        text: currentKcal > maxKcal
                            ? 'You have already exceeded your daily energy limit! Adding this food would only make it worse.\n\nAre you sure you want to continue?'
                            : 'Adding this food would exceed your daily energy limit!\n\nAre you sure you want to continue?',
                        onConfirm: handleFoodAddition
                    });
                } else if (servingSize > selectedFood.servingSize) {
                    createDialog({
                        title: 'Warning',
                        text: currentKcal > maxKcal
                            ? 'You have already exceeded your daily energy limit! Increasing serving size of this food would only make it worse.\n\nAre you sure you want to continue?'
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
        } else {
            if (intent === 'mealplan/add')
                handleMealPlanFoodAddition();
            else
                handleMealPlanFoodUpdate();
        }
    }

    async function handleFoodDeletion() {
        Keyboard.dismiss();

        createDialog({
            title: ((intent === 'meal/add' || intent === 'mealplan/add') || intent === 'myfoods') ? 'Discard Food' : 'Remove Food',
            text: ((intent === 'meal/add' || intent === 'mealplan/add') || intent === 'myfoods') ?
                "Are you sure you want to discard this food entry?" :
                "Are you sure you want to remove this food from the meal?",
            confirmText: ((intent === 'meal/add' || intent === 'mealplan/add') || intent === 'myfoods') ? "Discard" : "Remove",
            confirmButtonStyle: { backgroundColor: 'rgb(255,59,48)', borderColor: 'rgb(255,59,48)' },
            onConfirm: async () => {
                showSpinner();
                try {
                    if (intent === 'mealplan/update') {
                        return handleMealPlanFoodDeletion();
                    }

                    let result
                    result = ((intent === 'meal/add' || intent === 'mealplan/add') || intent === 'myfoods') ?
                        await APIService.nutrition.foods.delete({ foodId: selectedFood.id })
                        :
                        await APIService.nutrition.meals.foods.delete({ mealId: selectedMeal.id, foodId: selectedFood.id });

                    if (result.success) {
                        if ((intent === 'meal/add' || intent === 'mealplan/add') || intent === 'myfoods') {
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

                        createToast({ message: ((intent === 'meal/add' || intent === 'mealplan/add') || intent === 'myfoods') ? 'Food entry discarded' : 'Food removed' });
                        router.back();
                    } else {
                        createAlert({ title: 'Failure', text: "Food discard/removal failed!\n" + result.message });
                    }
                } catch (e) {
                    createAlert({ title: 'Failure', text: "Food discard/removal failed!\n" + e.message });
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

    async function handleMealPlanFoodAddition() {
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
            const result = await APIService.nutrition.mealPlans.meals.foods.add({ food: payload });

            if (result.success) {
                payload.id = result.data.id;
                const planId = selectedPlan.id;
                const mealId = selectedMeal.id;
                
                setUser(prev => ({
                    ...prev,
                    plans: prev.plans.map(plan =>
                        plan.id === planId
                            ? {
                                ...plan,
                                meals: plan.meals.map(meal =>
                                    meal.id === mealId
                                        ? { ...meal, foods: [...meal.foods, payload] }
                                        : meal
                                )
                            }
                            : plan
                    )
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

    async function handleMealPlanFoodUpdate() {
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
            const result = await APIService.nutrition.mealPlans.meals.foods.update({ food: payload });

            if (result.success) {
                setUser(prev => ({
                    ...prev,
                    plans: prev.plans.map(plan =>
                        plan.id === selectedPlan.id
                            ? {
                                ...plan,
                                meals: plan.meals.map(meal =>
                                    meal.id === selectedMeal.id
                                        ? {
                                            ...meal,
                                            foods: meal.foods.map(f =>
                                                f.id === selectedFood.id
                                                    ? payload
                                                    : f
                                            )
                                        }
                                        : meal
                                )
                            }
                            : plan
                    )
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

    async function handleMealPlanFoodDeletion() {
        Keyboard.dismiss();

        try {
            const result = await APIService.nutrition.mealPlans.meals.foods.delete({ mealId: selectedMeal.id, foodId: selectedFood.id });

            if (result.success) {
                setUser(prev => ({
                    ...prev,
                    plans: prev.plans.map(plan =>
                        plan.id === selectedPlan.id
                            ? {
                                ...plan,
                                meals: plan.meals.map(meal =>
                                    meal.id === selectedMeal.id
                                        ? {
                                            ...meal,
                                            foods: meal.foods.filter(f => f.id !== selectedFood.id)
                                        }
                                        : meal
                                )
                            }
                            : plan
                    )
                }));

                createToast({ message: 'Food removed' });
                router.back();
            } else {
                createAlert({ title: 'Failure', text: "Food removal failed!\n" + result.message });
            }
        } catch (e) {
            createAlert({ title: 'Failure', text: "Food removal failed!\n" + e.message });
        } finally {
            hideSpinner();
        }
    }

    async function handleFoodAdoption() {
        Keyboard.dismiss();

        createDialog({
            title: "Save Food",
            text: "Are you sure you want to add this food to your list of My Foods?",
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

    function handleOnEditPress() {
        showSpinner();
        setTimeout(() => {
            router.push({
                pathname: routes.FOOD_EDITOR,
                params: {
                    selectedFood: JSON.stringify(selectedFood)
                }
            });
        }, 1);
    }

    return (
        <AppScroll contentStyle={{ padding: 15 }} extraTop={60} extraBottom={200}>
            <View style={styles.header}>
                <View style={{ flexShrink: 1 }}>
                    <AppText style={styles.foodLabel}>{selectedFood.label}</AppText>
                    <AppText style={styles.foodCategory}>{selectedFood.category}</AppText>
                    <Divider orientation="horizontal" style={{ marginVertical: 10 }} />
                    <AppText style={styles.creator}>{selectedFood.isUSDA ? 'United States Department of Agriculture' : selectedFood.creatorName}</AppText>
                    <AppText style={[styles.creator, { fontSize: scaleFont(10) }]}>{selectedFood.isUSDA ? 'Public' : selectedFood.isPublic ? 'Public' : 'Private'}</AppText>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    {(() => {
                        const isMealAdd = intent === "meal/add";
                        const isMealUpdate = intent === "meal/update";
                        const isMealPlanAdd = intent === "mealplan/add";
                        const isMealPlanUpdate = intent === "mealplan/update";
                        const isMyFoods = intent === "myfoods";
                        const isOwner = user.id === selectedFood.ownerId;

                        const icons = [
                            ((isMealAdd && isOwner) || (isMealPlanAdd && isOwner) ||
                                isMealUpdate ||
                                isMealPlanUpdate ||
                                isMyFoods) && {
                                onPress: handleFoodDeletion,
                                source: Images.trash,
                                tint: nutritionColors.carbs1,
                            },

                            ((isMealAdd || isMealPlanAdd || isMyFoods) && isOwner) && {
                                onPress: handleOnEditPress,
                                source: Images.edit,
                                tint: "white",
                            },

                            (!isOwner) && {
                                onPress: handleFoodAdoption,
                                source: Images.plus,
                                tint: "white",
                            },
                        ].filter(Boolean);

                        return (
                            <View style={{ flexDirection: 'row' }}>
                                {icons.map((icon, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.editBtn, { marginEnd: index < icons.length - 1 ? 7 : 0 }]}
                                        onPress={icon.onPress}
                                    >
                                        <Image source={icon.source} style={{ width: 22, height: 22, tintColor: icon.tint }} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )
                    })()}
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
                        editable={intent !== 'myfoods'}
                    />
                    <AppText style={styles.servingInfo}>{selectedFood.servingUnit}</AppText>
                </View>
                {intent !== 'myfoods' &&
                    <TouchableOpacity style={styles.addBtn} onPress={handleFood}>
                        <Image source={Images.plus} style={{ width: 18, height: 18, tintColor: 'white', marginRight: 8 }} />
                        <AppText style={{ color: 'white', fontSize: scaleFont(14) }}>{intent === 'meal/add' || intent === 'mealplan/add' ? `Add` : `Update Serving`}</AppText>
                    </TouchableOpacity>
                }
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
