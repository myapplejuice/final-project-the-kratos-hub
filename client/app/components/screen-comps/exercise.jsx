import { useContext, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AppText from './app-text';
import ExpandInOut from '../effects/expand-in-out';
import AnimatedButton from './animated-button';
import { colors } from '../../common/settings/styling';
import { scaleFont } from '../../common/utils/scale-fonts';
import { Images } from '../../common/settings/assets';
import Inverted from '../effects/invert';
import { convertWeight } from '../../common/utils/unit-converter';

export default function Exercise({ user, sets, exercise, onExpand = () => { }, expanded = false, onAddPress = () => { }, onDeletePress = () => { }, onSetEditPress = () => { }, onSetDeletePress = () => { } }) {
    function formatVolume(num) {
        const convertedValue = convertWeight(num, 'kg', user.preferences.weightUnit.key || 'kg');
        if (convertedValue >= 1_000_000) return (convertedValue / 1_000_000).toFixed(2) + "M";
        if (convertedValue >= 1_000) return (convertedValue / 1_000).toFixed(2) + "k";
        return convertedValue.toString();
    };

    const totalSets = sets?.length || 0;
    const totalReps = sets?.reduce((sum, s) => sum + s.reps, 0) || 0;
    const totalVolume = sets?.reduce((sum, s) => sum + s.reps * s.weight, 0) || 0;

    return (
        <View style={[styles.card]}>
            {/* Title Container */}
            <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={onExpand}
            >
                <View style={{ flex: 1 }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(16), fontWeight: 'bold' }}>
                       {exercise?.muscleGroups?.join(', ') ?? ''}
                    </AppText>
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11) }}>
                        {exercise?.muscleGroups?.join(', ') ?? ''}
                    </AppText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                    <TouchableOpacity
                        style={{ padding: 8, backgroundColor: 'rgba(255, 59, 48, 0.15)', borderRadius: 8, marginLeft: 8 }}
                        onPress={onDeletePress}
                    >
                        <Image source={Images.trash} style={{ width: 18, height: 18, tintColor: colors.negativeRed }} />
                    </TouchableOpacity>
                    <Inverted inverted={expanded} axis='horizontal' >
                        <Image
                            source={Images.arrow}
                            style={{
                                width: 16,
                                height: 16,
                                tintColor: 'white',
                                marginStart: 20,
                                transform: [{ rotate: '90deg' }],
                            }}
                        />
                    </Inverted>
                </View>
            </TouchableOpacity>

            {/* Expandable Section */}
            <ExpandInOut visible={expanded}>
                <View style={{ marginTop: 25 }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(14), fontWeight: '700', marginBottom: 12 }}>Sets</AppText>

                    {sets.map((set, index) => (
                        <TouchableOpacity
                            key={index}
                            onLongPress={() => onSetDeletePress(set)}
                            onPress={() => onSetEditPress(set)}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                backgroundColor: colors.backgroundTop,
                                borderRadius: 12,
                                marginBottom: 8,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '20%' }}>
                                <View
                                    style={{
                                        width: 24,
                                        height: 24,
                                        backgroundColor: colors.main,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                    }}
                                >
                                    <AppText style={{ color: 'white', fontWeight: '800', fontSize: scaleFont(12) }}>{index + 1}</AppText>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', width: '80%', justifyContent: 'space-around' }}>
                                <View style={{ alignItems: 'center', width: '49.9%' }}>
                                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11), fontWeight: '500' }}>Reps</AppText>
                                    <AppText style={{ color: 'white', fontWeight: '700', fontSize: scaleFont(14) }}>{set.reps}</AppText>
                                </View>

                                <View style={{ width: '0.2%', height: 20, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 }} />

                                <View style={{ alignItems: 'center', width: '49.9%' }}>
                                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(11), fontWeight: '500' }}>Weight</AppText>
                                    <AppText style={{ color: 'white', fontWeight: '700', fontSize: scaleFont(14) }}>{convertWeight(set.weight, 'kg', user.preferences.weightUnit.key)} {user.preferences.weightUnit.field}</AppText>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Totals Section */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 16,
                        padding: 16,
                        backgroundColor: colors.backgroundSecond,
                        borderRadius: 12,
                    }}
                >
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <AppText style={{ color: colors.mutedText, fontWeight: '600', fontSize: scaleFont(12), marginBottom: 4 }}>Sets</AppText>
                        <AppText style={{ color: colors.main, fontWeight: '800', fontSize: scaleFont(16) }}>{totalSets}</AppText>
                    </View>

                    <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <AppText style={{ color: colors.mutedText, fontWeight: '600', fontSize: scaleFont(12), marginBottom: 4 }}>Reps</AppText>
                        <AppText style={{ color: colors.main, fontWeight: '800', fontSize: scaleFont(16) }}>{totalReps}</AppText>
                    </View>

                    <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <AppText style={{ color: colors.mutedText, fontWeight: '600', fontSize: scaleFont(12), marginBottom: 4 }}>Volume</AppText>
                        <AppText style={{ color: colors.main, fontWeight: '800', fontSize: scaleFont(16) }}>{formatVolume(totalVolume)}</AppText>
                    </View>
                </View>

                {/* Add Set Button */}
                <AnimatedButton
                    title="Add Set"
                    onPress={onAddPress}
                    style={{ marginTop: 15, backgroundColor: colors.main, paddingVertical: 15, borderRadius: 20 }}
                />
            </ExpandInOut>
        </View>
    );
};


const styles = StyleSheet.create({
    scrollContent: {
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.cardBackground,
        padding: 20,
        borderRadius: 20,
        marginTop: 15,
        marginHorizontal: 15,
    },
});