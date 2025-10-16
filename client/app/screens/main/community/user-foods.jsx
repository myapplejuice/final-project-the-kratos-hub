import { router, useLocalSearchParams, } from 'expo-router';
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
import APIService from '../../../common/services/api-service';

export default function UserFoods() {
    const userId = useLocalSearchParams().userId;
    const { user } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const [fabVisible, setFabVisible] = useState(true);
    const [scrollToTop, setScrollToTop] = useState(false);
    const [loading, setLoading] = useState(true);

    const [userFoods, setUserFoods] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [foodList, setFoodList] = useState([]);

    useEffect(() => {
        async function fetchUserFoods() {
            try {
                const result = await APIService.nutrition.foods.foodsByUserId({ userId });
console.log(result)
                if (result.success) {
                    setUserFoods(result.data.foods || []);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

        fetchUserFoods();
    }, []);

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
        router.push({
            pathname: routes.FOOD_PROFILE,
            params: {
                selectedFood: JSON.stringify(food),
                foodProfileIntent: 'otherUserFoods'
            }
        });
    }

    return (
        <>
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
                </View>

                <Divider orientation="horizontal" thickness={2} color={colors.divider} style={{ borderRadius: 50, marginBottom: 15 }} />

                {!loading ?
                    (foodList.length > 0 ? (
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
                                <FadeInOut visible={(userFoods?.length || 0) === 0} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                    <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                        This user has no foods created
                                    </AppText>
                                </FadeInOut>
                                <FadeInOut visible={(userFoods?.length || 0) > 0 && foodList.length === 0} inDuration={400} outDuration={400} removeWhenHidden={false} collapseWhenHidden>
                                    <AppText style={{ color: colors.mutedText, fontWeight: 'bold', fontSize: scaleFont(18), textAlign: 'center' }}>
                                        Food not found
                                    </AppText>
                                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(14), textAlign: 'center', lineHeight: 20, marginTop: 10 }}>
                                        Try checking again with a different search term.
                                    </AppText>
                                </FadeInOut>
                            </View>
                        </View>
                    )) : (
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <View style={{ justifyContent: 'flex-end', alignItems: 'center', height: 70, width: '100%', borderRadius: 20, backgroundColor: colors.cardBackground, marginBottom: 15 }} />
                            <View style={{ justifyContent: 'flex-end', alignItems: 'center', height: 70, width: '100%', borderRadius: 20, backgroundColor: colors.cardBackground, marginBottom: 15 }} />
                            <View style={{ justifyContent: 'flex-end', alignItems: 'center', height: 70, width: '100%', borderRadius: 20, backgroundColor: colors.cardBackground, marginBottom: 15 }} />
                            <View style={{ justifyContent: 'flex-end', alignItems: 'center', height: 70, width: '100%', borderRadius: 20, backgroundColor: colors.cardBackground, marginBottom: 15 }} />

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