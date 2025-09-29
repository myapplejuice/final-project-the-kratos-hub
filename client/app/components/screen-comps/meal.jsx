import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import AppText from './app-text';
import PercentageBar from './percentage-bar';
import Divider from './divider';
import AnimatedButton from './animated-button';
import { colors, nutritionColors } from '../../utils/settings/styling';
import { Images } from '../../utils/assets';
import { scaleFont } from '../../utils/scale-fonts';
import { UserContext } from '../../utils/contexts/user-context';
import { convertEnergy } from '../../utils/helper-functions/unit-converter';
import ExpandInOut from '../effects/expand-in-out';
import Invert from '../effects/invert';

export default function Meal({ title = 'Meal', num, onDeletePress = () => { }, onRenamePress = () => { }, onAddPress = () => { }, onFoodPress = () => { }, onAddPressVisible = true, onRenamePressVisible = true, onFoodPressVisible = true, onDeletePressVisible = true, foods = [], expandedOnStart = false }) {
    const { user } = useContext(UserContext);
    const [expanded, setExpanded] = useState(expandedOnStart);

    const totals = foods.reduce(
        (acc, food) => {
            acc.energy += food.energy;
            acc.carbs += food.carbs;
            acc.protein += food.protein;
            acc.fat += food.fat;
            return acc;
        },
        { energy: 0, carbs: 0, protein: 0, fat: 0 }
    );

    const totalMacros = totals.carbs + totals.protein + totals.fat || 1;
    const percentages = {
        carb: Math.round((totals.carbs / totalMacros) * 100),
        protein: Math.round((totals.protein / totalMacros) * 100),
        fat: Math.round((totals.fat / totalMacros) * 100),
    };

    return (
        <View style={styles.card}>
            {/* Header */}
            <TouchableOpacity
                onPress={() => setExpanded(prev => !prev)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 9999 }}
            >
                <View>
                    <AppText style={{ fontSize: scaleFont(14), color: 'white', fontWeight: 'bold' }}>Meal {num}</AppText>
                    <AppText style={{ fontSize: scaleFont(9), color: colors.mutedText }}>{title}</AppText>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {onRenamePressVisible && onDeletePressVisible && (
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, marginEnd: 10, paddingHorizontal: 10 }}
                                onPress={onDeletePress}
                            >
                                <Image style={{ width: 16, height: 18, tintColor: nutritionColors.carbs1 }} source={Images.trash} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 10 }}
                                onPress={onRenamePress}
                            >
                                <Image style={{ width: 16, height: 16, tintColor: 'white' }} source={Images.edit} />
                            </TouchableOpacity>
                        </View>
                    )}
                    <Invert inverted={expanded} axis="horizontal">
                        <Image
                            source={Images.arrow}
                            style={{
                                width: 16,
                                height: 16,
                                tintColor: 'white',
                                transform: [{ rotate: '90deg' }],
                                marginStart: 10,
                            }}
                        />
                    </Invert>
                </View>
            </TouchableOpacity>

            {/* Expandable Content */}
            <ExpandInOut visible={expanded} >
                <PercentageBar
                    values={[
                        { percentage: percentages.carb, color: nutritionColors.carbs1 },
                        { percentage: percentages.protein, color: nutritionColors.protein1 },
                        { percentage: percentages.fat, color: nutritionColors.fat1 },
                    ]}
                    barHeight={3}
                    showPercentage={false}
                    barContainerStyle={{ borderRadius: 50, marginTop: foods.length > 0 ? 0 : 12 }}
                />

                {foods.length > 0 ? (
                    foods.map((food, index) => (
                        <TouchableOpacity
                            disabled={!onFoodPressVisible}
                            onPress={onFoodPress}
                            key={index}
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 }}
                        >
                            <View>
                                <AppText style={{ color: 'white', fontSize: scaleFont(13) }}>{food.name}</AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11) }}>
                                    {food.creator}, {food.amount} {food.unit || 'g'}
                                </AppText>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <AppText style={{ fontSize: scaleFont(13), color: nutritionColors.energy1 }}>{food.energy} kcal</AppText>
                                <AppText style={{ fontSize: scaleFont(11), color: 'white' }}>
                                    <AppText style={{ color: nutritionColors.carbs1 }}>C: {food.carbs}g</AppText> ·{' '}
                                    <AppText style={{ color: nutritionColors.protein1 }}>P: {food.protein}g</AppText> ·{' '}
                                    <AppText style={{ color: nutritionColors.fat1 }}>F: {food.fat}g</AppText>
                                </AppText>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 15, paddingVertical: 20 }}>
                        <AppText style={{ color: colors.mutedText, fontSize: scaleFont(13), fontWeight: 'bold' }}>No foods added</AppText>
                    </View>
                )}

                {/* Totals & Add Button */}
                <View style={{ padding: 15, alignItems: 'center', backgroundColor: 'rgba(58,58,58,0.49)', borderRadius: 15, marginTop: foods.length > 0 ? 7 : 15, marginBottom: onAddPressVisible ? 0 : 15 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <AppText style={{ color: nutritionColors.energy1, fontSize: scaleFont(10) }}>
                            {convertEnergy(totals.energy, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                        </AppText>
                        <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>Energy</AppText>
                    </View>
                    <Divider orientation="horizontal" style={{ marginVertical: 8 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <AppText style={{ color: nutritionColors.carbs1, fontSize: scaleFont(10) }}>{totals.carbs}g</AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>Carbs</AppText>
                        </View>
                        <Divider />
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <AppText style={{ color: nutritionColors.protein1, fontSize: scaleFont(10) }}>{totals.protein}g</AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>Protein</AppText>
                        </View>
                        <Divider />
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <AppText style={{ color: nutritionColors.fat1, fontSize: scaleFont(10) }}>{totals.fat}g</AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10) }}>Fat</AppText>
                        </View>
                    </View>
                </View>

                {onAddPressVisible && (
                    <AnimatedButton
                        title="Add Food"
                        style={{ padding: 15, backgroundColor: colors.accentGreen, borderRadius: 15, marginTop: 15 }}
                        textStyle={{ fontSize: scaleFont(13), fontWeight: 'bold' }}
                        leftImage={Images.plus}
                        leftImageStyle={{ tintColor: 'white', width: 18, height: 18 }}
                        leftImageContainerStyle={{
                            width: 16,
                            height: 16,
                            padding: 5,
                            borderRadius: 50,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginEnd: 8,
                        }}
                        onPress={onAddPress}
                    />
                )}
            </ExpandInOut>
        </View>
    );
}

const styles = {
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 15,
        marginHorizontal: 15,
        marginTop: 15,
        padding: 15,
        overflow: 'hidden',
    },
};