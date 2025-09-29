import {
    View,
} from "react-native";
import { useEffect, useContext, useState, useRef } from "react";
import { useBackHandlerContext } from "../../utils/contexts/back-handler-context";
import { usePathname, router } from "expo-router";
import { routes, } from "../../utils/settings/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../utils/settings/styling";
import AppText from "../../components/screen-comps/app-text";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Platform } from "react-native";
import NavigationBar from "../../components/layout-comps/navigation-bar";

export default function TrainingHub() {
    const { setBackHandler } = useBackHandlerContext();
    const insets = useSafeAreaInsets();
    const screen = usePathname();

    useEffect(() => {
        if (screen !== routes.TRAINING_HUB) return;

        setBackHandler(() => {
            router.back();
            return true;
        });
    }, [screen]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAwareScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 30, backgroundColor: colors.background, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}
                enableOnAndroid
                extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
                keyboardOpeningTime={0}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onScroll={() => console.log('im a potato')}
                scrollEventThrottle={16}
            >
                <AppText style={{ color: 'white', fontSize: 40 }}>THIS IS TRAINING HUB SCREEN</AppText>
            </KeyboardAwareScrollView >
        </View>
    );
}