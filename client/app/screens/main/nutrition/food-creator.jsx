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

export default function FoodCreator() {
    const { user, setUser } = useContext(UserContext);
    const { createOptions, createToast, createDialog, createAlert, showSpinner, hideSpinner } = usePopups();
    const insets = useSafeAreaInsets();

    const [fabVisible, setFabVisible] = useState(true);

    const [label, setLabel] = useState('');
    const [category, setCategory] = useState('');
    const [servingUnit, setServingUnit] = useState('');
    const [servingSize, setServingSize] = useState(0);
    const [energyKcal, setEnergyKcal] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [protein, setProtein] = useState(0);
    const [fat, setFat] = useState(0);

    const [carbRate, setCarbRate] = useState(0);
    const [proteinRate, setProteinRate] = useState(0);
    const [fatRate, setFatRate] = useState(0);
    const [macrosRateSum, setMacrosRateSum] = useState(0);
    const [macrosRateOffset, setMacrosRateOffset] = useState(0);

    const [propertyCounter, setPropertyCounter] = useState(0);
    const [additionalProps, setAdditionalProps] = useState([]);

    useEffect(() => {
        const cRate = carbs * 4 / energyKcal * 100;
        const pRate = protein * 4 / energyKcal * 100;
        const fRate = fat * 9 / energyKcal * 100;
        const sum = Math.round(cRate + pRate + fRate);

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
                onConfirm: handleFoodCreation
            });
        } else if (macrosRateOffset > 0.1) {
            createDialog({
                title: 'Warning',
                text: "There is a slight mismatch between calories and macros. Continue?",
                onConfirm: handleFoodCreation
            });

        } else {
            handleFoodCreation();
        }
    }

    async function handleFoodCreation() {
        const finalyCategory = typeof category === 'string' && category.trim() ? category : 'Categories unspecified';
        const dominantMacro =
            carbs >= protein && carbs >= fat ? 'Carbs' :
                protein >= carbs && protein >= fat ? 'Protein' :
                    'Fat';
        const creatorId = user.id;
        const creatorName = user.firstname + " " + user.lastname;

        askUserIfPublic(async (isPublic) => {
            const payload = {
                label,
                category: finalyCategory,
                servingUnit,
                servingSize,
                energyKcal,
                carbs,
                protein,
                fat,
                dominantMacro,
                creatorId,
                creatorName,
                isPublic,
                isUSDA: false,
                USDAId: -1,
                additionalProps,
            };

            try {
            showSpinner();
                const result = await APIService.nutrition.foods.create(payload);

                if (result.success) {
                const food = result.data.food;
                    setUser(prevUser => ({ ...prevUser, foods: [...(prevUser.foods || []), food] }));
                    return createAlert({ title: 'Success', text: "Successfully created food", onPress: () => router.back() });
                }
                else
                    return createAlert({ title: 'Error', text: result.message });
            } catch (error) {
                console.log(error);
            } finally {
                hideSpinner();
            }
        });
    }

    function askUserIfPublic(callback) {
        createDialog({
            title: 'Food Entry',
            text: "Would you like to make this food entry public?",
            abortText: 'No',
            onConfirm: () => callback(true),
            onAbort: () => callback(false)
        });
    }

    return (
        <>
            <FloatingActionButton
                icon={Images.plus}
                label={"Confirm"}
                iconSize={18}
                labelStyle={{ fontSize: scaleFont(14) }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                position={{ bottom: insets.bottom + 20, right: 20, left: 20 }}
                visible={fabVisible}
                onPress={validateMacrosEntries}
                enableSlide={false}
            />
            <AppScroll extraBottom={250} onScrollSetStates={setFabVisible} contentStyle={{ padding: 15 }}>
                {/* Label & Category */}
                <AppText style={[styles.sectionTitle, { marginTop: 15 }]}>Food Label</AppText>
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
                        onChangeText={(value) => setServingUnit(value)}
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
                            onChangeText={(value) => setServingSize(value.length > 0 ? Number(value) : 0)}
                            value={servingSize}
                            keyboardType="numeric"
                            pointerEvents={servingUnit.length === 0 ? 'none' : 'auto'}
                        />
                    </TouchableOpacity>


                </View>


                {/* Energy & Macronutrients */}
                <AppText style={[styles.sectionTitle, { marginBottom: servingUnit ? 0 : 15, marginTop: 15 }]}>Energy & Macronutrients Profile</AppText>
                {servingUnit && <AppText style={{ fontSize: scaleFont(10), color: colors.mutedText, marginBottom: 10 }}>{`per ${servingSize} ${servingUnit}`}</AppText>}
                <AppTextInput
                    placeholder={`Energy (${user.preferences.energyUnit.field})`}
                    style={[styles.input, { marginBottom: 10 }]}
                    keyboardType="numeric"
                    onChangeText={(value) => setEnergyKcal(convertEnergy(value, user.preferences.energyUnit.key, 'kcal'))}
                    value={energyKcal}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <AppTextInput placeholder="Carbs (g)" keyboardType="numeric" style={[styles.input, { width: '32%' }]} onChangeText={setCarbs} value={carbs} />
                    <AppTextInput placeholder="Protein (g)" keyboardType="numeric" style={[styles.input, { width: '32%' }]} onChangeText={setProtein} value={protein} />
                    <AppTextInput placeholder="Fat (g)" keyboardType="numeric" style={[styles.input, { width: '32%' }]} onChangeText={setFat} value={fat} />
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
                                    onChangeText={(val) => updatePropertyAmount(Number(val), property.id)}
                                    editable={property.unit.length > 0}
                                    value={property.amount}
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