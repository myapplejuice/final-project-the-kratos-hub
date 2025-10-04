import React, { useState, useEffect, useRef, useContext } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Animated,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../screen-comps/app-text";
import { Images } from "../../common/settings/assets";
import { CameraContext } from "../../common/contexts/camera-context";
import { useBackHandlerContext } from "../../common/contexts/back-handler-context";
import useCameraPermissionRequest from "../../common/hooks/use-camera-permission-request";
import usePopups from "../../common/hooks/use-popups";

export default function BarcodeScanner({ onScan }) {
    const { setBackHandler } = useBackHandlerContext();
    const { cameraActive, setCameraActive } = useContext(CameraContext);
    const [flash, setFlash] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const cameraRef = useRef(null);
    const insets = useSafeAreaInsets();
    const { createDialog } = usePopups();

    const scanLineAnim = useRef(new Animated.Value(0)).current;

    // Request camera permission
    const { requestCameraAccess } = useCameraPermissionRequest({
        onGranted: () => setHasPermission(true),
        onDenied: () => setHasPermission(false),
    });

    // Animate scan line
    useEffect(() => {
        if (!cameraActive) return;
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [cameraActive]);

    // Handle back button dynamically
    useEffect(() => {
        if (!cameraActive) {
            setBackHandler(() => false);
            return;
        }

        setBackHandler(() => {
            createDialog({
                title: "Cancel Scan",
                text: "Are you sure you want to cancel scanning?",
                onConfirm: () => setCameraActive(false),
                confirmText: "Yes",
            });
            return true;
        });

        return () => setBackHandler(() => false);
    }, [cameraActive]);

    // Request permission on mount
    useEffect(() => {
        requestCameraAccess();
    }, []);

    // Handle barcode scanned
    function handleScan(barcodeData) {
        setCameraActive(false);
        onScan?.(barcodeData);
    }

    // Toggle flash
    function toggleFlash() {
        setFlash((f) => !f);
    }

    if (!cameraActive || !hasPermission) return null;

    const scanLineTranslate = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 240], // frame height
    });

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                ref={cameraRef}
                facing="back"
                enableTorch={flash}
                onBarcodeScanned={handleScan}
            >
                {/* Flash Button */}
                <View style={[styles.controlsContainer, { top: insets.top + 20 }]}>
                    <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                        <Image
                            style={[styles.controlIcon, flash && styles.flashActive]}
                            source={flash ? Images.flashOn : Images.flashOff}
                        />
                    </TouchableOpacity>
                </View>

                {/* Instruction */}
                <View style={[styles.instructionContainer, { bottom: insets.bottom + 20 }]}>
                    <AppText style={styles.instructionText}>
                        Align the QR code into the frame
                    </AppText>
                </View>

                {/* Center Frame */}
                <View style={styles.frameContainer}>
                    <View style={styles.frame} >
                        <Animated.View
                            style={[
                                styles.scanLine,
                                { transform: [{ translateY: scanLineTranslate }] },
                            ]}
                        />
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
        backgroundColor: "#000",
    },
    camera: {
        flex: 1,
    },
    controlsContainer: {
        position: "absolute",
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
    },
    controlIcon: {
        width: 24,
        height: 24,
        tintColor: "white",
    },
    flashActive: {
        tintColor: "#FFD700",
    },
    instructionContainer: {
        position: "absolute",
        width: "100%",
        alignItems: "center",
    },
    instructionText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        textShadowColor: "rgba(0,0,0,0.8)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,
    },
    frameContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    frame: {
        width: '60%',
        height: 250,
        borderWidth: 3,
        borderColor: "#ffffffff",
        borderRadius: 12,
    },
    scanLine: {
        height: 2,
        backgroundColor: "#ffffffff",
        borderRadius: 1,
    },
});
