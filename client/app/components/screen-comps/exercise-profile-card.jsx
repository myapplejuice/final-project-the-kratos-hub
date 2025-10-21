import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, muscleGroupColors, nutritionColors } from '../../common/settings/styling';
import { Images } from '../../common/settings/assets';
import { scaleFont } from '../../common/utils/scale-fonts';
import { UserContext } from '../../common/contexts/user-context';
import { convertEnergy } from '../../common/utils/unit-converter';
import AppText from './app-text';
import AnimatedButton from './animated-button';
import ExpandInOut from '../effects/expand-in-out';
import Invert from '../effects/invert';

export default function ExerciseProfileCard({ exercise, onExpandPress = () => { }, onAddPress = () => { }, expanded = false, addButtonVisible = true }) {
    const { user } = useContext(UserContext);

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const primaryColor = muscleGroupColors[exercise.muscleGroups[0]] || nutritionColors.energy1;

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={onExpandPress} style={[styles.cardHeader, { backgroundColor: primaryColor }]}>
                <View style={styles.headerContent}>
                    <View>
                        <AppText style={styles.label}>{exercise.label}</AppText>
                        <AppText style={styles.detailValue}>{exercise.level}</AppText>
                    </View>
                    <Invert inverted={expanded} axis='horizontal' style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={Images.arrow} style={{ transform: [{ rotate: '90deg' }], tintColor: 'white', width: 20, height: 20 }} />
                    </Invert>
                </View>
            </TouchableOpacity>

            <ExpandInOut visible={expanded}>
                <View style={[styles.cardBody]}>
                    <View style={[styles.muscleSection, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                        <View style={{ width: '70%' }}>
                            <AppText style={styles.sectionLabel}>Target Muscles</AppText>
                            <View style={styles.musclePills}>
                                {exercise.muscleGroups.map((muscle, index) => (
                                    <View
                                        key={muscle}
                                        style={[
                                            styles.musclePill,
                                            {
                                                backgroundColor: index === 0
                                                    ? muscleGroupColors[muscle]
                                                    : `${muscleGroupColors[muscle]}20`,
                                                borderColor: muscleGroupColors[muscle]
                                            }
                                        ]}
                                    >
                                        <AppText style={[
                                            styles.musclePillText,
                                            { color: index === 0 ? '#FFFFFF' : muscleGroupColors[muscle] }
                                        ]}>
                                            {capitalizeFirstLetter(muscle)}
                                        </AppText>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={styles.energyBadge}>
                            <Image source={Images.kcalBurn} style={styles.energyBadgeIcon} />
                            <AppText style={styles.energyUnitSmall}>
                                <AppText style={styles.energyBadgeText}>
                                    {convertEnergy(exercise.kCalBurned, 'kcal', user.preferences.energyUnit.key)}
                                </AppText>
                                {' ' + user.preferences.energyUnit.field}
                            </AppText>
                        </View>
                    </View>

                    <AppText style={styles.sectionLabel}>INSTRUCTIONS</AppText>
                    <View style={{ backgroundColor: colors.backgroundSecond, borderRadius: 10, marginBottom: 15 }}>
                        <AppText style={{ color: 'white', padding: 15 }}>{exercise.instructions}</AppText>
                    </View>

                    <View style={styles.detailsGrid}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <View style={styles.detailItem}>
                                <AppText style={styles.detailLabel}>Type</AppText>
                                <AppText style={styles.detailValue}>{exercise.type}</AppText>
                            </View>
                            <View style={styles.detailItem}>
                                <AppText style={styles.detailLabel}>Load</AppText>
                                <AppText style={styles.detailValue}>{exercise.isBodyweight ? 'Bodyweight' : 'Non-Bodyweight'}</AppText>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 15 }}>
                            <View style={styles.detailItem}>
                                <AppText style={styles.detailLabel}>Equipment</AppText>
                                <AppText style={styles.detailValue} numberOfLines={1}>{exercise.equipment}</AppText>
                            </View>
                            <View style={styles.detailItem}>
                                <AppText style={styles.detailLabel}>Mechanic</AppText>
                                <AppText style={styles.detailValue}>{exercise.mechanic}</AppText>
                            </View>
                        </View>
                    </View>

                    {addButtonVisible &&
                        <AnimatedButton
                            title={"Add Exercise"}
                            onPress={onAddPress}
                            textStyle={{ fontSize: scaleFont(14), fontWeight: 'bold' }}
                            leftImage={Images.plus}
                            leftImageStyle={{ tintColor: 'white', marginEnd: 5 }}
                            style={{ backgroundColor: colors.accentGreen, padding: 13, borderRadius: 15, marginTop: 15 }} />
                    }
                </View>
            </ExpandInOut>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    cardHeader: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: scaleFont(18),
        fontWeight: '800',
        color: '#FFFFFF'
    },
    energyBadge: {
        backgroundColor: colors.backgroundSecond,
        padding: 10,
        borderRadius: 20,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 70,
    },
    energyBadgeIcon: {
        width: 25,
        height: 25,
        marginBottom: 3,
    },
    energyBadgeText: {
        fontSize: scaleFont(14),
        fontWeight: '800',
        color: nutritionColors.energy1,
    },
    energyUnitSmall: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        fontWeight: '600',
    },
    cardBody: {
        padding: 20,
    },
    muscleSection: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: scaleFont(12),
        fontWeight: '600',
        color: colors.mutedText,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    musclePills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    musclePill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 2,
    },
    musclePillText: {
        fontSize: scaleFont(11),
        fontWeight: '700',
    },
    detailsGrid: {
        padding: 15,
        backgroundColor: colors.backgroundSecond,
        borderRadius: 12,
    },
    detailItem: {
        flex: 1,
        alignItems: 'center'
    },
    detailLabel: {
        fontSize: scaleFont(10),
        color: colors.mutedText,
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    detailValue: {
        fontSize: scaleFont(12),
        color: '#FFFFFF',
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statIconText: {
        fontSize: scaleFont(12),
        fontWeight: '800',
    },
    statEnergyIcon: {
        width: 16,
        height: 16,
    },
    statLabel: {
        fontSize: scaleFont(10),
        color: colors.mutedText,
        fontWeight: '600',
        textAlign: 'center',
    },
});