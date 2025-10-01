import { useContext, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform, Keyboard } from "react-native";
import AppScroll from "../../../components/screen-comps/app-scroll";
import { colors, nutritionColors } from "../../../common/settings/styling";
import AppText from "../../../components/screen-comps/app-text";
import Divider from "../../../components/screen-comps/divider";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import { scaleFont } from "../../../common/utils/scale-fonts";
import FloatingActionButton from "../../../components/screen-comps/floating-action-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import usePopups from "../../../common/hooks/use-popups";
import PercentageBar from "../../../components/screen-comps/percentage-bar";
import { UserContext } from "../../../common/contexts/user-context";
import { convertEnergy } from "../../../common/utils/unit-converter";
import { router } from "expo-router";
import { Images } from "../../../common/settings/assets";
import APIService from "../../../common/services/api-service";

export default function FoodEditor() {
    const { user, setUser, setAdditionalContexts, additionalContexts } = useContext(UserContext);
    const { createOptions, createToast, createDialog, createAlert, showSpinner, hideSpinner } = usePopups();
    const insets = useSafeAreaInsets();

    const [fabVisible, setFabVisible] = useState(true);

    const [isChange, setIsChange] = useState(false);
    const [isPublic, setIsPublic] = useState(additionalContexts.selectedFood.isPublic);
    const [label, setLabel] = useState(additionalContexts.selectedFood.label);
    const [category, setCategory] = useState(additionalContexts.selectedFood.category);
    const [servingUnit, setServingUnit] = useState(additionalContexts.selectedFood.servingUnit);
    const [servingSize, setServingSize] = useState(additionalContexts.selectedFood.servingSize);
    const [energyKcal, setEnergyKcal] = useState(additionalContexts.selectedFood.energyKcal);
    const [carbs, setCarbs] = useState(additionalContexts.selectedFood.carbs);
    const [protein, setProtein] = useState(additionalContexts.selectedFood.protein);
    const [fat, setFat] = useState(additionalContexts.selectedFood.fat);

    const [carbRate, setCarbRate] = useState(0);
    const [proteinRate, setProteinRate] = useState(0);
    const [fatRate, setFatRate] = useState(0);
    const [macrosRateSum, setMacrosRateSum] = useState(0);
    const [macrosRateOffset, setMacrosRateOffset] = useState(0);

    const [propertyCounter, setPropertyCounter] = useState(additionalContexts.selectedFood.additionalProps.length);
    const [additionalProps, setAdditionalProps] = useState(additionalContexts.selectedFood.additionalProps || []);

    useEffect(() => {
        const original = additionalContexts.selectedFood;

        const basicChanged =
            label !== original.label ||
            category !== original.category ||
            servingUnit !== original.servingUnit ||
            servingSize !== original.servingSize ||
            energyKcal !== original.energyKcal ||
            carbs !== original.carbs ||
            protein !== original.protein ||
            fat !== original.fat ||
            isPublic !== original.isPublic;

        const propsChanged = JSON.stringify(additionalProps) !== JSON.stringify(original.additionalProps || []);

        setIsChange(basicChanged || propsChanged);
        setFabVisible(basicChanged || propsChanged ? true : false);
    }, [label, category, servingUnit, servingSize, energyKcal,
        carbs, protein, fat, isPublic, additionalProps, additionalContexts.selectedFood]);

    useEffect(() => {
        const cRate = (carbs * 4 / energyKcal * 100) || 0;
        const pRate = (protein * 4 / energyKcal * 100) || 0;
        const fRate = (fat * 9 / energyKcal * 100) || 0;
        const sum = Math.round(cRate + pRate + fRate);

        console.log(sum)
        setCarbRate(cRate);
        setProteinRate(pRate);
        setFatRate(fRate);
        setMacrosRateSum(sum);
        setMacrosRateOffset(Math.abs(sum - 100) / 100);
    }, [energyKcal, carbs, protein, fat]);

    function addProperty() {
        setAdditionalProps(prev => [...prev, { id: propertyCounter, label: '', amount: '', unit: '' }]);
        setPropertyCounter(prev => prev + 1);
    }

    function removeProperty(id) {
        setAdditionalProps(prev => prev.filter(prop => prop.id !== id));
    }

    function updatePropertyLabel(label, id) {
        setAdditionalProps(prev =>
            prev.map(prop => prop.id === id ? { ...prop, label } : prop)
        );
    }

    function updatePropertyAmount(amount, id) {
        setAdditionalProps(prev =>
            prev.map(prop => prop.id === id ? { ...prop, amount } : prop)
        );
    }

    function updatePropertyUnit(id) {
        Keyboard.dismiss();
        const property = additionalProps.find(prop => prop.id === id);

        createOptions({
            title: "Property Unit",
            current: property.unit,
            options: ['mg', 'g', `mL`],
            onConfirm: (unit) => {
                setAdditionalProps(prev =>
                    prev.map(prop => prop.id === id ? { ...prop, unit } : prop)
                );
            }
        });
    }

    function validateMacrosEntries() {
        console.log(energyKcal, carbs, protein, fat)
        if (!label) {
            return createToast({ message: "Please fill in food label" });
        }

        if (!servingSize || servingSize <= 0) {
            return createToast({ message: "Please fill in serving size" });
        }

        if (!energyKcal || energyKcal <= 0) {
            return createToast({ message: "Please fill in energy" });
        }

        if (!carbs && !protein && !fat) {
            return createToast({ message: "Please fill in macros" });
        }

        if (additionalProps.some(p => !p.label || !p.amount || !p.unit)) {
            return createToast({ message: "Please fill in all additional properties" });
        }

        if (macrosRateOffset > 0.2) {
            createDialog({
                title: 'Warning',
                text: "There is a mismatch between calories and macros. Continue?",
                onConfirm: handleFoodEdit
            });
        } else if (macrosRateOffset > 0.1) {
            createDialog({
                title: 'Warning',
                text: "There is a slight mismatch between calories and macros. Continue?",
                onConfirm: handleFoodEdit
            });

        } else {
            createDialog({
                title: 'Confirm',
                text: "Are you sure you want to update this food entry?",
                onConfirm: handleFoodEdit
            });
        }
    }

    async function handleFoodEdit() {
        const finalyCategory = typeof category === 'string' && category.trim() ? category : 'Not specified';
        const dominantMacro =
            carbs >= protein && carbs >= fat ? 'Carbs' :
                protein >= carbs && protein >= fat ? 'Protein' :
                    'Fat';
        const ownerId = additionalContexts.selectedFood.ownerId;
        const creatorId = additionalContexts.selectedFood.creatorId;
        const creatorName = user.firstname + " " + user.lastname;
        const isUSDA = additionalContexts.selectedFood.isUSDA;
        const USDAId = additionalContexts.selectedFood.USDAId;

        const payload = {
            id: additionalContexts.selectedFood.id,
            label,
            category: finalyCategory,
            servingUnit,
            servingSize,
            energyKcal,
            carbs,
            protein,
            fat,
            dominantMacro,
            ownerId,
            creatorId,
            creatorName,
            isPublic,
            isUSDA,
            USDAId,
            additionalProps
        };

        try {
            showSpinner();
            const result = await APIService.nutrition.foods.update(payload);

            if (result.success) {
                const food = result.data.food;
                setUser(prev => ({
                    ...prev,
                    foods: prev.foods.map(f => f.id === food.id ? food : f)
                }));
                setAdditionalContexts(prev => ({ ...prev, selectedFood: food }));
                return createAlert({ title: 'Success', text: "Successfully edited food", onPress: () => router.back() });
            }
            else
                return createAlert({ title: 'Error', text: result.message });
        } catch (error) {
            console.log(error);
        } finally {
            hideSpinner();
        }
    }

    return (
        <>
            <FloatingActionButton
                icon={Images.checkMark}
                label={"Confirm Changes"}
                iconSize={18}
                labelStyle={{ fontSize: scaleFont(14) }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                position={{ bottom: insets.bottom + 20, right: 20, left: 20 }}
                visible={fabVisible && isChange}
                onPress={validateMacrosEntries}
            />
            <AppScroll extraBottom={250} onScrollSetStates={setFabVisible} contentStyle={{ padding: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
                    <AppText style={[styles.sectionTitle, { marginTop: 15 }]}>Share to Community</AppText>
                    <TouchableOpacity style={{ height: 40, backgroundColor: colors.cardBackground, width: 120, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }} onPress={() => setIsPublic(!isPublic)}>
                        <View style={{ height: '100%', justifyContent: 'center', backgroundColor: isPublic ? colors.main : colors.cardBackground, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, flex: 1, }}>
                            <AppText style={{ fontWeight: 'bold', color: isPublic ? 'white' : colors.main, textAlign: 'center' }}>Public</AppText>
                        </View>
                        <View style={{ height: '100%', justifyContent: 'center', backgroundColor: !isPublic ? colors.main : colors.cardBackground, borderTopRightRadius: 8, borderBottomRightRadius: 8, flex: 1, }}>
                            <AppText style={{ fontWeight: 'bold', color: !isPublic ? 'white' : colors.main, textAlign: 'center' }}>Private</AppText>
                        </View>
                    </TouchableOpacity>
                </View>

                <Divider orientation="horizontal" thickness={2} color={colors.divider} style={{ borderRadius: 50, marginVertical: 15 }} />

                {/* Label & Category */}
                <AppText style={[styles.sectionTitle]}>Food Label</AppText>
                <AppTextInput
                    placeholder="Enter a food label"
                    style={styles.input}
                    onChangeText={setLabel}
                    value={label}
                />

                <AppText style={[styles.sectionTitle, { marginTop: 15 }]}>Food Category (optional)</AppText>
                <AppTextInput
                    placeholder="Enter categories (e.g. Branded Food, Meat, Dairy...)"
                    style={styles.input}
                    onChangeText={setCategory}
                    value={category}
                />

                <Divider orientation="horizontal" thickness={2} color={colors.divider} style={{ borderRadius: 50, marginVertical: 15 }} />

                {/* Serving */}
                <AppText style={styles.sectionTitle}>Serving</AppText>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <AppTextInput
                        placeholder={`Unit`}
                        style={[styles.input, { width: '25%' }]}
                        onChangeText={setServingUnit}
                        value={servingUnit}
                    />
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                            if (servingUnit.length === 0) {
                                createToast({ message: 'Please enter unit label first' });
                            }
                        }}
                        style={{ width: '73%' }}
                    >
                        <AppTextInput
                            placeholder="Enter serving size"
                            style={[styles.input, { marginHorizontal: 0 }]}
                            editable={servingUnit.length > 0}
                            onChangeText={setServingSize}
                            value={servingSize?.toString() || ''}
                            keyboardType="numeric"
                            pointerEvents={servingUnit.length === 0 ? 'none' : 'auto'}
                        />
                    </TouchableOpacity>


                </View>


                {/* Energy & Macronutrients */}
                <AppText style={[styles.sectionTitle, { marginBottom: servingUnit ? 0 : 15, marginTop: 15 }]}>Energy & Macronutrients Profile</AppText>
                {servingUnit && <AppText style={{ fontSize: scaleFont(10), color: colors.mutedText, marginBottom: 10 }}>{`per ${servingSize || 0} ${servingUnit}`}</AppText>}
                <AppTextInput
                    placeholder={`Energy (${user.preferences.energyUnit.field})`}
                    style={[styles.input, { marginBottom: 10 }]}
                    keyboardType="numeric"
                    onChangeText={(value) => setEnergyKcal(String(convertEnergy(value, user.preferences.energyUnit.key, 'kcal')))}
                    value={energyKcal?.toString() || ''}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <AppTextInput placeholder="Carbs (g)" keyboardType="numeric" style={[styles.input, { width: '32%' }]} onChangeText={setCarbs} value={carbs?.toString() || ''} />
                    <AppTextInput placeholder="Protein (g)" keyboardType="numeric" style={[styles.input, { width: '32%' }]} onChangeText={setProtein} value={protein?.toString() || ''} />
                    <AppTextInput placeholder="Fat (g)" keyboardType="numeric" style={[styles.input, { width: '32%' }]} onChangeText={setFat} value={fat?.toString() || ''} />
                </View>

                {macrosRateSum > 0 && energyKcal > 0 &&
                    <>
                        <AppText style={{ fontSize: scaleFont(10), color: colors.mutedText, marginTop: 15 }}>Macros to Energy Alignment ({macrosRateOffset > 0.2 ? 'Not Accurate' : macrosRateOffset > 0.1 ? 'Somewhat Accurate' : 'Accurate'} {macrosRateSum}%)</AppText>
                        <PercentageBar
                            values={[
                                { percentage: Number(carbRate), color: nutritionColors.carbs1 },
                                { percentage: Number(proteinRate), color: nutritionColors.protein1 },
                                { percentage: Number(fatRate), color: nutritionColors.fat1 },
                            ]}
                            barHeight={10}
                            showPercentage
                            minVisiblePercentage={3}
                        />
                    </>
                }

                <Divider orientation="horizontal" thickness={2} color={colors.divider} style={{ borderRadius: 50, marginVertical: 15 }} />

                {/* Additional Properties */}
                <AppText style={[styles.sectionTitle, { marginBottom: 0 }]}>Additional Properties</AppText>
                <AppText style={{ fontSize: scaleFont(10), color: colors.mutedText, marginBottom: 15 }}>e.g. vitamins, minerals</AppText>
                {additionalProps.map((property, index) => (
                    <View key={property.id}>
                        <AppTextInput
                            placeholder="Label"
                            style={styles.input}
                            onChangeText={(val) => updatePropertyLabel(val, property.id)} value={property.label}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => {
                                    if (property.unit.length === 0) {
                                        createToast({ message: 'Please select property amount unit' });
                                    }
                                }}
                                style={{ width: '73%' }}
                            >
                                <AppTextInput
                                    placeholder="Amount"
                                    keyboardType="numeric"
                                    style={[styles.input]}
                                    onChangeText={(val) => updatePropertyAmount(val, property.id)}
                                    editable={property.unit.length > 0}
                                    value={property.amount?.toString() || ''}
                                    pointerEvents={property.unit.length > 0 ? 'none' : 'auto'}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ backgroundColor: colors.inputBackground, padding: 15, height: 50, borderRadius: 15, justifyContent: 'space-between', alignItems: 'center', width: '25%', flexDirection: 'row' }}
                                onPress={() => updatePropertyUnit(property.id)}
                            >
                                <AppText style={{ color: 'white', fontWeight: 'bold' }}>{property.unit || 'Unit'}</AppText>
                                <Image source={Images.arrow} style={{ width: 7, height: 15, tintColor: 'white' }} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => removeProperty(property.id)} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.accentPink, padding: 15, borderRadius: 15, marginTop: 10 }}>
                            <Image source={Images.trash} style={{ width: 20, height: 20, tintColor: 'white', }} />
                            <AppText style={{ fontSize: scaleFont(13), fontWeight: 'bold', color: 'white' }}>Remove Property</AppText>
                        </TouchableOpacity>
                        {index !== additionalProps.length - 1 && <Divider orientation="horizontal" thickness={2} length="40%" color={colors.divider} style={{ borderRadius: 50, marginVertical: 15, alignSelf: 'center' }} />}
                    </View>
                ))}
                <TouchableOpacity onPress={addProperty} style={{ flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-between', padding: 15, borderColor: colors.mutedText, borderWidth: 0.5, borderRadius: 15, marginTop: 15 }}>
                    <Image source={Images.plus} style={{ width: 17, height: 17, tintColor: colors.mutedText }} />
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12), marginStart: 10 }}>Add Property</AppText>
                </TouchableOpacity>
            </AppScroll>
        </>
    );
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 15 },
    sectionTitle: { fontSize: scaleFont(14), fontWeight: '700', color: 'white', marginBottom: 10 },
    input: { height: 50, color: "white", borderColor: "black", borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, backgroundColor: colors.inputBackground },
});