import { View, StyleSheet } from "react-native";
import { useContext, useEffect, useState } from "react";
import { scaleFont } from "../../../utils/scale-fonts";
import { UserContext } from "../../../utils/contexts/user-context";
import { colors } from "../../../utils/settings/styling";
import { activityOptions } from "../../../utils/helper-functions/global-options";
import AppText from "../../../components/screen-comps/app-text";
import { convertEnergy } from "../../../utils/helper-functions/unit-converter";
import AppScroll from "../../../components/screen-comps/app-scroll";

export default function TotalDailyEnergyExpenditure() {
    const { user } = useContext(UserContext);
    const [activity, setActivity] = useState('');
    const [tip, setTip] = useState("");

    useEffect(() => {
        const activity = activityOptions.find(opt => opt.key === user.metrics.activityLevel) || activityOptions[0];
        setActivity(activity);

        if (activity.tips && activity.tips.length > 0) {
            const randomTip = activity.tips[Math.floor(Math.random() * activity.tips.length)];
            setTip(randomTip);
        }
    }, [user]);

    return (
        <AppScroll extraBottom={100}>
            <View style={styles.card}>
                <AppText style={[styles.tdeeValue, { color: activity.color }]}>
                    {convertEnergy(user.metrics.tdee, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                </AppText>
                <AppText style={styles.tdeeLabel}>
                    Total Daily Energy Expenditure
                </AppText>
            </View>

            <View style={styles.card}>
                <AppText style={styles.sectionTitle}>Activity Levels</AppText>
                {activityOptions.map((item, i) => {
                    const isActive = item.key === user.metrics.activityLevel;
                    return (
                        <View
                            key={i}
                            style={[
                                styles.classificationRow,
                                i === activityOptions.length - 1 && { marginBottom: 0 },
                                isActive && { backgroundColor: item.color + "33", borderRadius: 8, padding: 6 },
                            ]}
                        >
                            <View style={[styles.classificationDot, { backgroundColor: item.color }]} />
                            <AppText

                                style={[
                                    styles.classificationText,
                                    isActive && { fontWeight: "700", color: item.color },
                                ]}
                            >
                                {item.label} - ({item.description})
                            </AppText>
                            <AppText

                                style={[
                                    styles.classificationFactor,
                                    isActive && { fontWeight: "600", color: item.color },
                                ]}
                            >
                                × {item.factor}
                            </AppText>
                        </View>
                    );
                })}
                {tip && (
                    <AppText style={[styles.tdeeExplanation, { color: activity.color, marginTop: 10 }]}>
                        {tip}
                    </AppText>
                )}
            </View>

            <View style={styles.card}>
                <AppText style={styles.sectionTitle}>What is TDEE?</AppText>
                <AppText style={styles.tdeeExplanation}>
                    Total Daily Energy Expenditure (TDEE) is the total number of energy you burn each day.
                    It combines your Basal Metabolic Rate (BMR) with your activity level. {"\n\n"}
                    Understanding your TDEE helps guide nutrition and fitness goals. Highly active individuals will have a higher TDEE, while sedentary people require fewer energy.
                </AppText>
            </View>
            <View style={styles.card}>
                <AppText style={styles.sectionTitle}>How to Use Your TDEE?</AppText>
                {[
                    "If you want to maintain weight, aim to eat around your TDEE energy daily.",
                    "To lose weight, consume slightly fewer energy than your TDEE (≈ 300 - 500 kcal deficit).",
                    "To gain weight, consume more than your TDEE, focusing on protein and quality energy.",
                    "Consistency matters: track your energy and activity to see real changes over time."
                ].map((tip, index) => (
                    <View key={index} style={{ flexDirection: "row", marginBottom: 6 }}>
                        <View style={{ width: 6, height: 6, backgroundColor: "#F35B04", borderRadius: 3, marginTop: 6, marginRight: 8 }} />
                        <AppText style={[styles.tdeeExplanation, { flex: 1 }]}>{tip}</AppText>
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
    miniDashboard: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dashboardItem: {
        flex: 1,
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#333",
    },
    dashboardLabel: {
        fontSize: scaleFont(11),
        color: "#aaa",
    },
    dashboardValue: {
        fontSize: scaleFont(18),
        color: "white",
        fontWeight: "700",
        marginTop: 4,
    },
    tdeeValue: {
        fontSize: scaleFont(42),
        fontWeight: "800",
        textAlign: "center",
    },
    tdeeLabel: {
        fontSize: scaleFont(18),
        color: "white",
        textAlign: "center",
        fontWeight: "600",
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: scaleFont(14),
        color: "white",
        fontWeight: "600",
        marginBottom: 10,
    },
    tdeeExplanation: {
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
    classificationFactor: {
        fontSize: scaleFont(10),
        color: "#aaa",
    },
});