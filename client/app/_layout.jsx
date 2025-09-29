import { useState, useMemo, useEffect, useContext } from "react";
import { usePathname, Stack, router } from "expo-router";
import TopBar from "./components/layout-comps/top-bar"
import NavigationBar from "./components/layout-comps/navigation-bar"
import PopupsProvider from "./common/providers/popups-provider";
import { BackHandlerProvider, useBackHandlerContext } from './common/contexts/back-handler-context';
import { UserContext } from "./common/contexts/user-context";
import { CameraContext } from "./common/contexts/camera-context";
import Popups from "./components/popups/popups";
import { StatusBar } from 'expo-status-bar';
import usePopupsHandlers from './common/hooks/use-popups-handlers'
import { colors } from './common/settings/styling'
import { exitAppBackScreens, independentBackHandlerScreens } from "./common/settings/constants";
import { BackHandler, Keyboard, View } from "react-native";
import { TopBarContext } from "./common/contexts/top-bar-context";
import { NavBarContext } from "./common/contexts/nav-bar-context";
import { authScreens } from "./common/settings/constants";
import { mainScreens } from "./common/settings/constants";
import { LibraryContext } from "./common/contexts/library-context";
import { KeyboardContext } from "./common/contexts/keyboard-context";

export default function RootLayout() {
    return (
        <BackHandlerProvider>
            <Layout />
        </BackHandlerProvider>
    );
}

function Layout() {
    const [user, setUser] = useState(null);
    const [additionalContexts, setAdditionalContexts] = useState({});
    const [keyboardActive, setKeyboardActive] = useState(false);
    const [navBarVisibility, setNavBarVisibility] = useState(true);
    const [topBarVisibility, setTopBarVisibility] = useState(true);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraPreviewActive, setCameraPreviewActive] = useState(false);
    const [libraryActive, setLibraryActive] = useState(false);

    const { popupStates, popupActions } = usePopupsHandlers();
    const popups = useMemo(() => popupActions, [popupActions]);
    const { setBackHandler } = useBackHandlerContext();

    const screen = usePathname();
    const bars = !authScreens.includes(screen) && !cameraActive && !cameraPreviewActive;

    useEffect(() => {
        const handlers = {
            exit: () => { BackHandler.exitApp(); return true; },
            back: () => { router.back(); return true; },
        };

        if (exitAppBackScreens.includes(screen)) {
            setBackHandler(handlers.exit);
        } else if (!independentBackHandlerScreens.includes(screen)) {
            setBackHandler(handlers.back);
        }

        const showNav = mainScreens.includes(screen);
        setNavBarVisibility(showNav);
        setTopBarVisibility(true);
    }, [screen]);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardActive(true);
        });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardActive(false);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    return (
        <KeyboardContext.Provider value={{ keyboardActive, setKeyboardActive }}>
            <NavBarContext.Provider value={{ navBarVisibility, setNavBarVisibility }}>
                <TopBarContext.Provider value={{ topBarVisibility, setTopBarVisibility }}>
                    <UserContext.Provider value={{ user, setUser, additionalContexts, setAdditionalContexts }}>
                        <CameraContext.Provider value={{ cameraActive, setCameraActive, cameraPreviewActive, setCameraPreviewActive }}>
                            <LibraryContext.Provider value={{ libraryActive, setLibraryActive }} >
                                <PopupsProvider popups={popups}>
                                    <StatusBar hidden={cameraActive || cameraPreviewActive} style="light" />
                                    <Popups {...popupStates} />
                                    {bars && <TopBar visible={topBarVisibility} />}
                                    <View style={{ flex: 1, backgroundColor: colors.background }}>
                                        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
                                            {/* AUTHENTICATION */}
                                            <Stack.Screen name="index" />
                                            <Stack.Screen name="screens/authentication/introduction" />
                                            <Stack.Screen name="screens/authentication/login" />
                                            <Stack.Screen name="screens/authentication/recovery" />
                                            <Stack.Screen name="screens/authentication/register" />

                                            {/* MAIN */}
                                            <Stack.Screen name="screens/main/profile" />
                                            <Stack.Screen name="screens/main/homepage" />
                                            <Stack.Screen name="screens/main/goals" />
                                            <Stack.Screen name="screens/main/nutrition-hub" />
                                            <Stack.Screen name="screens/main/training-hub" />

                                            {/* HOMEPAGE CHILDREN */}
                                            <Stack.Screen name="screens/main/homepage/lean-body-mass" />
                                            <Stack.Screen name="screens/main/homepage/body-mass-index" />
                                            <Stack.Screen name="screens/main/homepage/total-daily-energy-expenditure" />
                                            <Stack.Screen name="screens/main/homepage/basal-metabolic-rate" />
                                            <Stack.Screen name="screens/main/homepage/body-fat" />

                                            {/* PROFILE & CHILDREN */}
                                            <Stack.Screen name="screens/main/profile/settings" />
                                            <Stack.Screen name="screens/main/profile/edit-profile" />

                                            {/* SETTINGS CHILDREN */}
                                            <Stack.Screen name="screens/main/profile/settings/units-change" />
                                            <Stack.Screen name="screens/main/profile/settings/about" />
                                            <Stack.Screen name="screens/main/profile/settings/terms-of-service" />
                                            <Stack.Screen name="screens/main/profile/settings/privacy-policy" />

                                            {/* GOALS CHILDREN */}
                                            <Stack.Screen name="screens/main/goals/edit-activity" />
                                            <Stack.Screen name="screens/main/goals/edit-weight-goal" />


                                            {/* NUTRITION CHILDREN */}
                                            <Stack.Screen name="screens/main/nutrition/edit-diet" />
                                            <Stack.Screen name="screens/main/nutrition/meals-log" />
                                            <Stack.Screen name="screens/main/nutrition/food-creator" />
                                            <Stack.Screen name="screens/main/nutrition/food-editor" />
                                            <Stack.Screen name="screens/main/nutrition/food-selection" />
                                            <Stack.Screen name="screens/main/nutrition/food-profile" />

                                        </Stack>
                                    </View>
                                    {bars && <NavigationBar visible={navBarVisibility} />}
                                </PopupsProvider>
                            </LibraryContext.Provider>
                        </CameraContext.Provider>
                    </UserContext.Provider>
                </TopBarContext.Provider>
            </NavBarContext.Provider>
        </KeyboardContext.Provider>
    );
}
