import { router, } from 'expo-router';
import { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppScroll from "../../../components/screen-comps/app-scroll";
import AppText from "../../../components/screen-comps/app-text";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import AppView from "../../../components/screen-comps/app-view";
import Divider from "../../../components/screen-comps/divider";
import FloatingActionButton from "../../../components/screen-comps/floating-action-button";
import { Images } from "../../../common/settings/assets";
import { UserContext } from "../../../common/contexts/user-context";
import { convertEnergy } from "../../../common/utils/unit-converter";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { routes } from "../../../common/settings/constants";
import { colors, nutritionColors } from "../../../common/settings/styling";
import FadeInOut from "../../../components/effects/fade-in-out";
import { CameraContext } from '../../../common/contexts/camera-context';
import BarcodeScanner from '../../../components/screen-comps/barcode-scanner';

export default function Foods() {
    const { user, setAdditionalContexts } = useContext(UserContext);
    const { setCameraActive } = useContext(CameraContext);
    const insets = useSafeAreaInsets();
    const [fabVisible, setFabVisible] = useState(true);
    const [scrollToTop, setScrollToTop] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [userFoods, setUserFoods] = useState([]);
    const [foodList, setFoodList] = useState([]);

    useEffect(() => {
        const userFoods = user.foods || [];
        setUserFoods(userFoods);
        setFoodList(userFoods);
    }, [user.foods]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFoodList(userFoods);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = userFoods.filter(food =>
                food.label.toLowerCase().includes(query)
            );
            setFoodList(filtered);
        }
    }, [searchQuery, userFoods]);

    function handleFoodSelection(food) {
        setAdditionalContexts(prev => ({ ...prev, selectedFood: food, foodProfileIntent: 'myfoods' }));
        router.push(routes.FOOD_PROFILE)
    }

    async function handleBarcode(barcode) {
        showSpinner();
        const upc = barcode.data;

        const requestBody = {
            query: upc,
            pageNumber: 1,
            pageSize: 1,
            dataType: ["Branded", "Foundation", "Survey (FNDDS)"],
            sortOrder: "desc"
        };

        const result = await APIService.USDARequest(JSON.stringify(requestBody));
        hideSpinner();

        if (!result.success) {
            return createAlert({ title: 'Barcode Scan', text: 'Internal server error, please try again later' })
        }

        if (result.data.length > 0) {
            const food = result.data[0];

            const label = normalizeLabel(food.description) || 'Unknown';
            const fullLabel = food.dataType === 'Branded' && food.brandOwner ? `${label} (${food.brandOwner})` : label;

            const nutrients = food.foodNutrients || [];
            const excludedNutrients = ['Energy', 'Protein', 'Total lipid (fat)', 'Carbohydrate, by difference'];

            const additionalProps = nutrients
                .filter(n => !excludedNutrients.includes(n.nutrientName))
                .map((n, i) => ({
                    id: i,
                    label: n.nutrientName,
                    amount: n.value,
                    unit: n.unitName
                }));

            const energyKcal = nutrients.find(n => n.nutrientName === 'Energy')?.value || 0;
            const carbs = nutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0;
            const protein = nutrients.find(n => n.nutrientName === 'Protein')?.value || 0;
            const fat = nutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0;
            const servingSize = food.servingSize || 100;
            const servingUnit = (food.servingSizeUnit || 'g').toLowerCase();

            let dominantMacro = 'Carbs';
            if (protein > carbs && protein > fat) dominantMacro = 'Protein';
            else if (fat > carbs && fat > protein) dominantMacro = 'Fat';

            const info = {
                id: `usda-${food.fdcId}`,
                label: fullLabel || 'Unknown',
                category: food.foodCategory || 'USDA Food',
                ownerId: '00000000-0000-0000-0000-000000000000',
                creatorId: '00000000-0000-0000-0000-000000000000',
                creatorName: 'USDA',
                isPublic: true,
                isUSDA: true,
                USDAId: food.fdcId,
                energyKcal,
                carbs,
                protein,
                fat,
                dominantMacro,
                servingSize,
                servingUnit,
                additionalProps,
            };

            console.log("Extracted info:", info);
        } else {
            createAlert({ title: 'Barcode Scan', text: 'Barcode did not match a food' })
        }
    }

    return (
        <>
            <BarcodeScanner onScan={(barcode) => handleBarcode(barcode)} />
            <FloatingActionButton
                icon={Images.plus}
                label={"Create New Food"}
                iconSize={18}
                labelStyle={{ fontSize: scaleFont(14) }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                position={{ bottom: insets.bottom + 20, right: 20, left: 20 }}
                visible={fabVisible}
                onPress={() => router.push(routes.FOOD_CREATOR)}
            />

            <FloatingActionButton
                onPress={() => setScrollToTop(true)}
                visible={!fabVisible}
                position={{ bottom: insets.bottom + 40, left: 20 }}
                icon={Images.arrow}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
                iconSize={20}
                size={40}
            />

            <AppView style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.inputBackground, alignItems: 'center', borderRadius: 15, marginVertical: 15, height: 50 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '80%' }}>
                        <Image source={Images.magnifier} style={{ tintColor: colors.mutedText, width: 20, height: 20, marginHorizontal: 15 }} />
                        <AppTextInput
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            placeholder="Search"
                            placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                            style={styles.inputStripped} />
                    </View>
                    <TouchableOpacity onPress={() => setCameraActive(true)} style={{ width: '15%', justifyContent: 'center', alignItems: "center", height: '100%', borderRadius: 15 }}>
                        <Image source={Images.barcode1} style={{ tintColor: colors.mutedText, width: 20, height: 20 }} />
                    </TouchableOpacity>
                </View>

                <Divider orientation="horizontal" thickness={2} color={colors.divider} style={{ borderRadius: 50, marginBottom: 15 }} />

                {foodList.length > 0 ? (
                    <>
                        <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12), marginHorizontal: 15, marginBottom: 10 }}>Foods Count: {foodList.length}</AppText>
                        <AppScroll scrollToTop={scrollToTop} extraBottom={200} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} extraTop={0} topPadding={false}>
                            <View>
                                {foodList.map((food) => (
                                    <TouchableOpacity
                                        key={food.id}
                                        style={{
                                            padding: 15,
                                            backgroundColor: colors.cardBackground,
                                            borderRadius: 15,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginBottom: 5,
                                        }}
                                        onPress={() => handleFoodSelection(food)}
                                    >
                                        <View style={{ justifyContent: 'center', width: '60%' }}>
                                            <AppText style={{ color: 'white', fontSize: scaleFont(12) }}>{food.label}</AppText>
                                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(8), marginTop: 0 }}>
                                                {food.category}, {food.servingSize} {food.servingUnit}
                                            </AppText>
                                        </View>
                                        <View style={{ alignItems: 'flex-end', width: '40%' }}>
                                            <AppText style={{ color: nutritionColors.energy1, fontSize: scaleFont(12) }}>
                                                {convertEnergy(food.energyKcal, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                                            </AppText>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 0 }}>
                                                <AppText style={{ color: nutritionColors.carbs1, fontSize: scaleFont(8) }}>C: {food.carbs}</AppText>
                                                <Divider orientation="vertical" thickness={1} color={colors.divider} style={{ marginHorizontal: 5 }} />
                                                <AppText style={{ color: nutritionColors.protein1, fontSize: scaleFont(8) }}>P: {food.protein}</AppText>
                                                <Divider orientation="vertical" thickness={1} color={colors.divider} style={{ marginHorizontal: 5 }} />
                                                <AppText style={{ color: nutritionColors.fat1, fontSize: scaleFont(8) }}>F: {food.fat}</AppText>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </AppScroll>
                    </>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                        <View style={{ justifyContent: 'flex-end', alignItems: 'center', height: '30%' }}>
                            <Image source={Images.list} style={{ tintColor: colors.mutedText, width: 100, height: 100, marginBottom: 15 }} />
                        </View>
                        <View style={{ alignItems: 'center', height: '70%' }}>
                            {/* MY FOODS */}
                            <FadeInOut visible={(userFoods?.length || 0) === 0} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                    You have no foods
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, marginTop: 10 }}>
                                    You can create your own foods by clicking below.
                                </AppText>
                            </FadeInOut>
                            <FadeInOut visible={(userFoods?.length || 0) > 0 && foodList.length === 0} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                    Food not found
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, marginTop: 10 }}>
                                    Try adding the food by clicking below or check again with a different search term.
                                </AppText>
                            </FadeInOut>
                        </View>
                    </View>
                )}
            </AppView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: 'white',
        marginHorizontal: 10,
        marginBottom: 10
    },
    inputStripped: {
        height: 50,
        color: "white",
        width: '100%',
    },
    input: {
        height: 50,
        color: "white",
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 15,
        marginHorizontal: 15,
        backgroundColor: colors.inputBackground
    },
    card: {
        backgroundColor: colors.cardBackground,
        padding: 15,
        borderRadius: 15,
        marginTop: 15,
        marginHorizontal: 15
    },
});