import {
    View,
    StyleSheet,
} from "react-native";
import { scaleFont } from "../../utils/scale-fonts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../screen-comps/app-text";

export default function BuildFooter({ style }) {
    const insets = useSafeAreaInsets();

    const styles = StyleSheet.create({
        footer: {
            position: "relative", // default, can be overridden
            bottom: 0,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: insets.bottom + 20,
        },
        footerText: {
            fontSize: scaleFont(10),
            color: "#888",
            letterSpacing: 1,
        },
    });

    return (
        <View style={[styles.footer, style]}>
            <AppText style={styles.footerText}>
                © {new Date().getFullYear()}, The Kratos Hub
            </AppText>
            <AppText style={styles.footerText}>
                App Build - v.1.0.0
            </AppText>
        </View>
    );
}
