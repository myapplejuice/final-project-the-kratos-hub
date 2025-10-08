import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext } from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../../components/layout-comps/build-footer";
import AppText from "../../../components/screen-comps/app-text";
import { Images } from '../../../common/settings/assets';
import { UserContext } from "../../../common/contexts/user-context";
import { formatDate } from '../../../common/utils/date-time';
import usePopups from "../../../common/hooks/use-popups";
import { scaleFont } from "../../../common/utils/scale-fonts";
import DeviceStorageService from '../../../common/services/device-storage-service';
import APIService from '../../../common/services/api-service';
import { routes } from "../../../common/settings/constants";
import { colors } from "../../../common/settings/styling";
import Divider from '../../../components/screen-comps/divider';
import AppScroll from '../../../components/screen-comps/app-scroll'
import ImageCapture from '../../../components/screen-comps/image-capture';
import { CameraContext } from '../../../common/contexts/camera-context';
import { LibraryContext } from '../../../common/contexts/library-context';
import AnimatedButton from '../../../components/screen-comps/animated-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function USDAProfile() {
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const insets = useSafeAreaInsets();

    async function openLogout() {
        createDialog({
            title: 'Signing Out',
            text: "Are you sure you want to sign out of this account?",
            onConfirm: () => DeviceStorageService.clearUserSession(),
        })
    };

    async function setNewImage(newImage) {
        showSpinner();
        try {
            let imageBase64 = await FileSystem.readAsStringAsync(newImage.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const result = await APIService.user.update({ profile: { imageBase64 } })

            if (result.success) {
                setUser(prev => ({ ...prev, image: { uri: `data:image/jpeg;base64,${imageBase64}` } }));
                createToast({ message: "Profile picture updated" });
                return true;
            }
            else {
                createToast({ message: result.message });
                return false;
            }
        }
        catch (e) {
            createToast({ message: `${e}\nPlease try again later.` });
            return false;
        }
        finally {
            hideSpinner();
        }
    }

    async function openPasswordChange() {
        createInput({
            title: "Change Password",
            confirmText: "Submit",
            text: "Enter your new password",
            placeholders: [
                "Current Password",
                "New Password",
                "Confirm Password",
            ],
            extraConfigs: [{}, { secureTextEntry: true }, { secureTextEntry: true }],
            onSubmit: async ([current, newPass, confirmPass]) => {
                current = current.trim();
                newPass = newPass.trim();
                confirmPass = confirmPass.trim();

                if (!current || !newPass || !confirmPass) {
                    createToast({ message: "All fields are required!" });
                    return;
                }

                if (newPass !== confirmPass) {
                    createToast({ message: "Passwords do not match!" });
                    return;
                }

                if (newPass.length < 6) {
                    createToast({ message: "Password must be at least 6 characters!" });
                    return;
                }

                const payload = {
                    currentPassword: current,
                    password: newPass
                };

                showSpinner();
                const result = await APIService.user.update({ profile: payload });
                hideSpinner();

                if (result.success) {
                    createToast({ message: "Password changed" });
                } else {
                    createToast({ message: result.message });
                }
            }
        })
    }

    return (
        <View style={styles.main}>
            <ImageCapture onConfirm={async (image) => setNewImage(image)} />
            <AppScroll extraBottom={20}>
                <View style={[styles.card, { margin: 0, padding: 0 }]}>
                    <Image source={Images.usdaBackground} style={{ width: '100%', height: 150, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }} />
                    <View style={{ margin: 20 }}>
                        <AppText style={styles.sectionTitle}>United States Department of Agriculture</AppText>
                        <AppText style={styles.description}>
                            The USDA FoodData Central is one of the world's most comprehensive food and nutrient databases,
                            providing authoritative information on food composition to users globally. Managed by the USDA
                            Agricultural Research Service, this internationally recognized database contains detailed
                            nutrient profiles for over 400,000 foods used by researchers, healthcare professionals,
                            policymakers, and consumers worldwide.
                        </AppText>
                        <AppText style={styles.description}>
                            All nutritional information from USDA sources undergoes rigorous laboratory analysis and
                            quality assurance procedures, ensuring accurate and reliable data for dietary planning
                            and nutritional research across different countries and cultures.
                        </AppText>
                        <Divider orientation='horizontal' />
                        <View style={styles.sourceInfo}>
                            <AppText style={styles.sourceText}>
                                Source: USDA Agricultural Research Service • FoodData Central
                            </AppText>
                            <AppText style={styles.sourceText}>
                                Internationally recognized database • Public Domain Data
                            </AppText>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { marginTop: 15 }]}>
                    <AppText style={styles.cardLabel}>Contact & Links</AppText>

                    <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('https://fdc.nal.usda.gov')}>
                        <View style={styles.linkContent}>
                            <Image source={Images.website} style={styles.linkIcon} />
                            <View style={styles.linkTextContainer}>
                                <AppText style={styles.linkTitle}>FoodData Central Website</AppText>
                                <AppText style={styles.linkSubtitle}>fdc.nal.usda.gov</AppText>
                            </View>
                        </View>
                        <Image source={Images.externalLink} style={styles.externalIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('https://www.usda.gov')}>
                        <View style={styles.linkContent}>
                            <Image source={Images.website} style={styles.linkIcon} />
                            <View style={styles.linkTextContainer}>
                                <AppText style={styles.linkTitle}>USDA Official Website</AppText>
                                <AppText style={styles.linkSubtitle}>usda.gov</AppText>
                            </View>
                        </View>
                        <Image source={Images.externalLink} style={styles.externalIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('https://www.ars.usda.gov')}>
                        <View style={styles.linkContent}>
                            <Image source={Images.research} style={styles.linkIcon} />
                            <View style={styles.linkTextContainer}>
                                <AppText style={styles.linkTitle}>Agricultural Research Service</AppText>
                                <AppText style={styles.linkSubtitle}>ars.usda.gov</AppText>
                            </View>
                        </View>
                        <Image source={Images.externalLink} style={styles.externalIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('mailto:usda@usda.gov')}>
                        <View style={styles.linkContent}>
                            <Image source={Images.email} style={styles.linkIcon} />
                            <View style={styles.linkTextContainer}>
                                <AppText style={styles.linkTitle}>General Inquiries</AppText>
                                <AppText style={styles.linkSubtitle}>usda@usda.gov</AppText>
                            </View>
                        </View>
                        <Image source={Images.externalLink} style={styles.externalIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('https://data.nal.usda.gov/contact')}>
                        <View style={styles.linkContent}>
                            <Image source={Images.contact} style={styles.linkIcon} />
                            <View style={styles.linkTextContainer}>
                                <AppText style={styles.linkTitle}>Data & Technical Support</AppText>
                                <AppText style={styles.linkSubtitle}>Data support contact form</AppText>
                            </View>
                        </View>
                        <Image source={Images.externalLink} style={styles.externalIcon} />
                    </TouchableOpacity>
                </View>
            </AppScroll>
        </View>
    );
}

