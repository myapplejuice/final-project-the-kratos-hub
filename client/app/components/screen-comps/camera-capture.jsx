import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from 'expo-image-manipulator';
import { Images } from "../../common/settings/assets";

export default function CameraCapture({ onCapture, initialFacing = "back" }) {
  const [camera, setCamera] = useState(null);
  const [facing, setFacing] = useState(initialFacing);
  const [flash, setFlash] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

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
    <CameraView style={styles.camera} facing={facing} enableTorch={flash} ref={ref => setCamera(ref)}>
      <View style={styles.cameraButtonsContainer}>
        <View style={styles.cameraTogglesContainer}>
          <TouchableOpacity style={styles.cameraToggles} onPress={() => setFacing(facing === "back" ? "front" : "back")}>
            <Image style={styles.cameraTogglesImages} source={Images.rotate} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraToggles} onPress={() => setFlash(f => !f)}>
            <Image style={styles.cameraTogglesImages} source={flash ? Images.flashOn : Images.flashOff} />
          </TouchableOpacity>
        </View>
        <View style={styles.cameraSnapContainer}>
          <TouchableOpacity onPress={btnSnap}>
            <Image style={styles.cameraSnap} source={Images.cameraSnap} />
          </TouchableOpacity>
        </View>
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  camera: { ...StyleSheet.absoluteFillObject, zIndex: 9999},
  cameraButtonsContainer: { flex: 1, justifyContent: "space-between", alignItems: "center", width: "100%", height: "100%" },
  cameraTogglesContainer: { flexDirection: "row", width: "100%", justifyContent: "space-between" },
  cameraToggles: { backgroundColor: 'rgba(255, 255, 255,  0.4)', margin: 60, width: 50, height: 50, borderRadius: 50, justifyContent: "center", alignItems: "center" },
  cameraTogglesImages: { width: 40, height: 40 },
  cameraSnapContainer: { backgroundColor: 'rgba(255, 255, 255, 0.4)', justifyContent: "center", alignItems: "center", borderRadius: 50, margin: 70, width: 70, height: 70 },
  cameraSnap: { width: 50, height: 50 },
  cancelButton: { position: "absolute", top: 40, left: 20, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 25, padding: 5 },
  retryButton: { padding: 10, backgroundColor: 'rgba(0,140,255,0.8)', borderRadius: 8, marginBottom: 10 },
});
