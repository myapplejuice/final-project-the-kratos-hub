import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import AppText from './app-text';
import PercentageBar from './percentage-bar';
import Divider from './divider';
import AnimatedButton from './animated-button';
import { colors, nutritionColors } from '../../common/settings/styling';
import { Images } from '../../common/settings/assets';
import { scaleFont } from '../../common/utils/scale-fonts';
import { UserContext } from '../../common/contexts/user-context';
import { convertEnergy } from '../../common/utils/unit-converter';
import ExpandInOut from '../effects/expand-in-out';
import Invert from '../effects/invert';
import { formatDate, formatTime, toDateFromSQLTime } from '../../common/utils/date-time';
import FadeInOut from '../effects/fade-in-out';

export default function MealPlan({ label, date, description, meals = [], onDeletePress = () => { }, onUpdatePress = () => { }, onPlanPress = () => { }, onImportPlanPress = () => { }, expandedOnStart = false, showImportButton = false }) {
    const { user } = useContext(UserContext);
    const [expanded, setExpanded] = useState(expandedOnStart);

    const totals = meals.reduce(
        (acc, meal) => {
            meal.foods?.forEach(food => {
                acc.energyKcal += food.energyKcal;
                acc.carbs += food.carbs;
                acc.protein += food.protein;
                acc.fat += food.fat;
            });
            return acc;
        },
        { energyKcal: 0, carbs: 0, protein: 0, fat: 0 }
    );

    const formattedDate = formatDate(date, { format: user.preferences.dateFormat.key });
    const mealCount = meals?.length;
    const foodCount = meals.reduce((acc, meal) => acc + meal.foods?.length, 0 || 0);
    const totalMacros = (totals.carbs + totals.protein + totals.fat) || 0;
    const macroPercentages = {
        carbs: Math.round((totals.carbs / totalMacros * 100)),
        protein: Math.round((totals.protein / totalMacros * 100)),
        fat: Math.round((totals.fat / totalMacros * 100)),
    }

    return (
        <FadeInOut visible={true}>
            <View style={styles.card}>
                <TouchableOpacity onPress={() => { setExpanded(prev => !prev) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ maxWidth: '50%' }}>
                            <AppText style={{ fontSize: scaleFont(15), color: 'white', fontWeight: 'bold' }}>{label}</AppText>
                            <AppText style={{ fontSize: scaleFont(9), color: colors.mutedText, fontWeight: 'bold' }}>{formattedDate}</AppText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, marginEnd: 10, paddingHorizontal: 10 }}
                                    onPress={onDeletePress}
                                >
                                    <Image style={{ width: 16, height: 18, tintColor: nutritionColors.carbs1 }} source={Images.trash} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 10 }}
                                    onPress={onUpdatePress}
                                >
                                    <Image style={{ width: 16, height: 16, tintColor: 'white' }} source={Images.edit} />
                                </TouchableOpacity>
                            </View>
                            <Invert inverted={expanded} axis='horizontal'>
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
                    </View>
                </TouchableOpacity>

                <ExpandInOut visible={expanded}>
                    <View style={{ marginVertical: 25, padding: 20, borderRadius: 15, backgroundColor: colors.backgroundTop }}>
                        <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10), textAlign: description !== 'No description provided' ? 'left' : 'center' }}>
                            {description}
                        </AppText>
                    </View>


                    <AppText style={{ color: 'white', fontSize: scaleFont(15), fontWeight: 'bold', textAlign: 'left', lineHeight: 16 }}>Macro' Distribution</AppText>
                    <PercentageBar
                        values={[
                            { percentage: macroPercentages.carbs, color: nutritionColors.carbs1 },
                            { percentage: macroPercentages.protein, color: nutritionColors.protein1 },
                            { percentage: macroPercentages.fat, color: nutritionColors.fat1 },
                        ]}
                        barHeight={10}
                        showTitles={false}
                        barContainerStyle={{ borderRadius: 50, marginTop: 10, marginBottom: 5 }}
                    />

                    <View style={{ padding: 15, alignItems: 'center', backgroundColor: 'rgba(58,58,58,0.49)', borderRadius: 15, marginTop: 20 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <AppText style={{ color: nutritionColors.energy1, fontSize: scaleFont(10) }}>
                                {convertEnergy(totals.energyKcal, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
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

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                        <View style={{ alignItems: 'center', backgroundColor: 'rgba(58,58,58,0.49)', width: '48%', padding: 10, borderRadius: 15 }}>
                            <AppText style={{ color: 'white', fontSize: scaleFont(13) }}>
                                {mealCount}
                            </AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(9) }}>Meals</AppText>
                        </View>
                        <View style={{ alignItems: 'center', backgroundColor: 'rgba(58,58,58,0.49)', width: '48%', padding: 10, borderRadius: 15 }}>
                            <AppText style={{ color: 'white', fontSize: scaleFont(13) }}>
                                {foodCount}
                            </AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(9) }}>Foods</AppText>
                        </View>
                    </View>

                    <View style={showImportButton ? { flexDirection: 'row', justifyContent: 'space-between' } : {}}>
                        {showImportButton &&
                            <AnimatedButton
                                title="Import Plan"
                                style={{
                                    padding: 15,
                                    backgroundColor: colors.accentGreen,
                                    borderRadius: 15,
                                    marginTop: 15,
                                    width: '48%'
                                }}
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
                                onPress={onImportPlanPress}
                            />
                        }
                        <AnimatedButton
                            title="Full Plan"
                            style={{
                                padding: 15,
                                backgroundColor: colors.accentGreen,
                                borderRadius: 15,
                                marginTop: 15,
                                width: showImportButton ? '48%' : '100%',
                            }}
                            textStyle={{ fontSize: scaleFont(13), fontWeight: 'bold' }}
                            rightImage={Images.arrow}
                            rightImageStyle={{ tintColor: 'white', width: 18, height: 18 }}
                            rightImageContainerStyle={{
                                width: 16,
                                height: 16,
                                padding: 5,
                                borderRadius: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginStart: 8,
                            }}
                            onPress={onPlanPress}
                        />
                    </View>
                </ExpandInOut>
            </View>
        </FadeInOut>
    );
}

const styles = {
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        marginHorizontal: 15,
        marginTop: 15,
        padding: 20,
        overflow: 'hidden',
    },
};