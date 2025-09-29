import { useCallback, useContext } from "react";
import { Camera } from "expo-camera";
import { Platform, Linking } from "react-native";
import usePopups from "./use-popups";
import { CameraContext } from "../contexts/camera-context";

export default function useCameraPermissionRequest(handlers = {}) {
  const { createDialog, createToast } = usePopups();
  const { setCameraActive } = useContext(CameraContext);

  const defaults = {
    onPermanentlyDenied: () => {
      createDialog({
        title: "Camera Access",
        text: "You denied access to camera permissions that are required to proceed!\n\nPlease enable them in your device settings.",
        onConfirm: () => {
          if (Platform.OS === "ios") {
            Linking.openURL("app-settings:");
          } else {
            Linking.openSettings();
          }
          onResetBackHandler?.();
        },
        onAbort: () => {
          createToast({
            message: "Camera permissions are required to take a photo!",
          });
          onResetBackHandler?.();
        },
      });
    },
    onDenied: () => {
      createToast({
        message: "Camera permissions are required to take a photo!",
      });
    },
    onGranted: () => {
      setCameraActive(true);
    },
  };

  const {
    onPermanentlyDenied = defaults.onPermanentlyDenied,
    onDenied = defaults.onDenied,
    onGranted = defaults.onGranted,
    onResetBackHandler, // ✅ Optional function
  } = handlers;

  const requestCameraAccess = useCallback(async () => {
    const current = await Camera.getCameraPermissionsAsync();

    if (current.granted) {
      onGranted?.();
      return true;
    }

    if (!current.canAskAgain) {
      onPermanentlyDenied?.();
      return false;
    }

    const requested = await Camera.requestCameraPermissionsAsync();

    if (requested.granted) {
      onGranted?.();
      return true;
    }

    onDenied?.();
    return false;
  }, [onGranted, onDenied, onPermanentlyDenied, onResetBackHandler]);

  return { requestCameraAccess };
}
