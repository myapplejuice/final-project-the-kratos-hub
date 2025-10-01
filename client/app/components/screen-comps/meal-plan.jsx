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

export default function MealPlan({ label, date, description, meals = [], onDeletePress = () => { }, onRenamePress = () => { }, expandedOnStart = false, onExpand = () => { } }) {
    const { user } = useContext(UserContext);
    const [expanded, setExpanded] = useState(expandedOnStart);

    const totals = meals.reduce(
        (acc, meal) => {
            meal.foods.forEach(food => {
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
    
    return (
        <FadeInOut visible={true}>
            <View style={styles.card}>
                <TouchableOpacity onPress={() => { setExpanded(prev => !prev) }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <AppText style={{ fontSize: scaleFont(14), color: 'white', fontWeight: 'bold' }}>{label}</AppText>
                            <AppText style={{ fontSize: scaleFont(9), color: colors.mutedText, fontWeight: 'bold' }}>{formattedDate}</AppText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, marginEnd: 10, paddingHorizontal: 10 }}

                                >
                                    <Image style={{ width: 16, height: 18, tintColor: nutritionColors.carbs1 }} source={Images.trash} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 10 }}

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
                    <View style={{ marginVertical: 25 }}>
                        <AppText style={{ color: colors.mutedText, fontSize: scaleFont(10), textAlign: description !== 'No description provided.' ? 'left' : 'center', lineHeight: 16 }}>
                            {description}
                        </AppText>
                    </View>
                      
                    <View style={{ padding: 15, alignItems: 'center', backgroundColor: 'rgba(58,58,58,0.49)', borderRadius: 15, marginTop: 0 }}>
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
                </ExpandInOut>
            </View>
        </FadeInOut>
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