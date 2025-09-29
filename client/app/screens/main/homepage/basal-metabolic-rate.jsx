import { View, StyleSheet, } from "react-native";
import { useContext } from "react";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { UserContext } from "../../../common/contexts/user-context";
import { colors } from "../../../common/settings/styling";
import AppText from "../../../components/screen-comps/app-text";
import AppScroll from "../../../components/screen-comps/app-scroll";
import { convertEnergy } from "../../../common/utils/unit-converter";

export default function BasalMetabolicRate() {
    const { user } = useContext(UserContext);

    const styles = StyleSheet.create({
        main: {
            flex: 1,
            backgroundColor: colors.background,
        },
        card: {
            backgroundColor: colors.cardBackground,
            padding: 18,
            marginTop: 15,
            borderRadius: 15,
            marginHorizontal: 15,
        },
        bmrValue: {
            fontSize: scaleFont(42),
            color: "#F35B04",
            fontWeight: "800",
            textAlign: "center",
        },
        sectionTitle: {
            fontSize: scaleFont(14),
            color: "white",
            fontWeight: "600"
        },
        bmrExplanation: {
            fontSize: scaleFont(12),
            lineHeight: 20,
            color: "#ccc",
        },
        metricRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
        }
    });

    return (
        <AppScroll extraBottom={100}>
            <View style={styles.card}>
                <AppText style={styles.bmrValue}>
                    {convertEnergy(user.metrics.bmr, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}
                </AppText>
                <AppText style={[styles.sectionTitle, { textAlign: 'center', fontSize: scaleFont(18), marginTop: 10 }]}>Basal Metabolic Rate (BMR)</AppText>
            </View>
            <View style={styles.card}>
                <AppText style={[styles.sectionTitle, { marginBottom: 10 }]}>What is Basal Metabolic Rate?</AppText>
                <AppText style={styles.bmrExplanation}>
                    Your BMR is the number of energy your body burns at rest to maintain
                    vital functions such as:
                </AppText>
                <View style={{ marginTop: 8 }}>
                    <AppText style={styles.bmrExplanation}>• Breathing</AppText>
                    <AppText style={styles.bmrExplanation}>• Circulation</AppText>
                    <AppText style={styles.bmrExplanation}>• Cell repair</AppText>
                    <AppText style={styles.bmrExplanation}>• Basic metabolism</AppText>
                </View>
                <AppText style={[styles.bmrExplanation, { marginTop: 10 }]}>
                    It represents the bare minimum energy your body needs each day to just exist.
                </AppText>
            </View>
            <View style={[styles.card]}>
                <AppText style={[styles.sectionTitle, { marginBottom: 10 }]}>
                    How BMR is Calculated?
                </AppText>
                <AppText style={styles.bmrExplanation}>
                    Basal Metabolic Rate (BMR) can be estimated using formulas based on your
                    weight, height, age, and gender. The most commonly used formulas are:
                </AppText>

                <View style={{ marginTop: 8 }}>
                    {[
                        {
                            title: "Mifflin-St Jeor Formula:", lines: [
                                "Men: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5",
                                "Women: BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161"
                            ]
                        },
                        {
                            title: "Harris-Benedict Formula (older method):", lines: [
                                "Men: BMR = 66.5 + (13.75 × weight) + (5.003 × height) − (6.755 × age)",
                                "Women: BMR = 655.1 + (9.563 × weight) + (1.850 × height) − (4.676 × age)"
                            ]
                        }
                    ].map((formula, index) => (
                        <View key={index} style={{ marginBottom: 10 }}>
                            <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 4 }}>
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
                                <AppText style={[styles.bmrExplanation, { flex: 1, fontWeight: "600" }]}>
                                    {formula.title}
                                </AppText>
                            </View>

                            {formula.lines.map((line, subIndex) => (
                                <AppText
                                    key={subIndex}
                                    style={[styles.bmrExplanation, { marginLeft: 14, marginBottom: 2 }]}
                                >
                                    {line}
                                </AppText>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        </AppScroll>
    );
}
