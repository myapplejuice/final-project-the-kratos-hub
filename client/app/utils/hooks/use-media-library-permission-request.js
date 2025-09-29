import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Platform, Linking } from "react-native";
import * as Device from "expo-device";
import usePopups from "./use-popups";

export default function useMediaLibraryPermissionRequest(handlers = {}) {
  const { createDialog, createToast, createAlert } = usePopups();

  const defaults = {
    onPermanentlyDenied: () => {
      createDialog({
        title: "Media Access",
        text: "You denied access to media permissions that are required to proceed!\n\nPlease enable them in your device settings.",
        onConfirm: () => {
          if (Platform.OS === "ios") {
            Linking.openURL("app-settings:");
          } else {
            Linking.openSettings();
          }
          onResetBackHandler?.();
        },
        onAbort: () => {
          createToast({ message: "Media permissions are required to upload a photo!" });
          onResetBackHandler?.();
        },
      });
    },
    onDenied: () => {
      createAlert({ title: "Upload Image", text: "Media permissions are required to upload a photo!" });
    },
    onGranted: () => { }, 
  };

  const {
    onPermanentlyDenied = defaults.onPermanentlyDenied,
    onDenied = defaults.onDenied,
    onGranted = defaults.onGranted,
    onResetBackHandler,
  } = handlers;

  const requestMediaAccess = useCallback(async () => {
    const osVersion = parseInt(Device.osVersion || "0");
    const isAndroid13Plus =
      Platform.OS === "android" && Device.osName === "Android" && osVersion >= 13;

    if (isAndroid13Plus) {
      onGranted?.();
      return true;
    }

    const current = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (current.granted) {
      onGranted?.();
      return true;
    }

    if (!current.canAskAgain) {
      onPermanentlyDenied?.();
      return false;
    }

    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (requested.granted) {
      onGranted?.();
      return true;
    }

    onDenied?.();
    return false;
  }, [onGranted, onDenied, onPermanentlyDenied, onResetBackHandler]);

  return { requestMediaAccess };
}
