import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from "react";
import { Image, Keyboard, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
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
import APIService from '../../../common/services/api-service';
import usePopups from "../../../common/hooks/use-popups";

export default function FoodSelection() {
    const { user, setAdditionalContexts } = useContext(UserContext);
    const { createAlert, showSpinner, hideSpinner, createToast } = usePopups();
    const insets = useSafeAreaInsets();
    const [fabVisible, setFabVisible] = useState(true);

    const [selectedList, setSelectedList] = useState('My Foods');
    const [searchQuery, setSearchQuery] = useState('');
    const [USDAQueryTriggered, setUSDAQueryTriggered] = useState(false);
    const [usdaPage, setUsdaPage] = useState(1);
    const [usdaPageSize, setUsdaPageSize] = useState(25);

    const [foodList, setFoodList] = useState([]);
    const [userFoods, setUserFoods] = useState([]);
    const [USDAFoods, setUSDAFoods] = useState([]);
    const [communityFoods, setCommunityFoods] = useState([]);

    useEffect(() => {
        async function fetchCommunityFoods() {
            const result = await APIService.nutrition.foods.foods('community');
            const foods = result.data.foods || [];
            setCommunityFoods(foods);
        }

        fetchCommunityFoods();
    }, []);

    useEffect(() => {
        const userFoods = user.foods || [];
        setUserFoods(userFoods);
    }, [user.foods]);

    useEffect(() => {
        setSearchQuery('');

        if (selectedList === 'My Foods') {
            setUSDAQueryTriggered(false);
            setFoodList(userFoods);
        } else if (selectedList === 'Library') {
            setFoodList(USDAFoods);
        } else if (selectedList === 'Community') {
            setUSDAQueryTriggered(false);
            setFoodList(communityFoods);
        }
    }, [selectedList]);

    useEffect(() => {
        if (selectedList === 'Library') return;

        const sourceList =
            selectedList === 'My Foods' ? userFoods || [] :
                selectedList === 'Community' ? communityFoods : [];

        if (searchQuery.trim() === '') {
            setFoodList(sourceList);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = sourceList.filter(food =>
                food.label.toLowerCase().includes(query)
            );
            setFoodList(filtered);
        }
    }, [searchQuery]);

    function handleFoodSelection(food) {
        setAdditionalContexts(prev => ({ ...prev, selectedFood: food, foodProfileIntent: 'meal/add' }));
        router.push(routes.FOOD_PROFILE)
    }

    async function handleUSDASearch() {
        if (!searchQuery.trim()) return;

        try {
            showSpinner();
            const requestBody = JSON.stringify({
                query: searchQuery,
                pageNumber: usdaPage,
                pageSize: usdaPageSize,
                sortOrder: 'desc'
            })
            const result = await APIService.USDARequest(requestBody);

            console.log(result)
            if (!result.success)
                return createAlert({ message: result.message });

            if (result.data.length === 0) {
                hideSpinner();
                return createToast({ message: 'Food not found' });
            }

            const fetchedFoods = result.data || [];

            // Remove duplicates based on fdcId
            const existingIds = new Set(USDAFoods.map(f => f.USDAId));
            const newFoods = fetchedFoods.filter(f => !existingIds.has(f.fdcId));

            // Parse USDA food into your structure
            const parsedFoods = newFoods.map(f => {
                const nutrients = f.foodNutrients || [];

                // Macronutrient names to exclude from additionalProps
                const excludedNutrients = ['Energy', 'Protein', 'Total lipid (fat)', 'Carbohydrate, by difference'];

                const additionalProps = nutrients
                    .filter(n => !excludedNutrients.includes(n.nutrientName))
                    .map((n, i) => ({
                        id: i,
                        label: n.nutrientName,
                        originalAmount: n.value,
                        amount: n.value,
                        unit: n.unitName
                    }));

                const energyKcal = nutrients.find(n => n.nutrientName === 'Energy')?.value || 0;
                const carbs = nutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0;
                const protein = nutrients.find(n => n.nutrientName === 'Protein')?.value || 0;
                const fat = nutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0;
                const servingSize = f.servingSize || 100;
                const servingUnit = (f.servingSizeUnit || 'g').toLowerCase();

                let dominantMacro = 'Carbs';
                if (protein > carbs && protein > fat) dominantMacro = 'Protein';
                else if (fat > carbs && fat > protein) dominantMacro = 'Fat';

                return {
                    id: `usda-${f.fdcId}`,
                    label: f.description || 'Unknown',
                    category: f.foodCategory || 'USDA Food',
                    ownerId: '00000000-0000-0000-0000-000000000000',
                    creatorId: '00000000-0000-0000-0000-000000000000',
                    creatorName: 'USDA',
                    isPublic: true,
                    isUSDA: true,
                    USDAId: f.fdcId,
                    originalServingSize: servingSize,
                    originalEnergyKcal: energyKcal,
                    originalCarbs: carbs,
                    originalProtein: protein,
                    originalFat: fat,
                    energyKcal,
                    carbs,
                    protein,
                    fat,
                    dominantMacro,
                    servingSize,
                    servingUnit,
                    additionalProps
                };
            });

            // Update state
            setUSDAFoods(prev => [...prev, ...parsedFoods]);
            setFoodList(prev => [...prev, ...parsedFoods]);

            // Increment page
            setUsdaPage(prev => prev + 1);
            hideSpinner();
        } catch (e) {
            console.error('USDA search failed:', e);
        }
    }

    return (
        <>
            <FloatingActionButton
                icon={Images.plus}
                label={"Create New Food"}
                iconSize={18}
                labelStyle={{ fontSize: scaleFont(14) }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                position={{ bottom: insets.bottom + 20, right: 20, left: 20 }}
                visible={fabVisible && selectedList === 'My Foods'}
                onPress={() => router.push(routes.FOOD_CREATOR)}
            />
            <AppView style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15, }}>
                    {[
                        { title: 'My Foods', onPress: () => setSelectedList('My Foods') },
                        { title: 'Library', onPress: () => setSelectedList('Library') },
                        { title: 'Community', onPress: () => setSelectedList('Community') }
                    ].map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[{ borderWidth: 1, borderColor: colors.main, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 50, width: 105, alignItems: 'center' }, selectedList === item.title && { backgroundColor: colors.main }]}
                            onPress={item.onPress}
                        >
                            <AppText style={{ color: selectedList === item.title ? 'white' : colors.main, fontWeight: 'bold' }}>{item.title}</AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                <Divider orientation="horizontal" thickness={2} color={colors.divider} style={{ borderRadius: 50, marginBottom: 15 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', backgroundColor: colors.inputBackground, alignItems: 'center', borderRadius: 15, marginBottom: 25 }}>
                    <Image source={Images.magnifier} style={{ tintColor: colors.mutedText, width: 20, height: 20, marginHorizontal: 15 }} />
                    <AppTextInput
                        onChangeText={setSearchQuery}
                        onSubmitEditing={async () => {
                            Keyboard.dismiss()
                            if (!searchQuery)
                                return;

                            if (selectedList === 'Library') {
                                await handleUSDASearch();
                                setUSDAQueryTriggered(true)
                            }
                        }}
                        value={searchQuery}
                        placeholder="Search"
                        placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                        style={styles.inputStripped} />
                </View>

                {foodList.length > 0 ? (
                    <AppScroll extraBottom={200} onScrollSetStates={setFabVisible} extraTop={0} topPadding={false}>
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
                    </AppScroll>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                        <View style={{ justifyContent: 'flex-end', alignItems: 'center', height: '30%' }}>
                            <Image source={Images.list} style={{ tintColor: colors.mutedText, width: 100, height: 100, marginBottom: 15 }} />
                        </View>
                        <View style={{ alignItems: 'center', height: '70%' }}>
                            {/* MY FOODS */}
                            <FadeInOut visible={selectedList === 'My Foods' && (userFoods?.length || 0) === 0} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                    You have no foods
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, marginTop: 10 }}>
                                    You can create your own foods by clicking below or use the search bar to find meals from the Library or Community contributions.
                                </AppText>
                            </FadeInOut>
                            <FadeInOut visible={selectedList === 'My Foods' && (userFoods?.length || 0) > 0 && foodList.length === 0} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                    Food not found
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, marginTop: 10 }}>
                                    Try adding the food by clicking below or check the Library and Community contributions.
                                </AppText>
                            </FadeInOut>

                            {/* LIBRARY */}
                            <FadeInOut visible={selectedList === 'Library' && foodList.length === 0 && !USDAQueryTriggered} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                    Start searching for foods
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', marginTop: 10 }}>
                                    All foods in the library provided by:
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', marginTop: 10 }}>
                                    U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, 2025. fdc.nal.usda.gov.
                                </AppText>
                            </FadeInOut>
                            <FadeInOut visible={selectedList === 'Library' && foodList.length === 0 && USDAQueryTriggered} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                    Food not found
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, marginTop: 10 }}>
                                    Try searching for another food or check My Foods or Community.
                                </AppText>
                            </FadeInOut>

                            {/* COMMUNITY */}
                            <FadeInOut visible={selectedList === 'Community' && (foodList.length === 0 && communityFoods.length === 0)} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                    No foods currently available
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, marginTop: 10 }}>
                                    You can contribute by adding your own foods, which would help us, the community, and you!
                                </AppText>
                            </FadeInOut>
                            <FadeInOut visible={selectedList === 'Community' && communityFoods.length > 0 && foodList.length === 0} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                    Food not found
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, marginTop: 10 }}>
                                    Try searching for another food or check the Library or add the food in My Foods.
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
        marginHorizontal: 15,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 5 },
            android: { elevation: 5 },
        }),
    },
});