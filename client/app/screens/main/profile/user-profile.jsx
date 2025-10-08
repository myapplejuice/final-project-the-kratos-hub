import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "../../../components/screen-comps/app-text";
import { Images } from '../../../common/settings/assets';
import { UserContext } from "../../../common/contexts/user-context";
import { formatDate } from '../../../common/utils/date-time';
import usePopups from "../../../common/hooks/use-popups";
import { scaleFont } from "../../../common/utils/scale-fonts";
import APIService from '../../../common/services/api-service';
import { colors } from "../../../common/settings/styling";
import Divider from '../../../components/screen-comps/divider';
import AppScroll from '../../../components/screen-comps/app-scroll'
import FadeInOut from '../../../components/effects/fade-in-out';

export default function UserProfile() {
    const context = useLocalSearchParams();
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [profile, setProfile] = useState({});
    const [viewImage, setViewImage] = useState(false);

    useEffect(() => {
        async function fetchUserProfile() {
            showSpinner();
            const id = context.userId;

            if (id) {
                const result = await APIService.userToUser.anotherProfile(id);

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
    }, []);

    async function handleAddFriend() {
        createInput({
            title: 'Add Friend',
           confirmText: "Add",
            text: `OPTIONAL:\nEnter something about yourself for them to know about you`,
            placeholders: [`Let them know about you...`],
            initialValues: [``],
            largeTextIndices: [0],
            onSubmit: async (vals) => {
                showSpinner();

                const payload = {
                    adderId: user.id,
                    receiverId: profile.id,
                    status: 'pending',
                    seen: false,
                    description: vals[0],
                    dateOfCreation: new Date(),
                }

                try {
                    const result = await APIService.userToUser.friendRequest(payload);

                    if (result.success) {
                        createToast({ message: "Friend request sent" });
                    } else {
                        createAlert({ title: 'Failure', text: result.message });
                    }
                    hideSpinner();
                } catch (error) {
                    createAlert({ title: 'Failure', text: error });
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    async function handleUserReport() {

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
                                { icon: Images.friend, label: 'Add Friend', onPress: handleAddFriend },
                                { icon: Images.warning, label: 'Report User', onPress: handleUserReport },
                            ].map((item, i) => (
                                <View key={i}>
                                    <TouchableOpacity key={i} style={[styles.optionRow, i === 1 && { marginBottom: 0 }]} onPress={item.onPress}>
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
                                    {i !== 1 && <Divider orientation='horizontal' color={colors.divider} />}
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