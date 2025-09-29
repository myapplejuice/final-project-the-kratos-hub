
import {
    View,
    Text,
    StyleSheet,
    Linking,
    TouchableOpacity,
    Image
} from "react-native";
import { scaleFont } from "../../common/utils/scale-fonts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Images } from "../../common/settings/assets";
import AppText from "../screen-comps/app-text";

export default function DevFooter() {
    const insets = useSafeAreaInsets();

    const styles = StyleSheet.create({
        footer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopWidth: 1,
            borderColor: "rgba(161,161,161,0.3)",
            paddingBottom: insets.bottom,
            paddingTop: 15,
            paddingHorizontal: 20,
            marginBottom: 15
        },
        footerLeft: {
            flex: 1
        },
        footerRight: {
            flexDirection: "row",
            alignItems: "center"
        },
        footerText: {
            fontSize: scaleFont(12),
            color: "#888",
            lineHeight: 16,
        },
        icon: {
            width: 26,
            height: 26,
            resizeMode: "contain",
        },
    });

    return (
        <View style={styles.footer}>
            <View style={styles.footerLeft}>
                <AppText style={styles.footerText}>
                    By Ibrahem Abu Shah & Ismael Abu Mokh{"\n"}© {new Date().getFullYear()} / All rights reserved.
                </AppText>
            </View>

            <View style={styles.footerRight}>
                <TouchableOpacity
                    onPress={() =>
                        Linking.openURL("whatsapp://send?phone=+972503207732")
                    }
                >
                    <Image
                        source={Images.whatsapp}
                        style={[styles.icon, { marginRight: 5 }]}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() =>
                        Linking.openURL("https://www.instagram.com/ibrahem.abushah")
                    }
                >
                    <Image
                        source={Images.instagram}
                        style={[styles.icon, { marginRight: 5 }]}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => Linking.openURL("tel:+972503207732")}
                >
                    <Image source={Images.phone} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
