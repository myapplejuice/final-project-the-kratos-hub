import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import AnimatedButton from "../../../../components/screen-comps/animated-button";
import AppText from "../../../../components/screen-comps/app-text";
import { scaleFont } from "../../../../common/utils/scale-fonts";
import { colors } from "../../../../common/settings/styling";
import AppScroll from "../../../../components/screen-comps/app-scroll";

export default function PrivacyPolicy() {

    return (
        <AppScroll>
            <View style={styles.card}>
                <AppText style={styles.subtitle}>1. Information We Collect</AppText>
                <AppText style={styles.paragraph}>
                    We may collect information such as your name, email, workout logs,
                    nutrition entries, and chat messages with coaches or athletes. We
                    also collect basic device and usage data to improve the app.
                </AppText>

                <AppText style={styles.subtitle}>2. How We Use Information</AppText>
                <AppText style={styles.paragraph}>
                    Your data is used to provide core app functionality, improve
                    recommendations, and enable communication features. We never sell
                    your personal information to third parties.
                </AppText>

                <AppText style={styles.subtitle}>3. Data Sharing</AppText>
                <AppText style={styles.paragraph}>
                    Limited information may be shared with service providers (e.g.,
                    cloud hosting) strictly to support app operations. Your private
                    health and chat data remain confidential.
                </AppText>

                <AppText style={styles.subtitle}>4. Security</AppText>
                <AppText style={styles.paragraph}>
                    We implement reasonable security measures to protect your data.
                    However, no system is 100% secure. Use the app at your own risk and
                    avoid sharing sensitive personal details in public chats.
                </AppText>

                <AppText style={styles.subtitle}>5. Contact</AppText>
                <AppText style={[styles.paragraph, { marginBottom: 0 }]}>
                    If you have questions about our Privacy Policy, please contact us at
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
        padding: 15,
        borderRadius: 12,
        margin: 15,
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
        lineHeight: 18,
        marginBottom: 15
    },
    backButton: {
        margin: 15,
        backgroundColor: 'rgb(0, 140, 255)',
        height: 50,
        borderRadius: 15
    },
    backButtonText: {
        fontSize: scaleFont(12)
    },
});
