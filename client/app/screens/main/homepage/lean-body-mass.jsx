import { View, StyleSheet } from "react-native";
import { useContext, useEffect, useState } from "react";
import { scaleFont } from "../../../utils/scale-fonts";
import { UserContext } from "../../../utils/contexts/user-context";
import { colors } from "../../../utils/settings/styling";
import AppText from "../../../components/screen-comps/app-text";
import { lbmLevels } from "../../../utils/helper-functions/global-options";
import AppScroll from "../../../components/screen-comps/app-scroll";
import { convertWeight } from "../../../utils/helper-functions/unit-converter";

export default function LeanBodyMass() {
    const { user } = useContext(UserContext);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [tip, setTip] = useState("");

    useEffect(() => {
        const foundLevel = lbmLevels.find(level => {
            const lbm = user.metrics.leanBodyMass;
            const gender = user.gender;
            const range = level[gender];

            return lbm >= range.min && lbm < range.max;
        });

        setCurrentLevel(foundLevel);

        if (foundLevel?.tips?.length) {
            const randomTip = foundLevel.tips[Math.floor(Math.random() * foundLevel.tips.length)];
            setTip(randomTip);
        }
    }, [user]);

    return (
        <AppScroll extraBottom={100}>
            <View style={styles.card}>
                <AppText style={[styles.lbmValue, { color: currentLevel?.color || "#4DB6AC" }]}>
                    {convertWeight(user.metrics.leanBodyMass, 'kg', user.preferences.weightUnit.field)} {user.preferences.weightUnit.field}
                </AppText>
                <AppText style={styles.lbmLabel}>{currentLevel?.title || "-"}</AppText>
            </View>

            <View style={styles.card}>
                <AppText style={styles.sectionTitle}>Lean Body Mass Levels</AppText>
                {lbmLevels.map((level, i) => {
                    const isActive = level.key === currentLevel?.key;

                    return (
                        <View
                            key={i}
                            style={[
                                styles.classificationRow,
                                i === lbmLevels.length - 1 && { marginBottom: 0 },
                                isActive && { backgroundColor: level.color + "33", borderRadius: 8, padding: 6 },
                            ]}
                        >
                            <View style={[styles.classificationDot, { backgroundColor: level.color }]} />
                            <AppText style={[styles.classificationText, isActive && { fontWeight: "700", color: level.color }]}>
                                {level.title} - ({level.description})
                            </AppText>
                            <AppText style={[styles.classificationRange, isActive && { fontWeight: "600", color: level.color }]}>
                                {user.preferences.weightUnit.key === 'metric' ? level.rangeKg : level.rangeLb}
                            </AppText>
                        </View>
                    );
                })}

                <AppText style={[styles.lbmExplanation, { marginTop: 10, marginBottom: 0, color: currentLevel?.color || "#4DB6AC" }]}>
                    {tip}
                </AppText>
            </View>

            <View style={styles.card}>
                <AppText style={styles.sectionTitle}>What is Lean Body Mass?</AppText>
                <AppText style={styles.lbmExplanation}>
                    Lean Body Mass (LBM) refers to the weight of all body components except fat.
                    This includes muscles, bones, organs, and water. {"\n\n"}
                    LBM is a crucial metric for understanding body composition,
                    as it influences metabolism, strength, and overall health. {"\n\n"}
                    Tracking LBM can help guide fitness routines and nutrition plans.
                </AppText>
            </View>

            <View style={styles.card}>
                <AppText style={[styles.sectionTitle, { color: 'white' }]}>How to Improve Lean Body Mass?</AppText>
                {[
                    "Engage in regular resistance training or weightlifting.",
                    "Consume sufficient protein to support muscle growth and recovery.",
                    "Ensure proper rest and recovery between workouts.",
                    "Maintain a balanced diet with adequate energy consumption to sustain muscle mass.",
                    "Stay consistent — gradual progress is key to increasing lean mass."
                ].map((tipText, index) => (
                    <View
                        key={index}
                        style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 6 }}
                    >
                        <View
                            style={{
                                width: 6,
                                height: 6,
                                backgroundColor: "#F35B04",
                                borderRadius: 3,
                                marginTop: 6,
                                marginRight: 8,
                            }}
                        />
                        <AppText style={[styles.lbmExplanation, { flex: 1 }]}>{tipText}</AppText>
                    </View>
                ))}
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 15,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 15,
        padding: 18,
        marginTop: 15,
        marginHorizontal: 15,
    },
    lbmValue: {
        fontSize: scaleFont(42),
        fontWeight: "800",
        textAlign: "center",
    },
    lbmLabel: {
        fontSize: scaleFont(18),
        textAlign: "center",
        fontWeight: "600",
        color: 'white'
    },
    sectionTitle: {
        fontSize: scaleFont(14),
        color: "white",
        fontWeight: "600",
        marginBottom: 10,
    },
    lbmExplanation: {
        fontSize: scaleFont(12),
        lineHeight: 20,
        color: "#ccc",
    },
    classificationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    classificationDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 10,
    },
    classificationText: {
        fontSize: scaleFont(10),
        color: "white",
        flex: 1,
    },
    classificationRange: {
        fontSize: scaleFont(8),
        color: "#aaa",
    },
});