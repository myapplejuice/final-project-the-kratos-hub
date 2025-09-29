import React from "react";
import { Text } from "react-native";

export default function AppText(props) {
    return <Text allowFontScaling={false} {...props} />;
}