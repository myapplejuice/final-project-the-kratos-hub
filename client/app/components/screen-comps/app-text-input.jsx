import React from "react";
import { TextInput } from "react-native";
import { colors } from "../../common/settings/styling";

export default function AppTextInput(props) {
  return <TextInput  placeholderTextColor={colors.mutedText}  allowFontScaling={false} {...props} />;
}