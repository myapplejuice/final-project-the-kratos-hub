import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../components/layout-comps/build-footer";
import AppText from "../../components/screen-comps/app-text";
import { Images } from '../../utils/assets';
import { UserContext } from "../../utils/contexts/user-context";
import { formatDate } from "../../utils/helper-functions/unit-converter";
import usePopups from "../../utils/hooks/use-popups";
import { scaleFont } from "../../utils/scale-fonts";
import DeviceStorageService from '../../utils/services/device-storage-service';
import APIService from '../../utils/services/api-service';
import { routes } from "../../utils/settings/constants";
import { colors } from "../../utils/settings/styling";
import Divider from '../../components/screen-comps/divider';
import AppScroll from '../../components/screen-comps/app-scroll'
import ImageCapture from '../../components/screen-comps/image-capture';
import { CameraContext } from '../../utils/contexts/camera-context';
import { LibraryContext } from '../../utils/contexts/library-context';
import AnimatedButton from '../../components/screen-comps/animated-button';

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

    async function setNewImage(newImage) {
        showSpinner();
        try {
            let imageBase64 = await FileSystem.readAsStringAsync(newImage.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const result = await APIService.user.update({ profile: { imageBase64 } })

            if (result.success) {
                setUser(prev => ({ ...prev, image: { uri: `data:image/jpeg;base64,${imageBase64}` } }));
                createToast({ message: "Your profile picture successfully updated!" });
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
                    createToast({ message: "Password successfully changed!" });
                } else {
                    createToast({ message: result.message });
                }
            }
        })
    }

    return (
        <View style={styles.main}>
            <ImageCapture onConfirm={async (image) => setNewImage(image)} />
            <AppScroll>
                <View style={styles.card}>
                    <View style={styles.cardWrapper}>
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
                                source={user.image}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>

                        <View style={styles.infoContainer}>
                            <AppText style={styles.name}>
                                {user.firstname} {user.lastname}
                            </AppText>

                            <View style={styles.detailRow}>
                                <Image source={Images.email} style={styles.detailIcon} />
                                <AppText style={styles.detail}>
                                    {user.email}
                                </AppText>
                            </View>

                            <View style={styles.detailRow}>
                                <Image source={Images.phoneTwo} style={styles.detailIcon} />
                                <AppText style={styles.detail}>
                                    {user.phone}
                                </AppText>
                            </View>

                            <View style={styles.detailRow}>
                                <Image source={Images.calendar} style={styles.detailIcon} />
                                <AppText style={styles.detail}>
                                    Joined {formatDate(user.dateOfCreation, { format: user.preferences.dateFormat, includeMonthName: true })}
                                </AppText>
                            </View>
                        </View>
                    </View>

                    {[
                        { icon: Images.password, label: 'Change Password', onPress: openPasswordChange },
                        { icon: Images.editTwo, label: 'Edit Profile', onPress: () => router.push(routes.EDIT_PROFILE) },
                        { icon: Images.settingsTwo, label: 'Settings', onPress: () => router.push(routes.SETTINGS) },
                    ].map((item, i) => (
                        <View key={i}>
                            <TouchableOpacity key={i} style={[styles.optionRow, i === 2 && styles.optionRowLast]} onPress={item.onPress}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: 'rgba(61, 61, 61, 1)', padding: 8, borderRadius: 10 }}>
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

                    <AnimatedButton
                        leftImage={Images.logout}
                        leftImageStyle={styles.deleteIcon}
                        title={"Sign Out"}
                        onPress={openLogout}
                        textStyle={styles.deleteText}
                        style={styles.deleteButton} />

                    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: 10, marginTop: 5 }}>
                        <AppText style={[styles.label, { color: colors.mutedText, fontSize: scaleFont(9), marginStart: 0 }]}>
                            All of your data is secure with us
                        </AppText>
                    </View>
                </View>

            </AppScroll>
            <BuildFooter />
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 15,
    },
    cardWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.cardBackground,
        marginBottom: 15,
        paddingTop: 15
    },
    imageWrapper: {
        borderRadius: 50,
        padding: 3,
        backgroundColor: colors.mainSecond,
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        fontSize: scaleFont(18),
        fontWeight: "700",
        color: colors.main,
        marginBottom: 6,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 3,
    },
    detailIcon: {
        width: 16,
        height: 16,
        tintColor: colors.mutedText,
        marginRight: 6,
        resizeMode: "contain",
    },
    detail: {
        fontSize: scaleFont(13),
        color: colors.detailText,
    },

    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginHorizontal: 15,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    label: { fontSize: scaleFont(12), color: 'white', fontWeight: '600', marginStart: 15 },
    settingIcon: { tintColor: 'rgb(255,255,255)', width: 20, height: 20 },
    deleteButton: {
        backgroundColor: 'rgb(255, 58, 48)',
        borderRadius: 12,
        paddingVertical: 12,
        marginVertical: 10,
        alignItems: 'center',
    },
    deleteButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    deleteIcon: { width: 20, height: 20, tintColor: 'white', marginRight: 5 },
    deleteText: { fontSize: scaleFont(14), color: 'white', fontWeight: 'bold' },

    arrow: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    },
});