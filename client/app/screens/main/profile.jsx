import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../components/layout-comps/build-footer";
import AppText from "../../components/screen-comps/app-text";
import { Images } from '../../common/settings/assets';
import { UserContext } from "../../common/contexts/user-context";
import { formatDate } from '../../common/utils/date-time';
import usePopups from "../../common/hooks/use-popups";
import { scaleFont } from "../../common/utils/scale-fonts";
import DeviceStorageService from '../../common/services/device-storage-service';
import APIService from '../../common/services/api-service';
import { routes } from "../../common/settings/constants";
import { colors } from "../../common/settings/styling";
import Divider from '../../components/screen-comps/divider';
import AppScroll from '../../components/screen-comps/app-scroll'
import ImageCapture from '../../components/screen-comps/image-capture';
import { CameraContext } from '../../common/contexts/camera-context';
import { LibraryContext } from '../../common/contexts/library-context';
import AnimatedButton from '../../components/screen-comps/animated-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, } = usePopups();
    const { user, setUser } = useContext(UserContext);

    async function openLogout() {
        createDialog({
            title: 'Signing Out',
            text: "Are you sure you want to sign out of this account?",
            onConfirm: () => DeviceStorageService.clearUserSession(),
        })
    };

    async function setNewImage(asset) {
        showSpinner();
        try {
            const imageURL = await APIService.uploadImageToCloudinary({
                uri: asset.uri,
                folder: "profile_images",
                fileName: `profile_image_user_${user.id}_${Date.now()}.jpg`,
            });

            const result = await APIService.user.update({ profile: { imageURL } })

            if (result.success) {
                setUser(prev => ({ ...prev, imageURL }));
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
                <View style={[styles.card, { alignItems: 'center' }]}>
                    {user.trainerProfile.trainerStatus === 'active' &&
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 }}>
                            {user.trainerProfile.isVerified &&
                                <TouchableOpacity onPress={() => router.push(routes.SHIELD_OF_TRUST)} style={{ padding: 10, backgroundColor: colors.main, borderRadius: 15, flexDirection: 'row', alignItems: 'center' }}>
                                    <Image source={Images.shield} style={{ width: 20, height: 20, tintColor: 'white' }} />
                                    <AppText style={{ color: 'white', marginStart: 5, fontSize: scaleFont(12), fontWeight: 'bold' }}>Trusted Trainer</AppText>
                                </TouchableOpacity>
                            }
                             <View style={{ width: 40, height: 40, backgroundColor: colors.main, borderRadius: 20, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={Images.personalTrainer} style={{ width: 20, height: 20, tintColor: 'white' }} />
                            </View>
                        </View>
                    }

                    <TouchableOpacity
                        style={styles.imageWrapper}
                        onPress={() => {
                            createSelector({
                                title: "Profile Picture",
                                text: "Do you want to take a photo using camera or upload an image?",
                                optionAText: "Take a Photo",
                                optionBText: "Upload Image",
                                cancelText: "Cancel",
                                onPressA: async () => setCameraActive(true),
                                onPressB: async () => setLibraryActive(true)
                            });
                        }}
                    >
                        <Image
                            source={{ uri: user.imageURL }}
                            cachePolicy="disk"
                            style={styles.profileImage}
                        />
                        <View style={styles.editBadge}>
                            <Image source={Images.camera} style={styles.cameraIcon} />
                        </View>
                    </TouchableOpacity>

                    <AppText style={styles.name}>
                        {user.firstname} {user.lastname}
                    </AppText>

                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecond }]}>
                                <Image source={Images.email} style={[styles.detailIcon]} />
                            </View>
                            <View style={styles.infoText}>
                                <AppText style={styles.detailLabel}>Email Address</AppText>
                                <AppText style={styles.detail} numberOfLines={1} ellipsizeMode="tail">
                                    {user.email}
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
                                    {user.phone}
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
                                    {formatDate(user.dateOfCreation, { format: user.preferences.dateFormat, includeMonthName: true })}
                                </AppText>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { marginTop: 15 }]}>
                    <AppText style={styles.cardLabel}>Trainer Profile</AppText>
                    {[
                        { icon: Images.noHelp, label: 'What is Trainer Profile', onPress: () => router.push(routes.PERSONAL_TRAINING_EXPLANATION) },
                        { icon: Images.personalTrainerOutline, label: 'Personal Trainer Profile', onPress: () => router.replace(routes.PERSONAL_TRAINING_PROFILE) },
                        { icon: Images.shieldOutline, label: 'Shield Applications', onPress: () => router.replace(routes.SHIELD_APPLICATIONS) },
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

                <View style={[styles.card, { marginTop: 15 }]}>
                    <AppText style={styles.cardLabel}>Account & Settings</AppText>
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

                <View style={[styles.card, { marginTop: 15, paddingTop: 20, paddingHorizontal: 20, paddingBottom: 10 }]}>
                    <AnimatedButton
                        leftImage={Images.logout}
                        leftImageStyle={styles.deleteIcon}
                        title={"Sign Out"}
                        onPress={openLogout}
                        textStyle={styles.deleteText}
                        style={styles.deleteButton} />

                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <AppText style={[styles.label, { color: colors.mutedText, fontSize: scaleFont(11), marginStart: 0 }]}>
                            All of your data is secure with us
                        </AppText>
                        <AppText style={[styles.label, { color: colors.mutedText, fontSize: scaleFont(9), marginStart: 0, marginTop: 5 }]}>
                            End-to-end encrypted
                        </AppText>
                    </View>
                </View>
                <BuildFooter style={{ marginTop: 90, marginBottom: 0, paddingBottom: 0 }} />
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
});