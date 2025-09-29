import { useContext, useEffect, useState } from "react";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import AppScroll from "../../../components/screen-comps/app-scroll";
import AppText from "../../../components/screen-comps/app-text";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import Divider from "../../../components/screen-comps/divider";
import PercentageCircle from "../../../components/screen-comps/percentage-circle";
import { Images } from "../../../utils/assets";
import { UserContext } from "../../../utils/contexts/user-context";
import { convertEnergy } from "../../../utils/helper-functions/unit-converter";
import { scaleFont } from "../../../utils/scale-fonts";
import { colors, nutritionColors } from "../../../utils/settings/styling";
import usePopups from "../../../utils/hooks/use-popups";
import APIService from "../../../utils/services/api-service";
import { router } from "expo-router";
import { routes } from "../../../utils/settings/constants";

export default function FoodProfile() {
    const { setUser, user, additionalContexts } = useContext(UserContext);
    const { createDialog, createAlert, showSpinner, hideSpinner } = usePopups();
    const [servingSize, setServingSize] = useState(additionalContexts.selectedFood.servingSize);
    const [energyKcal, setEnergyKcal] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [protein, setProtein] = useState(0);
    const [fat, setFat] = useState(0);
    const [additionalProps, setAdditionalProps] = useState([]);

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

        console.log(energyKcal, carbs, protein, fat, additionalProps);

        setEnergyKcal(energyKcal);
        setCarbs(carbs);
        setProtein(protein);
        setFat(fat);
        setAdditionalProps(additionalProps);
    }, [servingSize, additionalContexts]);

    async function handleFoodDeletion() {
        createDialog({
            title: 'Delete Food',
            text: "Are you sure you want to remove this food entry?",
            onConfirm: async () => {
                showSpinner();
                const foodId = additionalContexts.selectedFood.id;
                const result = await APIService.nutrition.foods.delete({ foodId });

                hideSpinner();
                if (result.success) {
                    setUser(prev => ({
                        ...prev,
                        foods: prev.foods.filter(f => f.id !== foodId)
                    }))
                    createAlert({ title: 'Success', text: "Food removal success, click OK to go back", onPress: () => router.back() });
                } else {
                    createAlert({ title: 'Failure', text: "Food removal failed!\n" + result.message });
                }
            }
        })
    }

    async function handleFoodAddition() {
        const food = additionalContexts.selectedFood;
        const mealId = additionalContexts.selectedMealId;

        const updatedFood = {
            ...food,
            originalServingSize: additionalContexts.selectedFood.servingSize,
            originalKcal: additionalContexts.selectedFood.energyKcal,
            originalCarbs: additionalContexts.selectedFood.carbs,
            originalProtein: additionalContexts.selectedFood.protein,
            originalFat: additionalContexts.selectedFood.fat,
            servingSize,
            energyKcal,
            carbs,
            protein,
            fat,
            additionalProps
        };
    }



    return (
        <AppScroll contentStyle={{ padding: 15 }} extraTop={60} extraBottom={200}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <AppText style={styles.foodLabel}>{additionalContexts.selectedFood.label}</AppText>
                    <AppText style={styles.foodType}>{additionalContexts.selectedFood.type !== 'Not specified' ? additionalContexts.selectedFood.type : 'Type unspecified'}</AppText>
                    <Divider orientation="horizontal" style={{ marginVertical: 10, opacity: 0.3 }} />
                    <AppText style={styles.creator}>{additionalContexts.selectedFood.creatorName}</AppText>
                    <AppText style={styles.creator}>{additionalContexts.selectedFood.isPublic ? 'Public' : 'Private'}</AppText>
                </View>
                {user.id === additionalContexts.selectedFood.creatorId &&
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={[styles.editBtn, { marginEnd: 7 }]} onPress={handleFoodDeletion}>
                            <Image source={Images.trash} style={{ width: 22, height: 22, tintColor: colors.accentPink }} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editBtn} onPress={() => router.push(routes.FOOD_EDITOR)}>
                            <Image source={Images.edit} style={{ width: 20, height: 20, tintColor: 'white' }} />
                        </TouchableOpacity>
                    </View>
                }
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
                        value={String(servingSize)}
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
    foodType: {
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
