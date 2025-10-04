import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // for overlay
import { Images } from "../../common/settings/assets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../common/settings/styling";

export default function CameraImagePreview({ imageUri, onConfirm, onCancel }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.mainWrapper, { paddingBottom: insets.bottom }]}>
            <Image style={styles.image} source={imageUri} resizeMode="cover" />

            <View style={styles.imageButtonsContainer}>
                <TouchableOpacity style={[styles.button, { backgroundColor: "rgba(255,0,0,0.8)" }]} onPress={onCancel}>
                    <Image style={styles.buttonImage} source={Images.xMark} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: "rgba(0,200,0,0.8)" }]} onPress={onConfirm}>
                    <Image style={styles.buttonImage} source={Images.checkMark} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        zIndex: 9999,
    },
    image: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        bottom: 0,
        height: "40%",
    },
    imageButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 15
    },
    button: {
        height: 50,
        width: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 35,
    },
    buttonImage: {
        width: 30,
        height: 30,
        tintColor: "#fff",
    },
});
