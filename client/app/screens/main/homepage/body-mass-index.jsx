import { View, StyleSheet } from "react-native";
import { useContext, useEffect, useState } from "react";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { UserContext } from "../../../common/contexts/user-context";
import { colors } from "../../../common/settings/styling";
import AppText from "../../../components/screen-comps/app-text";
import { bmiClasses } from "../../../common/utils/global-options";
import AppScroll from "../../../components/screen-comps/app-scroll";

export default function BodyMassIndex() {
    const { user } = useContext(UserContext);
    const [bmiClass, setBmiClass] = useState(null);
    const [tip, setTip] = useState("");

    useEffect(() => {
        const bmi = user.metrics.bmi;
        const gender = user.gender;

        const bmiClass = bmiClasses.find(cls => {
            const min = cls[gender]?.min;
            const max = cls[gender]?.max;
            return bmi >= min && bmi <= max;
        });

        setBmiClass(bmiClass);

        if (bmiClass?.tips && bmiClass.tips.length > 0) {
            const randomTip = bmiClass.tips[Math.floor(Math.random() * bmiClass.tips.length)];
            setTip(randomTip);
        }
    }, [user]);

    return (
        <AppScroll extraBottom={100}>
            <View style={styles.card}>
                <AppText style={[styles.bmiValue, { color: bmiClass?.color || "#FFD700" }]}>{user.metrics.bmi.toFixed(1)}</AppText>
                <AppText style={styles.bmiLabel}>{bmiClass?.title || "-"}</AppText>
            </View>

            <View style={styles.card}>
                <AppText style={styles.sectionTitle}>BMI Levels</AppText>
                {bmiClasses.map((cls, i) => {
                    const isActive = cls.key === bmiClass?.key;

                    return (
                        <View
                            key={i}
                            style={[
                                styles.classificationRow,
                                i === bmiClasses.length - 1 && { marginBottom: 0 },
                                isActive && { backgroundColor: cls.color + "33", borderRadius: 8, padding: 6 },
                            ]}
                        >
                            <View style={[styles.classificationDot, { backgroundColor: cls.color }]} />
                            <AppText style={[styles.classificationText, isActive && { fontWeight: "700", color: cls.color }]}>
                                {cls.title} - ({cls.description})
                            </AppText>
                            <AppText style={[styles.classificationRange, isActive && { fontWeight: "600", color: cls.color }]}>
                                {cls.range}
                            </AppText>
                        </View>
                    );
                })}

                <AppText style={[styles.bmiExplanation, { marginTop: 10, marginBottom: 0, color: bmiClass?.color || "#FFD700" }]}>
                    {tip}
                </AppText>
            </View>

            <View style={styles.card}>
                <AppText style={styles.sectionTitle}>What is BMI?</AppText>
                <AppText style={styles.bmiExplanation}>
                    Body Mass Index (BMI) is a standard medical measurement that estimates
                    whether an individual has a healthy body weight relative to their
                    height. {"\n\n"}
                    It is calculated by dividing a person's weight (kg) by their height
                    squared (m²). {"\n\n"}
                    While useful for general population studies, BMI does not consider
                    factors such as muscle mass, lifestyle, or body composition. Athletes
                    and active individuals may have a higher BMI while still being in
                    excellent health.
                </AppText>
            </View>
            <View style={styles.card}>
                <AppText style={styles.sectionTitle}>How to Improve BMI?</AppText>
                {[
                    "Maintain a balanced diet rich in vegetables, fruits, lean proteins, and whole grains.",
                    "Engage in regular physical activity, including both cardio and strength training.",
                    "Monitor portion sizes and avoid excessive caloric intake.",
                    "Stay hydrated and get enough sleep — both affect metabolism and weight regulation.",
                    "Be consistent and patient — gradual weight change is healthier than rapid shifts."
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
                        <AppText style={[styles.bmiExplanation, { flex: 1 }]}>{tipText}</AppText>
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
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        marginHorizontal: 15,
    },
    bmiValue: {
        fontSize: scaleFont(42),
        fontWeight: "800",
        textAlign: "center",
    },
    bmiLabel: {
        fontSize: scaleFont(18),
        color: "white",
        textAlign: "center",
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: scaleFont(14),
        color: "white",
        fontWeight: "600",
        marginBottom: 10,
    },
    bmiExplanation: {
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