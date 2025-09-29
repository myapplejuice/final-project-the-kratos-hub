import { createContext } from "react";

export const CameraContext = createContext({
  cameraActive: false,
  cameraPreviewActive: false,
  setCameraActive: () => {},
  setCameraPreviewActive: () => {},
});