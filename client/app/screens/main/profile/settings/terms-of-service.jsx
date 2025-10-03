import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import AnimatedButton from "../../../../components/screen-comps/animated-button";
import AppText from "../../../../components/screen-comps/app-text";
import { scaleFont } from "../../../../common/utils/scale-fonts";
import { colors } from "../../../../common/settings/styling";
import AppScroll from "../../../../components/screen-comps/app-scroll";
import Divider from "../../../../components/screen-comps/divider";

export default function TermsOfService() {
    return (
        <AppScroll>
            <View style={styles.card}>
                <AppText style={styles.subtitle}>1. Acceptance of Terms</AppText>
                <AppText style={styles.paragraph}>
                    By accessing or using The Kratos Hub, you agree to be bound by these
                    Terms of Service. If you do not agree, you may not use our app.
                </AppText>

                <Divider orientation="horizontal" style={{ marginVertical: 15 }} />
                
                <AppText style={styles.subtitle}>2. User Responsibilities</AppText>
                <AppText style={styles.paragraph}>
                    You agree to use The Kratos Hub only for lawful purposes related to
                    fitness, nutrition, and communication with other users. You must not
                    misuse chat features, share harmful content, or provide false
                    information.
                </AppText>

                <Divider orientation="horizontal" style={{ marginVertical: 15 }} />

                <AppText style={styles.subtitle}>3. Health Disclaimer</AppText>
                <AppText style={styles.paragraph}>
                    The Kratos Hub provides tools for tracking workouts and nutrition.
                    It is not a substitute for professional medical advice. Always
                    consult a qualified healthcare provider before starting a new
                    fitness or nutrition plan.
                </AppText>

                <Divider orientation="horizontal" style={{ marginVertical: 15 }} />

                <AppText style={styles.subtitle}>4. Termination</AppText>
                <AppText style={styles.paragraph}>
                    We reserve the right to suspend or terminate accounts that violate
                    these Terms, engage in harassment, or misuse app features.
                </AppText>

                <Divider orientation="horizontal" style={{ marginVertical: 15 }} />

                <AppText style={styles.subtitle}>5. Contact</AppText>
                <AppText style={[styles.paragraph, { marginBottom: 0 }]}>
                    For questions about these Terms, contact us at
                    support@kratoshub.app.
                </AppText>
            </View>

            <AnimatedButton
                textStyle={styles.backButtonText}
                style={styles.backButton}
                onPress={() => router.back()}
                title={"Go Back"}
            />
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground || "#222",
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        margin: 15
    },
    subtitle: {
        fontSize: scaleFont(15),
        fontWeight: "600",
        color: colors.white,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: scaleFont(12),
        color: colors.detailText,
        lineHeight: 18
    },
    backButton: {
        margin: 15,
        backgroundColor: 'rgb(0, 140, 255)',
        height: 50,
        borderRadius: 20
    },
    backButtonText: {
        fontSize: scaleFont(12)
    },
});