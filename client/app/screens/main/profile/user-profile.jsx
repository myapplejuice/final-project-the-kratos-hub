import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
import FadeInOut from '../../../components/effects/fade-in-out';

export default function UserProfile() {
    const context = useLocalSearchParams();
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [profile, setProfile] = useState({});
    const [viewImage, setViewImage] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        async function fetchUserProfile() {
            showSpinner();
            const id = context.userId;

            if (id) {
                const result = await APIService.user.anotherProfile(id);

                if (result.success) {
                    const profile = result.data.profile;

                    if (profile.imageBase64) {
                        profile.image = { uri: `data:image/jpeg;base64,${profile.imageBase64}` };
                        delete profile.imageBase64;
                    }

                    setProfile(profile);
                } else {
                    createAlert({ title: 'Failure', text: result.message, onPress: () => router.back() });
                }
            } else {
                router.back();
            }
            hideSpinner();
        }

        fetchUserProfile();
    }, [])

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
        <>
            <FadeInOut visible={viewImage && profile.image} style={styles.imageOverlay}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.imageOverlay}
                    onPress={() => setViewImage(false)}
                >
                    <Image
                        source={profile.image}
                        style={styles.fullscreenImage}
                    />
                </TouchableOpacity>
            </FadeInOut>

            <View style={styles.main}>
                {Object.keys(profile).length > 0 && (
                    <AppScroll extraBottom={20}>
                        <View style={[styles.card, { alignItems: 'center' }]}>
                            <TouchableOpacity onPress={() => setViewImage(true)} style={styles.imageWrapper}>
                                <Image
                                    source={profile.image}
                                    style={styles.profileImage}
                                />
                            </TouchableOpacity>

                            <AppText style={styles.name}>
                                {profile.firstname} {profile.lastname}
                            </AppText>

                            <View style={styles.infoContainer}>
                                <View style={styles.infoRow}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecond }]}>
                                        <Image source={Images.email} style={[styles.detailIcon]} />
                                    </View>
                                    <View style={styles.infoText}>
                                        <AppText style={styles.detailLabel}>Email Address</AppText>
                                        <AppText style={styles.detail} numberOfLines={1} ellipsizeMode="tail">
                                            {profile.email}
                                        </AppText>
                                    </View>
                                </View>

                                <View style={[styles.infoRow, { paddingVertical: 10 }]}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecond }]}>
                                        <Image source={Images.phoneTwo} style={[styles.detailIcon]} />
                                    </View>
                                    <View style={styles.infoText}>
                                        <AppText style={styles.detailLabel}>Phone Number</AppText>
                                        <AppText style={styles.detail}>
                                            {profile.phone}
                                        </AppText>
                                    </View>
                                </View>

                                <View style={styles.infoRow}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecond }]}>
                                        <Image source={Images.calendar} style={[styles.detailIcon]} />
                                    </View>
                                    <View style={styles.infoText}>
                                        <AppText style={styles.detailLabel}>Date Joined</AppText>
                                        <AppText style={styles.detail}>
                                            {formatDate(profile.dateOfCreation, { format: user.preferences.dateFormat, includeMonthName: true })}
                                        </AppText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.card, { marginTop: 15 }]}>
                            <AppText style={styles.cardLabel}>Account & Application</AppText>
                            {[
                                { icon: Images.password, label: 'Change Password', onPress: openPasswordChange },
                                { icon: Images.editTwo, label: 'Edit Profile', onPress: () => router.push(routes.EDIT_PROFILE) },
                                { icon: Images.settingsTwo, label: 'Settings', onPress: () => router.push(routes.SETTINGS) },
                            ].map((item, i) => (
                                <View key={i}>
                                    <TouchableOpacity key={i} style={[styles.optionRow, i === 2 && { marginBottom: 0 }]} onPress={item.onPress}>
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
                                    {i !== 2 && <Divider orientation='horizontal' color={colors.divider} />}
                                </View>
                            ))}
                        </View>
                    </AppScroll>
                )}
            </View >
        </>
    );
}

const styles = StyleSheet.create({
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },

    fullscreenImage: {
        width: 250,
        height: 250,
        borderRadius: 125
    },
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
});