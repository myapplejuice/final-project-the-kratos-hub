import { useEffect, useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import { UserContext } from './common/contexts/user-context';
import { ImageAssets } from './common/settings/assets';
import { scaleFont } from './common/utils/scale-fonts';
import DeviceStorageService from './common/services/device-storage-service';
import NetInfo from "@react-native-community/netinfo";
import usePopups from './common/hooks/use-popups';
import { routes } from './common/settings/constants';
import { Images } from './common/settings/assets';
import { colors } from './common/settings/styling';
import APIService from './common/services/api-service';
import BuildFooter from './components/layout-comps/build-footer'
import FadeInOut from './components/effects/fade-in-out';
import SlideInOut from './components/effects/slide-in-out';
import AppText from './components/screen-comps/app-text';

const screenWidth = Dimensions.get('window').width;

export default function Index() {
    const { setUser } = useContext(UserContext);
    const { createAlert } = usePopups();
    const images = [
        Images.icon1,
        Images.icon2,
        Images.icon3,
        Images.icon4,
        Images.icon1,
        Images.icon2,
        Images.icon3,
        Images.icon4,
        Images.icon5,
        Images.icon6,
        Images.icon7,
        Images.icon8,
        Images.icon9,
        Images.icon10,
        Images.icon11,
        Images.icon12,
        Images.icon13,
        Images.icon14,
        Images.icon15,
        Images.icon16,
        Images.icon17,
        Images.icon18,
        Images.icon19,
        Images.icon20,
        Images.icon21,
        Images.icon22,
        Images.icon23,
        Images.icon24,
        Images.icon25,
        Images.icon26,
        Images.icon27,
        Images.icon28,
        Images.icon29,
    ];
    const [slots, setSlots] = useState([0, 1, 2]);

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

                // Assets
                await Asset.loadAsync(ImageAssets);

                // User
                const result = await DeviceStorageService.initUserSession();
                if (result.success) {
                    setUser(result.profile);

                    if (!result.success && typeof result.profile !== 'object') {
                        router.replace(routes.HOMEPAGE);
                    } else {
                        router.replace(routes.INTRODUCTION);
                    }
                } else {
                    if (result.message?.includes('terminated')) {
                        createAlert({
                            title: 'Account Terminated',
                            text: result.message,
                            buttonText: 'Ok',
                            onPress: async () => await SecureStore.deleteItemAsync("token")
                        });
                    }
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

        const interval = setInterval(() => {
            const availableIndexes = images.map((_, i) => i);
            const newSlots = [];

            for (let i = 0; i < slots.length; i++) {
                // pick a random index from availableIndexes
                const randIdx = Math.floor(Math.random() * availableIndexes.length);
                newSlots.push(availableIndexes[randIdx]);
                // remove it so it can't be used again
                availableIndexes.splice(randIdx, 1);
            }

            setSlots(newSlots);
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    // Image slider effect
    useEffect(() => {

    }, []);

    const numSlots = 3;
    const slotWidth = 50;
    const gap = 70;

    const slotPositions = Array.from({ length: numSlots }, (_, i) => {
        const totalWidth = numSlots * slotWidth + (numSlots - 1) * gap;
        const startX = (screenWidth - totalWidth) / 2;
        return startX + i * (slotWidth + gap);
    });

    return (
        <View style={[styles.main, { backgroundColor: colors.background }]}>
            <View style={{ width: '100%', height: '100%', position: 'relative', justifyContent: 'space-between', alignItems: 'center' }}>
                <Image source={Images.logo} style={{ tintColor: colors.main, width: 300, height: 270, marginTop: 250 }} />
                {slots.map((activeIndex, slotIdx) =>
                    images.map((imgSrc, i) => (
                        <SlideInOut inDuration={500}
                            outDuration={500}
                            key={`${slotIdx}-${i}`}
                            visible={activeIndex === i}
                            direction={slotIdx === 0 || slotIdx === 2 ? 'down' : 'up'}
                            style={{
                                position: 'absolute',
                                top: 150,
                                bottom: 0,
                                left: slotPositions[slotIdx] || 0,
                                right: 0,
                                justifyContent: 'center',

                            }}>
                            <FadeInOut
                                inDuration={500}
                                outDuration={500}
                                key={`${slotIdx}-${i}`}
                                visible={activeIndex === i}
                            >
                                <Image style={styles.logo} source={imgSrc} />
                            </FadeInOut>
                        </SlideInOut>
                    ))
                )}
                <BuildFooter />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background
    },
    logo: {
        width: 50,
        height: 50
    },
});