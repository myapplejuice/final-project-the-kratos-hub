import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Images } from "../../common/settings/assets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../common/settings/styling";
import AppText from "../screen-comps/app-text";

export default function CameraImagePreview({ imageUri, onConfirm, onCancel }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container]}>
            <Image style={styles.previewImage} source={imageUri} resizeMode="cover" />

            <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 1)']}
                style={[styles.bottomGradient, { paddingBottom: insets.bottom, paddingTop: insets.top + 20 }]}
            >
                <View style={styles.promptContainer}>
                    <View style={styles.promptBubble}>
                        <Image
                            style={styles.promptIcon}
                            source={Images.about}
                        />
                        <View style={styles.promptText}>
                            <AppText style={styles.promptTitle}>Photo Ready?</AppText>
                            <AppText style={styles.promptSubtitle}>Confirm, retake or cancel</AppText>
                        </View>
                    </View>
                </View>
                <View style={styles.controlsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton, styles.cancelButtonWrapper]}
                        onPress={onCancel}
                    >
                        <Image
                            style={[styles.buttonIcon, styles.cancelIcon]}
                            source={Images.xMark}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.confirmButton, styles.confirmButtonWrapper]}
                        onPress={onConfirm}
                    >
                        <Image
                            style={[styles.buttonIcon, styles.confirmIcon]}
                            source={Images.checkMark}
                        />
                    </TouchableOpacity>
                </View>
            </LinearGradient >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background,
        zIndex: 9999,
    },
    previewImage: {
        flex: 1,
        width: "100%",
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    bottomGradient: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between'
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    actionButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    buttonContent: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    buttonShadow: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    cancelButton: {
        // Base styles for cancel button
    },
    confirmButton: {
        // Base styles for confirm button
    },
    confirmButtonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 50,
        borderColor: '#4CD964',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    cancelButtonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 50,
        borderColor: '#FF3B30',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    pulseRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'rgba(76, 217, 100, 0.4)',
        zIndex: 0,
    },
    buttonIcon: {
        width: 28,
        height: 28,
    },
    cancelIcon: {
        tintColor: '#FF3B30',
    },
    confirmIcon: {
        tintColor: '#4CD964',
    },
    promptContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    promptBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    promptIcon: {
        width: 30,
        height: 30,
        tintColor: 'rgba(255,255,255,0.8)',
        marginEnd: 8,
    },
    promptText: {
        flexDirection: 'column',
    },
    promptTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    promptSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
});