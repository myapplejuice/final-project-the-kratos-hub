import React, { useRef, useContext, useEffect, useImperativeHandle } from "react";
import { Platform, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavBarContext } from "../../common/contexts/nav-bar-context";
import { TopBarContext } from "../../common/contexts/top-bar-context";
import { colors } from "../../common/settings/styling";
import { mainScreens } from "../../common/settings/constants";
import { usePathname } from "expo-router";
import { KeyboardContext } from "../../common/contexts/keyboard-context";

export default function AppScroll({
    children,
    ref,
    contentStyle,
    extraBottom = 0,
    extraTop = 45,
    topPadding = true,
    bottomPadding = true,
    backgroundColor = colors.background,
    paddingColor = colors.background,
    keyboardShouldPersistTaps = "always",
    hideTopBarOnScroll = false,
    hideNavBarOnScroll = false,
    onScrollSetStates = [],
    scrollToTop = false,
    startAtBottom = false,
    avoidKeyboard = true,
    ...props
}) {
    const insets = useSafeAreaInsets();
    const scrollOffset = useRef(0);
    const scrollViewHeight = useRef(0);
    const contentHeight = useRef(0);
    const screen = usePathname();

    const { keyboardActive } = useContext(KeyboardContext);
    const { setNavBarVisibility } = useContext(NavBarContext);
    const { setTopBarVisibility } = useContext(TopBarContext);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollToTop && scrollRef.current) {
            scrollRef.current.scrollToPosition(0, 0, true);
        }
    }, [scrollToTop]);

    useImperativeHandle(ref, () => ({
        scrollToBottom: () => {
            console.log('gets to bottom here')
            if (scrollRef.current) {
                scrollRef.current.scrollToEnd({ animated: true });
            }
        },
        scrollToTop: () => {
            if (scrollRef.current) {
                scrollRef.current.scrollToPosition(0, 0, true);
            }
        },
        isScrolledToBottom: (threshold = 50) => {
            if (!scrollRef.current) return true;

              const distanceFromBottom = contentHeight.current - scrollViewHeight.current - scrollOffset.current;
            return distanceFromBottom > threshold;
        }, 
        currentOffset: () => scrollOffset.current
    }));

    function handleScroll(event) {
        if (keyboardActive) return;

        const currentOffset = event.nativeEvent.contentOffset.y;
        const diff = currentOffset - scrollOffset.current;

        const isScrollable = contentHeight.current > scrollViewHeight.current;
        if (!isScrollable) {
            scrollOffset.current = currentOffset;
            return;
        }

        const setStates = (value) => {
            if (Array.isArray(onScrollSetStates)) {
                onScrollSetStates.forEach((state) => state(value));
            } else if (typeof onScrollSetStates === "function") {
                onScrollSetStates(value);
            } else if (onScrollSetStates != null) {
                console.warn("invalid onScrollSetStates passed");
            }
        };

        if (diff > 0 && currentOffset > 10) {
            hideTopBarOnScroll && setTopBarVisibility(false);
            mainScreens.includes(screen) && hideNavBarOnScroll && setNavBarVisibility(false);
            setStates(false);
        } else if (diff < 0) {
            hideTopBarOnScroll && setTopBarVisibility(true);
            mainScreens.includes(screen) && setNavBarVisibility(true);
            setStates(true);
        }

        scrollOffset.current = currentOffset;
    }

    return (
        <KeyboardAwareScrollView
            ref={scrollRef}
            contentContainerStyle={{
                paddingTop: topPadding ? insets.top + extraTop : 0,
                flexGrow: 1,
                backgroundColor: backgroundColor,
                ...contentStyle,
            }}
            bounces={false}
            overScrollMode="never"
            onLayout={(e) => (scrollViewHeight.current = e.nativeEvent.layout.height)}
            enableOnAndroid={avoidKeyboard}
            extraScrollHeight={avoidKeyboard ? (Platform.OS === "ios" ? 20 : 100) : 0}
            keyboardOpeningTime={avoidKeyboard ? 0 : undefined}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(w, h) => { contentHeight.current = h }}
            {...props}
        >
            <View style={{ flex: 1 }}>
                {children}
            </View>
            <View style={{ height: bottomPadding ? insets.bottom + extraBottom : 0, backgroundColor: paddingColor }} />
        </KeyboardAwareScrollView>
    );
}
