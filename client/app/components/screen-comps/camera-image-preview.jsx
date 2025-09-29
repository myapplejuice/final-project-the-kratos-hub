import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Images } from "../../common/settings/assets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../common/settings/styling";

export default function CameraImagePreview({ imageUri, onConfirm, onCancel }) {
    const insets =useSafeAreaInsets();

    const styles = StyleSheet.create({
    mainWrapper: { ...StyleSheet.absoluteFillObject, paddingBottom: insets.bottom, backgroundColor: colors.cardBackground, zIndex: 9999 },
    image: { flex: 7, width: "100%", height: "100%" },
    imageButtonsContainer: { flex: 1, flexDirection: "row", width: "100%", justifyContent: "space-around", alignItems: "center",  backgroundColor: colors.cardBackground},
    button: { height: 50, width: 50, justifyContent: "center", alignItems: "center", borderRadius: 50 },
    buttonImage: { width: 30, height: 30, borderRadius: 50 }
});

    return (
        <View style={styles.mainWrapper}>
            <Image style={styles.image} source={imageUri} />
            <View style={styles.imageButtonsContainer}>
                <TouchableOpacity style={styles.button} onPress={onCancel}>
                    <Image style={styles.buttonImage} source={Images.xMark} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onConfirm}>
                    <Image style={styles.buttonImage} source={Images.checkMark} />
                </TouchableOpacity>
            </View>
        </View>
    );
}