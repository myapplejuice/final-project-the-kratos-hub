import { router } from "expo-router";
import { Image, Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import AnimatedButton from "../../../../components/screen-comps/animated-button";
import AppText from "../../../../components/screen-comps/app-text";
import { Images } from "../../../../utils/assets";
import { scaleFont } from "../../../../utils/scale-fonts";
import { routes } from "../../../../utils/settings/constants";
import { colors } from "../../../../utils/settings/styling";
import AppScroll from "../../../../components/screen-comps/app-scroll";

export default function About() {
    return (
        <AppScroll>
            <View style={styles.card}>
                <AppText style={styles.subtitle}>Our Mission</AppText>
                <AppText style={styles.paragraph}>
                    We created this app to help users track their fitness and health
                    goals with ease. Our mission is to empower you with tools and
                    insights to improve your daily habits and overall wellness.
                </AppText>
            </View>

            <View style={styles.card}>
                <AppText style={styles.subtitle}>What We Do</AppText>
                <AppText style={styles.paragraph}>
                    Our platform provides personalized metrics, recommendations, and
                    progress tracking features. We constantly update our app to make it
                    more intuitive and impactful for every user.
                </AppText>
            </View>

            <View style={styles.card}>
                <AppText style={styles.subtitle}>Contact Us</AppText>
                <AppText style={styles.paragraph}>
                    Have questions, feedback, or ideas? We'd love to hear from you.
                    Please email us at{" "}
                    <AppText
                        style={styles.link}
                        onPress={async () => { await Linking.openURL(`mailto:support@kratoshub.app`) }}
                    >
                        support@kratoshub.app
                    </AppText>
                </AppText>
            </View>

            <View style={styles.card}>
                <AppText style={styles.subtitle}>Developers</AppText>
                <AppText style={styles.paragraph}>
                    App developed by - Ibrahem Abu Shah & Ismael Abu Mokh.{"\n"}
                    © {new Date().getFullYear()} / All rights reserved.
                </AppText>

                <View style={styles.socialRow}>
                    <TouchableOpacity
                        onPress={() =>
                            Linking.openURL("whatsapp://send?phone=+972503207732")
                        }
                    >
                        <Image source={Images.whatsapp} style={[styles.icon, { marginRight: 10 }]} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            Linking.openURL("https://www.instagram.com/ibrahem.abushah")
                        }
                    >
                        <Image source={Images.instagram} style={[styles.icon, { marginRight: 10 }]} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL("tel:+972503207732")}>
                        <Image source={Images.phone} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            <AnimatedButton textStyle={styles.backButtonText} style={styles.backButton} onPress={() => router.back()} title={"Go Back"} />
            <View style={styles.footer}>
                <View style={{ flexDirection: "row", justifyContent: "center" }}>
                    <TouchableOpacity onPress={() => router.push(routes.TERMS_OF_SERVICE)}>
                        <AppText style={styles.footerText}>Terms of Service</AppText>
                    </TouchableOpacity>

                    <AppText style={[styles.footerText, { marginHorizontal: 6 }]}>•</AppText>

                    <TouchableOpacity onPress={() => router.push(routes.PRIVACY_POLICY)}>
                        <AppText style={styles.footerText}>Privacy Policy</AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground || "#222",
        padding: 15,
        borderRadius: 12,
        marginTop: 15,
        marginHorizontal:15,
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
    },
    link: {
        color: colors.main,
        textDecorationLine: "underline",
    },
    backButton: {
        marginTop: 30,
        marginHorizontal: 15,
        backgroundColor: 'rgb(0, 140, 255)',
        height: 50,
        borderRadius: 15
    },
    backButtonText: {
        fontSize: scaleFont(12)
    },
    socialRow: {
        flexDirection: "row",
        marginTop: 15,
        justifyContent: "flex-start",
        alignItems: "center",
    },
    icon: {
        width: 27,
        height: 27,
        resizeMode: "contain",
    },
    // Footer
    footer: {
        flexDirection: 'row',
        position: "absolute",
        bottom: 20,
        width: '100%',
        alignItems: "center",
        alignContent: 'center',
        justifyContent: 'center',
    },
    footerText: {
        fontSize: scaleFont(12),
        color: "#888",
        letterSpacing: 1,
    },
    icon: {
        width: 26,
        height: 26,
        resizeMode: "contain",
    },
    arrow: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    },
});

