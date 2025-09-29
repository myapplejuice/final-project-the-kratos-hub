import { View, StyleSheet, } from "react-native";
import { useContext, useState } from "react";
import { scaleFont } from "../../../utils/scale-fonts";
import { UserContext } from "../../../utils/contexts/user-context";
import { colors } from "../../../utils/settings/styling";
import AppText from "../../../components/screen-comps/app-text";
import { bodyFatRanges } from "../../../utils/helper-functions/global-options";
import AppScroll from "../../../components/screen-comps/app-scroll";
import { useEffect } from "react";

export default function BodyFat() {
    const { user } = useContext(UserContext);
    const [tip, setTip] = useState("");
    const [bodyFatCategory, setBodyFatCategory] = useState("");
    const activeRange = bodyFatRanges.find(range => range.title === bodyFatCategory);
    const rangeColor = activeRange ? activeRange.color : "#FFD700";

    useEffect(() => {
        if (!user) return;

        const categoryObj = bodyFatRanges.find(range => {
            if (user.gender === "male") {
                return user.metrics.bodyFat >= range.male.min && user.metrics.bodyFat <= range.male.max;
            } else {
                return user.metrics.bodyFat >= range.female.min && user.metrics.bodyFat <= range.female.max;
            }
        });

        if (categoryObj) {
            setBodyFatCategory(categoryObj.title);

            if (categoryObj.tips && categoryObj.tips.length > 0) {
                const randomTip = categoryObj.tips[Math.floor(Math.random() * categoryObj.tips.length)];
                setTip(randomTip);
            }
        }
    }, [user]);

    return (
        <AppScroll extraBottom={100}>
            <View style={styles.card}>
                <AppText allowFontScaling={false} style={[styles.bodyFatValue, { color: rangeColor }]}>
                    {user.metrics.bodyFat ? `${user.metrics.bodyFat}%` : "-"}
                </AppText>
                <AppText style={styles.bodyFatLabel}>Estimated Body Fat</AppText>
            </View>

            <View style={styles.card}>
                <AppText style={[styles.sectionTitle, { marginBottom: 10 }]}>
                    Body Fat Levels
                </AppText>
                {bodyFatRanges.map((range, i) => {
                    const isActive = range.title === bodyFatCategory;

                    return (
                        <View
                            key={i}
                            style={[
                                styles.classificationRow,
                                i === bodyFatRanges.length - 1 && { marginBottom: 0 },
                                isActive && { backgroundColor: range.color + "33", borderRadius: 8, padding: 6 },
                            ]}
                        >
                            <View style={[styles.classificationDot, { backgroundColor: range.color }]} />
                            <AppText
                                style={[
                                    styles.classificationText,
                                    isActive && { fontWeight: "700", color: range.color },
                                ]}
                            >
                                {range.title} - ({range.description})
                            </AppText>
                            <AppText
                                style={[
                                    styles.classificationFactor,
                                    isActive && { fontWeight: "600", color: range.color },
                                ]}
                            >
                                {range.range}
                            </AppText>
                        </View>
                    );
                })}


                <AppText style={[styles.tipText, { color: rangeColor }]}>{tip}</AppText>
            </View>

            <View style={styles.card}>
                <AppText style={[styles.sectionTitle, { marginBottom: 10 }]}>
                    What is Body Fat Percentage?
                </AppText>
                <AppText style={styles.explanation}>
                    Body fat percentage is an estimate of how much of your body is made up
                    of fat. It is a useful metric to understand your overall health and
                    fitness level.
                </AppText>
                <AppText style={[styles.explanation, { marginTop: 10 }]}>
                    Note: Body fat percentage results are approximate and typically have an error
                    margin of about 30%. These numbers should not be taken as a medical diagnosis.
                    Always consult a healthcare professional for a complete assessment of your
                    health.
                </AppText>
            </View>
            <View style={styles.card}>
                <AppText style={[styles.sectionTitle, { marginBottom: 10 }]}>
                    How to Reduce Body Fat?
                </AppText>
                <AppText style={styles.explanation}>
                    Reducing body fat is about steady, healthy habits. Here are some easy tips:
                </AppText>
                <View style={{ marginTop: 8 }}>
                    {[
                        "Eat more whole foods and vegetables, and reduce sugary or processed items.",
                        "Include protein in every meal to support muscle and satiety.",
                        "Stay active with both cardio and strength training exercises.",
                        "Drink enough water and get adequate sleep — both affect fat metabolism.",
                        "Be consistent and patient — safe fat loss is usually 0.5-1% of body weight per week."
                    ].map((tip, index) => (
                        <View
                            key={index}
                            style={{
                                flexDirection: "row",
                                alignItems: "flex-start",
                                marginBottom: 6,
                            }}
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
                            <AppText style={[styles.explanation, { flex: 1 }]}>{tip}</AppText>
                        </View>
                    ))}
                </View>
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
        padding: 18,
        marginTop: 15,
        borderRadius: 15,
        marginHorizontal: 15,
    },
    bodyFatValue: {
        fontSize: scaleFont(42),
        fontWeight: "800",
        textAlign: "center",
    },
    bodyFatLabel: {
        fontSize: scaleFont(18),
        color: "white",
        textAlign: "center",
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: scaleFont(14),
        color: "white",
        fontWeight: "600"
    },
    explanation: {
        fontSize: scaleFont(12),
        lineHeight: 20,
        color: "#ccc",
    }, classificationRow: {
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
        fontSize: scaleFont(8),
        color: "#aaa",
    },

    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    tipText: {
        fontSize: scaleFont(11),
        lineHeight: 20,
        marginTop: 10,
    },
});
