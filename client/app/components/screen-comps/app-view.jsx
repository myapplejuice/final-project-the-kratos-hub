import {  View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../utils/settings/styling";

export default function AppView({
    children,
    style,
    extraTop = 45,
    topPadding = true,
    backgroundColor = colors.background,
    ...props
}) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                paddingTop: topPadding ? insets.top + extraTop : 0,
                flexGrow: 1,
                backgroundColor: backgroundColor,
                ...style,
            }}
            {...props}
        >
                {children}
        </View>
    );
}