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

export default function BarcodeScanner({ onConfirm, onCancel }) {
    
}
