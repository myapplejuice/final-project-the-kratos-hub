import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { Images } from "../../common/settings/assets";
import AppText from "../screen-comps/app-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CameraCapture({ onCapture, initialFacing = "back" }) {
    const [camera, setCamera] = useState(null);
    const [facing, setFacing] = useState(initialFacing);
    const [flash, setFlash] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        return () => setCamera(null);
    }, []);

    useEffect(() => {
        if (!permission || !permission.granted)
            requestPermission();
    }, [permission]);

    async function btnSnap() {
        if (!camera) return;
        let photo = await camera.takePictureAsync({ quality: 0.5, skipProcessing: true });

        if (facing === "front") {
            photo = await ImageManipulator.manipulateAsync(
                photo.uri,
                [{ flip: ImageManipulator.FlipType.Horizontal }],
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
            );
        }

        onCapture({ uri: photo.uri });
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} enableTorch={flash} ref={ref => setCamera(ref)}>

                <View style={[styles.bottomGradient, { paddingBottom: insets.bottom + 30 }]}>
                    <View style={styles.controlsContainer}>

                        <View style={styles.leftControls}>
                            <TouchableOpacity
                                style={[styles.controlButton, styles.flipButton]}
                                onPress={() => setFacing(facing === "back" ? "front" : "back")}
                            >
                                <View style={styles.buttonInner}>
                                    <Image style={styles.controlIcon} source={Images.rotate} />
                                </View>
                                <View style={styles.buttonShadow} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.centerControls}>
                            <TouchableOpacity onPress={btnSnap} style={styles.captureButton}>
                                <View style={styles.captureButtonOuter}>
                                    <View style={styles.captureButtonInner}>
                                        <View style={styles.captureButtonCore} />
                                    </View>
                                </View>
                                <View style={styles.captureRing} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.rightControls}>
                            <TouchableOpacity
                                style={[styles.controlButton, styles.flashButton]}
                                onPress={() => setFlash(f => !f)}
                            >
                                <View style={styles.buttonInner}>
                                    <Image
                                        style={[styles.controlIcon, flash && styles.flashActive]}
                                        source={flash ? Images.flashOn : Images.flashOff}
                                    />
                                </View>
                                <View style={styles.buttonShadow} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.instructionContainer}>
                        <AppText style={styles.instructionText}>Tap middle button to capture</AppText>
                    </View>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        zIndex: 1,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 40,
        zIndex: 1,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 30,
    },
    leftControls: {
        alignItems: 'flex-start',
    },
    rightControls: {
        alignItems: 'flex-end',
    },
    centerControls: {
        alignItems: 'center',
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    buttonInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    buttonShadow: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 1,
    },
    controlIcon: {
        width: 24,
        height: 24,
        tintColor: 'white',
    },
    flashActive: {
        tintColor: '#FFD700',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    captureButtonOuter: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonCore: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
    },
    captureRing: {
        position: 'absolute',
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        zIndex: 1,
    },
    instructionContainer: {
        alignItems: 'center',
        paddingHorizontal: 20
    },
    instructionText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,
    },
});
