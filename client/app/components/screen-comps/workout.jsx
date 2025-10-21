import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AppText from '../../components/screen-comps/app-text';
import ExpandInOut from '../../components/effects/expand-in-out';
import AnimatedButton from '../../components/screen-comps/animated-button';
import { colors, nutritionColors } from '../../common/settings/styling';
import { Images } from '../../common/settings/assets';
import { scaleFont } from '../../common/utils/scale-fonts';
import Invert from '../../components/effects/invert';

export default function Workout({
    workout,
    expanded = false,
    onExpandPress = () => { },
    onEditPress = () => { },
    onDeletePress = () => { },
    onWorkoutPress = () => { },
}) {
    return (
        <View style={styles.card}>
            <TouchableOpacity
                onPress={onExpandPress}
                style={[styles.header, { backgroundColor: colors.main }]}
            >
                <View style={styles.headerContent}>
                    <View>
                        <AppText style={styles.label}>{workout.label || 'Unnamed Workout'}</AppText>
                        <AppText style={styles.subLabel}>
                            {new Date(workout.date).toLocaleDateString() || 'Unknown Date'}
                        </AppText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{marginEnd: 10, backgroundColor: colors.backgroundSecond + '50', padding: 5, borderRadius: 5}}>
                            <Image source={Images.edit} style={{ width: 20, height: 20, tintColor: 'white' }} />
                        </View>
                        <View style={{marginEnd: 10, backgroundColor: colors.backgroundSecond + '50', padding: 5, borderRadius: 5}}>
                            <Image source={Images.trash} style={{ width: 20, height: 20, tintColor: colors.negativeRed }} />
                        </View>
                        <Invert inverted={expanded} axis="horizontal">
                            <Image
                                source={Images.arrow}
                                style={{ width: 20, height: 20, tintColor: 'white', transform: [{ rotate: '90deg' }] }}
                            />
                        </Invert>
                    </View>
                </View>
            </TouchableOpacity>

            <ExpandInOut visible={expanded}>
                <View style={styles.body}>
                    {/* Info Section */}
                    <View style={styles.infoContainer}>
                        <View style={styles.infoBox}>
                            <AppText style={styles.infoLabel}>Intensity</AppText>
                            <AppText style={styles.infoValue}>{workout.intensity || 'N/A'}</AppText>
                        </View>

                        <View style={styles.infoBox}>
                            <AppText style={styles.infoLabel}>Duration</AppText>
                            <AppText style={styles.infoValue}>{workout.duration || 'N/A'}</AppText>
                        </View>
                    </View>

                    {workout.description ? (
                        <>
                            <AppText style={styles.sectionLabel}>DESCRIPTION</AppText>
                            <View style={styles.descriptionBox}>
                                <AppText style={styles.descriptionText}>
                                    {workout.description}
                                </AppText>
                            </View>
                        </>
                    ) : null}

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <AppText style={styles.statLabel}>Exercises</AppText>
                            <AppText style={styles.statValue}>0</AppText>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.stat}>
                            <AppText style={styles.statLabel}>Sets</AppText>
                            <AppText style={styles.statValue}>0</AppText>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.stat}>
                            <AppText style={styles.statLabel}>Volume</AppText>
                            <AppText style={styles.statValue}>0</AppText>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <AnimatedButton
                            title="View Details"
                            onPress={onWorkoutPress}
                            style={[styles.actionButton, { backgroundColor: colors.main }]}
                        />
                    </View>
                </View>
            </ExpandInOut>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: scaleFont(18),
        fontWeight: '800',
        color: '#FFFFFF',
    },
    subLabel: {
        fontSize: scaleFont(12),
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        marginTop: 2,
    },
    body: {
        padding: 20,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    infoBox: {
        width: '48%',
        backgroundColor: colors.backgroundSecond,
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: scaleFont(11),
        color: colors.mutedText,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: scaleFont(14),
        color: '#FFFFFF',
        fontWeight: '700',
        marginTop: 4,
    },
    sectionLabel: {
        fontSize: scaleFont(12),
        fontWeight: '600',
        color: colors.mutedText,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    descriptionBox: {
        backgroundColor: colors.backgroundSecond,
        borderRadius: 10,
        marginBottom: 15,
    },
    descriptionText: {
        color: 'white',
        padding: 15,
        fontSize: scaleFont(13),
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecond,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        color: colors.mutedText,
        fontSize: scaleFont(11),
        marginBottom: 4,
        fontWeight: '600',
    },
    statValue: {
        color: colors.main,
        fontSize: scaleFont(16),
        fontWeight: '800',
    },
    divider: {
        width: 1,
        height: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    actions: {
        gap: 10,
    },
    actionButton: {
        paddingVertical: 14,
        borderRadius: 20,
    },
});
