import { useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { UserContext } from './utils/contexts/user-context';
import { ImageAssets } from './utils/assets';
import { scaleFont } from './utils/scale-fonts';
import DeviceStorageService from './utils/services/device-storage-service';
import NetInfo from "@react-native-community/netinfo";
import usePopups from './utils/hooks/use-popups';
import { routes } from './utils/settings/constants';
import { Images } from './utils/assets';
import { colors } from './utils/settings/styling';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import APIService from './utils/services/api-service';
import BuildFooter from './components/layout-comps/build-footer'

export default function Index() {
    const { setUser } = useContext(UserContext);
    const { createAlert } = usePopups();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        async function initApp() {
            try {
                // Network
                const netState = await NetInfo.fetch();
                if (!netState.isConnected || !netState.isInternetReachable) {
                    throw new Error('Internet connection required!');
                }

                // API
                const apiState = await APIService.ping();
                if (!apiState) {
                    throw new Error('Servers unavailable!\nPlease try again later');
                }

                // User
                const profile = await DeviceStorageService.initUserSession();
                setUser(profile);

                // Assets
                await Asset.loadAsync(ImageAssets);

                //Rerouting
                if (profile !== false && typeof profile === 'object') {
                    router.replace(routes.HOMEPAGE);
                } else {
                    router.replace(routes.INTRODUCTION);
                }
            } catch (e) {
                createAlert({
                    title: 'Application Failure',
                    text: "Application error, " + " " + e.message,
                    buttonText: 'RETRY',
                    onPress: () => router.replace('/'),
                });
            } 
        }

        initApp();
    }, []);

    const styles = StyleSheet.create({
        main: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background
        },
        logo: {
            width: 350,
            height: 350
        },
        footer: {
            position: "absolute",
            bottom: 30,
            alignItems: "center",
            justifyContent: 'center',
            paddingBottom: insets.bottom
        },
        footerText: {
            fontSize: scaleFont(14),
            color: "#888",
            letterSpacing: 1,
        }
    });

    return (
        <View style={styles.main}>
            <ScrollView contentContainerStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Image
                    style={styles.logo}
                    source={Images.logo}
                />
            </ScrollView>
            <BuildFooter />
        </View>
    )
}