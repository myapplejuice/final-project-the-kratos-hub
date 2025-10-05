import { View, StyleSheet, TouchableOpacity, Animated, Linking, Platform } from "react-native";
import { useEffect, useContext, useState, useRef } from "react";
import { UserContext } from "../../../common/contexts/user-context";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { router } from "expo-router";
import { routes } from "../../../common/settings/constants";
import { colors } from "../../../common/settings/styling";
import { Image } from "expo-image";
import { Images } from '../../../common/settings/assets'
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';
import * as Application from 'expo-application';
import usePopups from "../../../common/hooks/use-popups";
import APIService from "../../../common/services/api-service";
import AppText from "../../../components/screen-comps/app-text";
import AnimatedButton from "../../../components/screen-comps/animated-button";
import DeviceStorageService from "../../../common/services/device-storage-service";
import Divider from "../../../components/screen-comps/divider";
import AppScroll from "../../../components/screen-comps/app-scroll";
import ExpandInOut from "../../../components/effects/expand-in-out";

export default function Settings() {
    const { user } = useContext(UserContext);
    const { createToast, hideSpinner, showSpinner, createAlert, createInput, createOptions } = usePopups();

    const [deleting, setDeleting] = useState(false);
    const [password, setPassword] = useState('');
    const [countdown, setCountdown] = useState(10);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const pulse = useRef(new Animated.Value(1)).current;
    const arrowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let timer, interval;

        if (deleting) {
            setCountdown(10);

            Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(pulse, {
                            toValue: 1.1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(pulse, {
                            toValue: 1,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();

            interval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            timer = setTimeout(() => {
                (async () => {
                    clearInterval(interval);
                    setDeleting(false);

                    showSpinner();
                    const result = await APIService.user.destroy({ password });
                    hideSpinner();

                    if (result.success)
                        DeviceStorageService.clearUserSession();
                    else
                        createAlert({ title: "Delete Account", text: result.message });
                })();
            }, 10000);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [deleting]);

    useEffect(() => {
        Animated.timing(arrowAnim, {
            toValue: advancedOpen ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [advancedOpen]);

    function cancelDeletion() {
        setDeleting(false);
        createToast({ message: 'Account delete cancelled!' });
    }

    function initDeleteHandler() {
        createInput({
            title: 'Delete Account',
            confirmText: 'Delete',
            confirmButtonStyle: { backgroundColor: 'rgb(255,59,48)', borderColor: 'rgb(255,59,48)' },
            text: `Please enter your password to confirm`,
            placeholders: ['Password'],
            extraConfigs: [{ secureTextEntry: true }],
            onSubmit: async ([password]) => {
                setPassword(password);
                setDeleting(true);
            },
        });
    }

    async function openLangOptions() {
        createOptions({
            title: 'Language',
            options: ['English', 'עברית', 'العربية'],
            current: (() => {
                switch (user.preferences.language.standard) {
                    case 'en': return 'English';
                    case 'he': return 'עברית';
                    case 'ar': return 'العربية';
                    default: return 'English';
                }
            })(),
            onConfirm: (selected) => {
                if (selected) {
                    const languages = {
                        English: { standard: 'en', format: 'en-US' },
                        'עברית': { standard: 'he', format: 'he-IL' },
                        'العربية': { standard: 'ar', format: 'ar-SA' },
                    };

                    const langObj = languages[selected];
                    const userPreferences = { ...user.preferences, language: langObj };
                    user.preferences = userPreferences;
                    DeviceStorageService.setUserPreferences(userPreferences);
                }
            }
        });
    }

    async function openThemeOptions() {
        createOptions({
            title: 'Theme',
            options: ['Dark', 'Light'],
            current: user.preferences.theme === 'dark' ? 'Dark' : 'Light',
            onConfirm: (selected) => {
                if (selected) {
                    const themes = {
                        'Dark': 'dark',
                        'Light': 'light',
                    };

                    const theme = themes[selected];
                    const userPreferences = { ...user.preferences, theme: theme };
                    user.preferences = userPreferences;
                    DeviceStorageService.setUserPreferences(userPreferences);
                }
            }
        });
    }

    async function handleReportBug() {
        console.log(Localization.getLocales());

        const body = `-- The following is information about your device that will help us pinpoint the problem.\n\n-- Feel free to remove any or all of it if you are uncomfortable sharing such information with us.
        
Device Info:
- Platform: ${Platform.OS}
- OS Version: ${Platform.Version}
- Manufacturer: ${Device.manufacturer || 'Unknown'}
- Model: ${Device.modelName || 'Unknown'}
- Language: ${Localization.getLocales()[0].languageTag || 'Unknown'}
- App Version: ${Application.nativeApplicationVersion || 'Unknown'}

Describe the bug here: `;

        await Linking.openURL(
            `mailto:support@kratoshub.app?subject=Bug Report&body=${encodeURIComponent(body)}`
        );
    }

    async function handleSendFeedback() {
        const body = `We would love to hear your thoughts!  

Please share your feedback below:  

---

Device Info (optional, but helpful):
- Platform: ${Platform.OS}
- OS Version: ${Platform.Version}
- Manufacturer: ${Device.manufacturer || 'Unknown'}
- Model: ${Device.modelName || 'Unknown'}
- Language: ${Localization.getLocales()[0].languageTag || 'Unknown'}
- App Version: ${Application.nativeApplicationVersion || 'Unknown'}
`;

        await Linking.openURL(
            `mailto:support@kratoshub.app?subject=App Feedback&body=${encodeURIComponent(body)}`
        );
    }

    async function openNotificationSettings() {
        if (Platform.OS === "ios") {
            await Linking.openURL("app-settings:");
        } else {
            const packageName = Application.applicationId;

            try {
                await Linking.openSettings();
            } catch {
                await Linking.openURL(`package:${packageName}`);
            }
        }
    }

    return (
        <View>
            {deleting && (
                <View style={styles.spinnerOverlay}>
                    <Animated.View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            transform: [{ scale: pulse }],
                        }}
                    >
                        <AppText style={styles.spinnerText}>
                            WARNING!{"\n"}Deleted accounts are not restorable...
                        </AppText>
                        <AppText style={styles.spinnerCountdown}>
                            {countdown}s
                        </AppText>
                    </Animated.View>
                    <AnimatedButton onPress={cancelDeletion} style={styles.cancelButton} textStyle={styles.cancelText} title={"CANCEL"} />
                </View>
            )}
            <AppScroll extraBottom={100}>
                <View style={[styles.card, { margin: 15 }]}>
                    <AppText style={styles.cardLabel}>
                        Preferences
                    </AppText>
                    {[
                        { icon: Images.math, label: 'Units & Formats', onPress: () => router.push(routes.UNITS_CHANGE) },
                        { icon: Images.language, label: 'Language', onPress: openLangOptions },
                        { icon: Images.theme, label: 'Dark Mode', onPress: openThemeOptions },
                        { icon: Images.noNotification, label: 'Notifications', onPress: openNotificationSettings },
                    ].map((item, i) => (
                        <View key={i}>
                            <TouchableOpacity key={i} style={[styles.optionRow, i === 3 && { marginBottom: 0 }]} onPress={item.onPress}    >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: colors.backgroundSecond, padding: 13, borderRadius: 12 }}>
                                        <Image source={item.icon} style={styles.settingIcon} />
                                    </View>
                                    <AppText style={styles.label}>
                                        {item.label}
                                    </AppText>
                                </View>

                                <Image
                                    source={Images.backArrow}
                                    style={[
                                        styles.arrow,
                                        {
                                            transform: [
                                                { scaleX: -1 },
                                                ...(item.isAdvanced && advancedOpen ? [{ rotate: "-90deg" }] : [])
                                            ]
                                        }
                                    ]}
                                />
                            </TouchableOpacity>
                            {i !== 3 && <Divider orientation="horizontal" />}
                        </View>
                    ))}
                </View>

                <View style={[styles.card]}>
                    <AppText style={styles.cardLabel}>
                        Support
                    </AppText>
                    {[
                        { icon: Images.communication, label: 'Send Feedback', onPress: () => handleSendFeedback() },
                        { icon: Images.noBug, label: 'Report a Bug', onPress: () => handleReportBug() },
                        { icon: Images.termsOfService, label: 'Terms of Service', onPress: () => router.push(routes.TERMS_OF_SERVICE) },
                        { icon: Images.lock, label: 'Privacy Policy', onPress: () => router.push(routes.PRIVACY_POLICY) },
                        { icon: Images.noHelp, label: 'About Us', onPress: () => router.push(routes.ABOUT) },
                    ].map((item, i) => (
                        <View key={i}>
                            <TouchableOpacity key={i} style={[styles.optionRow, i === 4 && { marginBottom: 0 }]} onPress={item.onPress}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: colors.backgroundSecond, padding: 13, borderRadius: 12 }}>
                                        <Image source={item.icon} style={styles.settingIcon} />
                                    </View>
                                    <AppText style={styles.label}>
                                        {item.label}
                                    </AppText>
                                </View>
                                <Image source={Images.backArrow} style={[styles.arrow, { transform: [{ scaleX: -1 }] }]} />
                            </TouchableOpacity>
                            {i !== 4 && <Divider orientation="horizontal" />}
                        </View>
                    )
                    )}

                </View>

                <View style={[styles.card, { margin: 15 }]}>
                    <AppText style={styles.cardLabel}>
                        Advanced Settings
                    </AppText>
                    {[
                        { icon: Images.xMark, label: 'Account Termination', onPress: () => setAdvancedOpen(!advancedOpen), isAdvanced: true },
                    ].map((item, i) => (
                        <View key={i}>
                            <TouchableOpacity key={i} style={[styles.optionRow, { marginBottom: 0 }]} onPress={item.onPress}    >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: colors.backgroundSecond, padding: 13, borderRadius: 12 }}>
                                        <Image source={item.icon} style={[styles.settingIcon, { width: 20, height: 20 }]} />
                                    </View>
                                    <AppText style={styles.label}>
                                        {item.label}
                                    </AppText>
                                </View>

                                <Animated.View
                                    style={{
                                        transform: [
                                            { scaleX: -1 },
                                            {
                                                rotate: arrowAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ["0deg", "-90deg"],
                                                }),
                                            },
                                        ],
                                    }}
                                >
                                    <Image source={Images.backArrow} style={styles.arrow} />
                                </Animated.View>

                            </TouchableOpacity>
                        </View>
                    ))}


                        <ExpandInOut visible={advancedOpen}>
                            <TouchableOpacity style={styles.deleteButton} onPress={initDeleteHandler}>
                                <View style={styles.deleteButtonContent}>
                                    <Image source={Images.trash} style={styles.deleteIcon} />
                                    <AppText style={styles.deleteText}>Delete Account</AppText>
                                </View>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
                                <AppText style={[styles.label, { color: 'rgba(255, 70, 70, 0.7)', fontSize: scaleFont(9), marginStart: 0 }]}>
                                    Deleted accounts are not restorable !
                                </AppText>
                            </View>
                        </ExpandInOut>
                </View>
            </AppScroll>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 15,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
        padding: 5
    },
    cardLabel: {
        fontSize: scaleFont(12),
        color: 'white',
        fontWeight: '600',
    },
    label: {
        fontSize: scaleFont(12),
        color: 'white',
        fontWeight: '600',
        marginStart: 15
    },
    settingIcon: {
        tintColor: 'rgb(255,255,255)',
        width: 20,
        height: 20
    },
    deleteButton: {
        backgroundColor: 'rgb(255, 58, 48)',
        paddingVertical: 12,
        marginTop: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    deleteIcon: {
        width: 23,
        height: 23,
        tintColor: 'white',
        marginRight: 10
    },
    deleteText: {
        fontSize: scaleFont(15),
        color: 'white',
        fontWeight: 'bold'
    },
    arrow: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    },
    spinnerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    spinnerText: {
        color: 'red',
        fontSize: scaleFont(16),
        fontWeight: '500',
        textAlign: 'center'
    },
    spinnerCountdown: {
        color: 'white',
        fontSize: scaleFont(15),
        marginTop: 8,
        fontWeight: '400'
    },
    cancelButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 15,
        backgroundColor: colors.main,
    },
    cancelText: {
        color: 'white',
        fontSize: scaleFont(15)
    },
});
