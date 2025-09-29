
import { kgToLb, cmToInches, kcalToKj, formatTime } from './unit-converter';
import { activityOptions, dietOptions, goalOptions } from './global-options';
import { router } from 'expo-router';

export function logUserState(label, userObj) {
  if (!userObj) return;
  var clone = { ...userObj };
  delete clone.image;
  console.log(label + ":", clone);
}

export function logUserInfo(user) {
  if (!user) return;

  console.group("=== USER INFO ===");

  // --- Preferences ---
  console.group("Preferences");
  if (user.preferences) {
    for (const [key, value] of Object.entries(user.preferences)) {
      console.log(`${key}:`, value);
    }
  }
  console.groupEnd();

  // --- Metrics ---
  console.group("\nMetrics");
  if (user.metrics) {
    for (const [key, value] of Object.entries(user.metrics)) {
      console.log(`${key}:`, value);
    }
  }
  console.groupEnd();

  // --- Nutrition ---
  console.group("\nNutrition");
  if (user.nutrition) {
    for (const [key, value] of Object.entries(user.nutrition)) {
      console.log(`${key}:`, value);
    }
  }
  console.groupEnd();

  console.groupEnd();
}

export function logUserObjects(user) {
  console("Preferences\n",
    user.preferences,
    "Metrics\n"
    , user.metrics
    , "\n\n"
    , "Nutrition\n"
    , user.nutrition);
}

export function adjustColor(color, percent, mode = "darken") {
  percent = Math.min(100, Math.max(0, percent));
  const factor = mode === "lighten"
    ? 1 + percent / 100
    : 1 - percent / 100;

  let r, g, b, a = 1, isHex = false;

  if (color.startsWith("#")) {
    isHex = true;
    const hex = color.replace("#", "");
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else if (color.startsWith("rgb")) {
    const parts = color.match(/[\d.]+/g).map(Number);
    [r, g, b] = parts;
    if (parts.length === 4) a = parts[3]; // rgba
  } else {
    throw new Error("Unsupported color format: " + color);
  }

  // Apply adjustment
  r = Math.max(0, Math.min(255, Math.round(r * factor)));
  g = Math.max(0, Math.min(255, Math.round(g * factor)));
  b = Math.max(0, Math.min(255, Math.round(b * factor)));

  if (isHex) {
    const toHex = v => v.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } else {
    return a === 1
      ? `rgb(${r}, ${g}, ${b})`
      : `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}