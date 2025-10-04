import React, { useState, useEffect, useRef, useContext } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Animated,
    Easing,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { LinearGradient } from 'expo-linear-gradient';
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
    const [scanned, setScanned] = useState(false);
    const cameraRef = useRef(null);
    const insets = useSafeAreaInsets();
    const { createDialog } = usePopups();

    const scanLineAnim = useRef(new Animated.Value(0)).current;
    const successAnim = useRef(new Animated.Value(0)).current;

    const { requestCameraAccess } = useCameraPermissionRequest({
        onGranted: () => setHasPermission(true),
        onDenied: () => setHasPermission(false),
    });

    useEffect(() => {
        requestCameraAccess();
    }, []);

    useEffect(() => {
        if (!cameraActive || scanned) return;

        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineAnim, {
                    toValue: 1,
                    duration: 1400,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLineAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [cameraActive, scanned]);

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
                abortText: "No"
            });
            return true;
        });

        return () => setBackHandler(() => false);
    }, [cameraActive]);


    // Handle barcode scanned
    function handleScan(barcodeData) {
        if (scanned) return;

        setScanned(true);

        // Success animation
        Animated.sequence([
            Animated.timing(successAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(800),
        ]).start(() => {
            setCameraActive(false);
            setScanned(false);
            successAnim.setValue(0);
            scanLineAnim.setValue(0);
            onScan?.(barcodeData);
        });
    }

    if (!cameraActive || !hasPermission) return null;

    const scanLineTranslate = scanLineAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 240],
    });

    const successScale = successAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
    });

    const successOpacity = successAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                ref={cameraRef}
                facing="back"
                enableTorch={flash}
                onBarcodeScanned={scanned ? undefined : handleScan}
                barcodeScannerSettings={{
                    barcodeTypes: [
                        'qr',
                        'pdf417',
                        'ean13',
                        'code128',
                        'ean8',
                        'upc_a',
                        'upc_e',
                        'aztec'
                    ],
                }}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.8)', 'transparent']}
                    style={[styles.topGradient, { paddingTop: insets.top + 20 }]}
                >
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setCameraActive(false)}
                        >
                            <Image style={styles.backIcon} source={Images.backArrow} />
                        </TouchableOpacity>

                        <View style={styles.titleContainer}>
                            <AppText style={styles.title}>Scan Barcode</AppText>
                            <AppText style={styles.subtitle}>
                                {scanned ? 'Scan successful!' : 'Align code within frame'}
                            </AppText>
                        </View>

                        <TouchableOpacity
                            style={[styles.controlButton, flash && styles.flashButtonActive]}
                            onPress={() => setFlash((f) => !f)}>
                            <Image
                                style={[styles.controlIcon, flash && styles.flashIconActive]}
                                source={flash ? Images.flashOn : Images.flashOff}
                            />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={styles.frameContainer}>
                    <Animated.View
                        style={[
                            styles.frame,
                            {
                                borderColor: scanned ? '#4CD964' : 'rgba(255,255,255,0.8)',
                            }
                        ]}
                    >
                        {!scanned && (
                            <Animated.View
                                style={[
                                    styles.scanLine,
                                    {
                                        transform: [{ translateY: scanLineTranslate }],
                                        opacity: scanLineAnim.interpolate({
                                            inputRange: [0, 0.5, 1],
                                            outputRange: [0.8, 1, 0.8],
                                        })
                                    },
                                ]}
                            />
                        )}

                        <Animated.View
                            style={[
                                styles.successOverlay,
                                {
                                    opacity: successOpacity,
                                    transform: [{ scale: successScale }],
                                }
                            ]}
                        >
                            <View style={styles.successIcon}>
                                <Image
                                    style={styles.successCheck}
                                    source={Images.checkMark}
                                />
                            </View>
                            <AppText style={styles.successText}>Scanned!</AppText>
                        </Animated.View>
                    </Animated.View>
                </View>

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={[styles.bottomGradient, { paddingBottom: insets.bottom + 30 }]}
                >
                    <View style={styles.instructionContainer}>
                        <AppText style={styles.instructionText}>
                            {scanned
                                ? 'Processing your scan...'
                                : 'Align the barcode inside the frame to scan automatically'
                            }
                        </AppText>
                    </View>
                </LinearGradient>
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
        justifyContent: 'space-between',
    },
    topGradient: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        width: 9,
        height: 20,
        tintColor: 'white',
    },
    titleContainer: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 20,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flashButtonActive: {
        backgroundColor: 'rgba(255,215,0,0.3)',
    },
    controlIcon: {
        width: 20,
        height: 20,
        tintColor: 'white',
    },
    flashIconActive: {
        tintColor: '#FFD700',
    },
    frameContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    frame: {
        width: '70%',
        height: 250,
        borderWidth: 2,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: '#4CD964',
    },
    scanLine: {
        height: 3,
        backgroundColor: "#4CD964",
        width: '100%',
        shadowColor: '#4CD964',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 8,
    },
    successOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(76, 217, 100, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CD964',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    successCheck: {
        width: 30,
        height: 30,
        tintColor: 'white',
    },
    successText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomGradient: {
        paddingTop: 40,
    },
    instructionContainer: {
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    instructionText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 6,
    },
    torchContainer: {
        alignItems: 'center',
    },
    torchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    torchButtonActive: {
        backgroundColor: 'rgba(255,215,0,0.3)',
    },
    torchIcon: {
        width: 18,
        height: 18,
        tintColor: 'white',
        marginRight: 8,
    },
    torchIconActive: {
        tintColor: '#FFD700',
    },
    torchText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});