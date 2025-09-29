import { useState, useContext, useEffect } from "react";
import { BackHandler } from "react-native";
import useCameraPermissionRequest from "../../common/hooks/use-camera-permission-request";
import useMediaLibraryPermissionRequest from "../../common/hooks/use-media-library-permission-request";
import usePopups from "../../common/hooks/use-popups";
import CameraCapture from './camera-capture';
import ImagePreview from './camera-image-preview';
import { LibraryContext } from "../../common/contexts/library-context";
import * as ImagePicker from 'expo-image-picker';
import { useBackHandlerContext } from "../../common/contexts/back-handler-context";
import { CameraContext } from "../../common/contexts/camera-context";

export default function ImageCapture({ onConfirm, onCancel }) {
    const { setBackHandler } = useBackHandlerContext();
    const { cameraActive, setCameraActive, cameraPreviewActive, setCameraPreviewActive } = useContext(CameraContext);
    const { libraryActive, setLibraryActive } = useContext(LibraryContext);
    const { showSpinner, hideSpinner } = usePopups();
    const [previewImage, setPreviewImage] = useState(null);

    const { requestCameraAccess } = useCameraPermissionRequest({
        onGranted: () => {
            setCameraActive(true);
            adjustBackHandler(1);
        },
        onResetBackHandler: () => adjustBackHandler(0),
    });

    const { requestMediaAccess } = useMediaLibraryPermissionRequest({
        onGranted: async () => await onLibraryConfirm(),
        onResetBackHandler: () => adjustBackHandler(0),
    });

    function onCapturePhoto(photo) {
        setPreviewImage(photo);
        setCameraPreviewActive(true);
        adjustBackHandler(1);
    }

    function onCancelPhoto() {
        setCameraActive(false);
        setCameraPreviewActive(false);
        adjustBackHandler(0);
        onCancel?.();
    }

    async function onCameraConfirm() {
        setCameraPreviewActive(false);
        setCameraActive(false);
        adjustBackHandler(0);
        if (previewImage) {
            showSpinner();
            await onConfirm(previewImage);
            hideSpinner();
        }
    }

    async function onLibraryConfirm() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const pickedImage = result.assets[0];
                await onConfirm(pickedImage);
            }
        } catch (e) {
            console.log("Error picking image:", e);
        } finally {
            setLibraryActive(false);
        }
    }

    // --- Centralized back handler ---
    function adjustBackHandler(protocol) {
        if (protocol === 0) {
            setBackHandler(() => false); // default behavior
        } else if (protocol === 1) {
            setBackHandler(() => {
                if (cameraPreviewActive) onCancelPhoto();
                else if (cameraActive) {
                    setCameraActive(false);
                    adjustBackHandler(0);
                }
                return true;
            });
        }
    }

    // --- Back button listener for hardware ---
    useEffect(() => {
        const backAction = () => {
            if (cameraPreviewActive || cameraActive) {
                onCancelPhoto();
                return true;
            }
            return false;
        };
        const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => subscription.remove();
    }, [cameraActive, cameraPreviewActive]);

    // --- External triggers ---
    useEffect(() => {
        if (cameraActive) requestCameraAccess();
        if (libraryActive) requestMediaAccess();
    }, [cameraActive, libraryActive]);

    return (
        <>
            {cameraActive && <CameraCapture onCapture={onCapturePhoto} />}
            {cameraPreviewActive && (
                <ImagePreview
                    imageUri={previewImage}
                    onConfirm={onCameraConfirm}
                    onCancel={onCancelPhoto}
                />
            )}
        </>
    );
}
