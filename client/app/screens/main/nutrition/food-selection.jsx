import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useState } from "react";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppScroll from "../../../components/screen-comps/app-scroll";
import AppText from "../../../components/screen-comps/app-text";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import AppView from "../../../components/screen-comps/app-view";
import Divider from "../../../components/screen-comps/divider";
import FloatingActionButton from "../../../components/screen-comps/floating-action-button";
import { Images } from "../../../utils/assets";
import { UserContext } from "../../../utils/contexts/user-context";
import { convertEnergy } from "../../../utils/helper-functions/unit-converter";
import { scaleFont } from "../../../utils/scale-fonts";
import { routes } from "../../../utils/settings/constants";
import { colors, nutritionColors } from "../../../utils/settings/styling";
import FadeInOut from "../../../components/effects/fade-in-out";

export default function FoodSelection() {
    const { user, additionalContexts, setAdditionalContexts } = useContext(UserContext);
    const meal = additionalContexts.selectedMeal;
    const insets = useSafeAreaInsets();
    const [fabVisible, setFabVisible] = useState(true);

    const [selectedFood, setSelectedFood] = useState({});
    const [selectedList, setSelectedList] = useState('My Foods');
    const [userFoods, setUserFoods] = useState([]);
    const [foodList, setFoodList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const list = user.foods || [];

        setUserFoods(list);
        if (selectedList === 'My Foods') {
            setFoodList(list);
        }
    }, [user.foods]);

    async function handleListSwitch(list) {
        if (list === selectedList) return;

        if (list === 'My Foods') {
            setFoodList(userFoods);

        } else if (list === 'Library') {
            setFoodList([]);
        } else if (list === 'Community') {
            setFoodList([]);
        }
        setSelectedList(list);
    }

    function handleFoodSelection(food) {
        setAdditionalContexts(prev => ({ ...prev, selectedFood: food }));
        router.push(routes.FOOD_PROFILE)
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
                        { title: 'My Foods', onPress: () => handleListSwitch('My Foods') },
                        { title: 'Library', onPress: () => handleListSwitch('Library') },
                        { title: 'Community', onPress: () => handleListSwitch('Community') }
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
                        onChangeText={(value) => { setSearchQuery(value) }}
                        value={searchQuery}
                        placeholder="Search"
                        placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                        style={styles.inputStripped} />
                </View>

                {foodList.length > 0 ? (
                    <AppScroll onScrollSetStates={setFabVisible} extraTop={0} topPadding={false}>
                        {foodList.map((food, i) => (
                            <TouchableOpacity key={food.id} style={{ padding: 15, backgroundColor: colors.cardBackground, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }} onPress={() => handleFoodSelection(food)}>
                                <View style={{ justifyContent: 'center', width: '60%' }}>
                                    <AppText style={{ color: 'white', fontSize: scaleFont(12) }}>{food.label}</AppText>
                                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(8), marginTop: 0 }}>{selectedList !== 'My Foods' ? food.creatorName : food.isPublic ? 'Public' : 'Private'}, {food.servingSize} {food.servingUnit}</AppText>
                                </View>
                                <View style={{ alignItems: 'flex-end', width: '40%' }}>
                                    <AppText style={{ color: nutritionColors.energy1, fontSize: scaleFont(12) }}>{convertEnergy(food.energyKcal, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}</AppText>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '46%', marginTop: 0 }}>
                                        <AppText style={{ color: nutritionColors.carbs1, fontSize: scaleFont(8) }}>C: {food.carbs}</AppText>
                                        <Divider orientation="vertical" thickness={1} color={colors.divider} />
                                        <AppText style={{ color: nutritionColors.protein1, fontSize: scaleFont(8) }}>P: {food.protein}</AppText>
                                        <Divider orientation="vertical" thickness={1} color={colors.divider} />
                                        <AppText style={{ color: nutritionColors.fat1, fontSize: scaleFont(8) }}>F: {food.fat}</AppText>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </AppScroll>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                        <View style={{ marginBottom: 200, alignItems: 'center' }}>
                            <Image source={Images.list} style={{ tintColor: colors.mutedText, width: 100, height: 100, marginBottom: 15 }} />
                            <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center', marginBottom: 10, }}>
                                Start searching for foods
                            </AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, }}>
                                Use the search bar above to find meals from My Foods, the Library, or Community contributions.
                            </AppText>
                            <FadeInOut visible={selectedList === 'My Foods'} inDuration={200} outDuration={200} removeWhenHidden={false}>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, marginTop: 15 }}>
                                    You can also add your own foods to My Foods.
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