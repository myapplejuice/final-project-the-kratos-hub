import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { scaleFont } from '../../../../common/utils/scale-fonts';
import { UserContext } from '../../../../common/contexts/user-context';
import { colors } from '../../../../common/settings/styling';
import DeviceStorageService from '../../../../common/services/device-storage-service';
import AppText from '../../../../components/screen-comps/app-text';
import { dateFormats, energyUnits, fluidUnits, heightUnits, timeFormats, weightUnits } from '../../../../common/utils/global-options';
import Divider from '../../../../components/screen-comps/divider';
import AppScroll from '../../../../components/screen-comps/app-scroll';

export default function UnitsChange() {
    const { user, setUser } = useContext(UserContext);

    function renderOption(label, key, option, isLast = false) {
        return (
            <View key={label}>
                <TouchableOpacity
                    style={[styles.optionRow]}
                    onPress={async () => {
                        const userPreferences = { ...user.preferences, [key]: option };
                        setUser({ ...user, preferences: userPreferences });

                        await DeviceStorageService.setUserPreferences(userPreferences);
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.radioOuter}>
                            {user.preferences[key]?.key === option.key && <View style={styles.radioInner} />}
                        </View>
                        <AppText style={styles.label}>{label}</AppText>
                    </View>
                </TouchableOpacity>
                {!isLast && <Divider orientation='horizontal' />}
            </View>
        )
    };

    return (
        <AppScroll extraBottom={100}>
            {/* Weight */}
            <View style={[styles.card, { marginTop: 15, marginHorizontal: 15 }]}>
                <AppText style={[styles.label, { color: 'white', marginStart: 0 }]}>Weight</AppText>
                {weightUnits.map((unit, i) => renderOption(unit.label, 'weightUnit', unit, i === weightUnits.length - 1))}
            </View>

            {/* Height */}
            <View style={[styles.card, { marginTop: 15, marginHorizontal: 15 }]}>
                <AppText style={[styles.label, { color: 'white', marginStart: 0 }]}>Height</AppText>
                {heightUnits.map((unit, i) => renderOption(unit.label, 'heightUnit', unit, i === heightUnits.length - 1))}
            </View>

            {/* Energy */}
            <View style={[styles.card, { marginTop: 15, marginHorizontal: 15 }]}>
                <AppText style={[styles.label, { color: 'white', marginStart: 0 }]}>Energy Unit</AppText>
                {energyUnits.map((unit, i) => renderOption(unit.label, 'energyUnit', unit, i === energyUnits.length - 1))}
            </View>

            {/* Water */}
            <View style={[styles.card, { marginTop: 15, marginHorizontal: 15 }]}>
                <AppText style={[styles.label, { color: 'white', marginStart: 0 }]}>Water</AppText>
                {fluidUnits.map((unit, i) => renderOption(unit.label, 'fluidUnit', unit, i === fluidUnits.length - 1))}
            </View>

            {/* Date Format */}
            <View style={[styles.card, { marginTop: 15, marginHorizontal: 15 }]}>
                <AppText style={[styles.label, { color: 'white', marginStart: 0 }]}>Date Format</AppText>
                {dateFormats.map((df, i) => renderOption(df.label, 'dateFormat', df, i === dateFormats.length - 1))}
            </View>

            {/* Time Format */}
            <View style={[styles.card, { marginTop: 15, marginHorizontal: 15 }]}>
                <AppText style={[styles.label, { color: 'white', marginStart: 0 }]}>Time Format</AppText>
                {timeFormats.map((tf, i) => renderOption(tf.label, 'timeFormat', tf, i === timeFormats.length - 1))}
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingTop: 14,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    label: { fontSize: scaleFont(12), color: colors.mutedText, fontWeight: '600', marginStart: 15 },
    modeIcon: { width: 30, height: 30 },
    radioOuter: {
        width: 17,
        height: 17,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.main,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 9,
        height: 9,
        borderRadius: 6,
        backgroundColor: colors.main,
    },

});