const styles = StyleSheet.create({
    cardLabel: {
        fontSize: scaleFont(12),
        color: 'white',
        fontWeight: '600',
    },
    main: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 15,
    },
    imageWrapper: {
        borderRadius: 50,
        padding: 2,
        borderWidth: 2,
        borderColor: colors.main,
        position: 'relative',
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: colors.main,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.cardBackground,
    },
    cameraIcon: {
        width: 12,
        height: 12,
        tintColor: 'white',
    },
    name: {
        fontSize: scaleFont(22),
        fontWeight: "700",
        color: colors.main,
        marginTop: 15,
        marginBottom: 20,
        textAlign: 'center',
    },
    infoContainer: {
        width: '100%',
        paddingStart: 5
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 10,
    },
    iconContainer: {
        padding: 13,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailIcon: {
        width: 20,
        height: 20,
        tintColor: 'white'
    },
    infoText: {
        flex: 1,
    },
    detailLabel: {
        fontSize: scaleFont(11),
        color: colors.mutedText,
        fontWeight: '600',
        marginBottom: 2,
    },
    detail: {
        fontSize: scaleFont(13),
        color: 'white',
        fontWeight: '500',
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        marginHorizontal: 15,
        padding: 20
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
        padding: 5
    },
    label: { fontSize: scaleFont(12), color: 'white', fontWeight: '600', marginStart: 15 },
    settingIcon: { tintColor: 'rgb(255,255,255)', width: 20, height: 20 },
    deleteButton: {
        backgroundColor: 'rgb(255, 58, 48)',
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 10,
        alignItems: 'center',
    },
    deleteButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    deleteIcon: { width: 23, height: 23, tintColor: 'white', marginRight: 5 },
    deleteText: { fontSize: scaleFont(15), color: 'white', fontWeight: 'bold' },

    arrow: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    },
    sectionTitle: {
        fontSize: scaleFont(15),
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    description: {
        fontSize: scaleFont(14),
        color: colors.mutedText,
        lineHeight: 20,
        marginBottom: 10,
    },
    sourceInfo: {
        paddingTop: 15,
    },
    sourceText: {
        fontSize: scaleFont(12),
        color: colors.mainOpacied,
    },
    cardLabel: {
    fontSize: scaleFont(15),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
},
linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBackground,
},
linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
},
linkIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    marginRight: 12,
},
linkTextContainer: {
    flex: 1,
},
linkTitle: {
    fontSize: scaleFont(14),
    color: 'white',
    fontWeight: '500',
    marginBottom: 2,
},
linkSubtitle: {
    fontSize: scaleFont(12),
    color: colors.mutedText,
},
externalIcon: {
    width: 16,
    height: 16,
    tintColor: colors.mutedText,
    marginLeft: 8,
},
});