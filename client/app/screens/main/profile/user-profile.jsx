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
import AppScroll from '../../../components/screen-comps/app-scroll'
import FadeInOut from '../../../components/effects/fade-in-out';

export default function UserProfile() {
    const context = useLocalSearchParams();
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [profile, setProfile] = useState({});
    const [viewImage, setViewImage] = useState(false);
    let friend = user.friends?.find(f => f.friendId === profile.id);
    if (!friend)
        friend = user.pendingFriends?.find(f => f.adderId === profile.id || f.receiverId === profile.id);

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
                        setUser(prev => ({
                            ...prev,
                            friends: [...prev.friends, payload]
                        }));
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

    async function handleRemoveFriend() {
        //TODO REMOVE
    }

    async function handleToMessages() {
        //TODO BLOCK
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

                            <AppText style={[styles.name, { marginBottom: 0, paddingBottom: 0 }]}>
                                {profile.firstname} {profile.lastname}
                            </AppText>

                            <View style={{ marginTop: 5, marginBottom: 15 }}>
                                {friend && (
                                    <View style={{ padding: 9, borderRadius: 20, backgroundColor: friend.status === 'active' ? colors.accentGreen : colors.accentYellow }}>
                                        <AppText style={{ color: 'white', fontSize: scaleFont(11) }}>
                                            {friend.status === 'pending'
                                                ? 'Pending Friend'
                                                : friend.status === 'active'
                                                    ? 'Active Friend'
                                                    : 'Friendship Terminated'}
                                        </AppText>
                                    </View>
                                )}
                            </View>

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

                                <View style={[styles.infoRow, {marginBottom: 0}]}>
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

                        <View style={[styles.card, {marginTop: 15}]}>
                            <AppText style={[styles.cardLabel, {fontSize: scaleFont(15)}]}>
                                Actions
                                </AppText>
                            {friend.status !== 'active' && friend.status !== 'pending' && (
                                <TouchableOpacity onPress={handleAddFriend} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 15 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={{ backgroundColor: colors.backgroundSecond, padding: 13, borderRadius: 12 }}>
                                            <Image source={Images.friend} style={styles.settingIcon} />
                                        </View>
                                        <AppText style={styles.label}>Add Friend</AppText>
                                    </View>
                                    <Image
                                        source={Images.backArrow}
                                        style={[styles.arrow, { transform: [{ scaleX: -1 }] }]}
                                    />
                                </TouchableOpacity>
                            )}

                            {friend.status === 'active' && (
                                <>
                                    <TouchableOpacity onPress={handleToMessages} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 15 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <View style={{ backgroundColor: colors.backgroundSecond, padding: 13, borderRadius: 12 }}>
                                                <Image source={Images.noMessage} style={styles.settingIcon} />
                                            </View>
                                            <AppText style={styles.label}>To Messages</AppText>
                                        </View>
                                        <Image
                                            source={Images.backArrow}
                                            style={[styles.arrow, { transform: [{ scaleX: -1 }] }]}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleRemoveFriend} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 15 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <View style={{ backgroundColor: colors.backgroundSecond, padding: 13, borderRadius: 12 }}>
                                                <Image source={Images.xMark} style={styles.settingIcon} />
                                            </View>
                                            <AppText style={styles.label}>Remove Friend</AppText>
                                        </View>
                                        <Image
                                            source={Images.backArrow}
                                            style={[styles.arrow, { transform: [{ scaleX: -1 }] }]}
                                        />
                                    </TouchableOpacity>
                                </>
                            )}

                            <TouchableOpacity onPress={handleUserReport} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                    <View style={{ backgroundColor: colors.backgroundSecond, padding: 13, borderRadius: 12 }}>
                                        <Image source={Images.warning} style={styles.settingIcon} />
                                    </View>
                                    <AppText style={styles.label}>
                                        Report User
                                    </AppText>
                                </View>
                                <Image source={Images.backArrow} style={[styles.arrow, { transform: [{ scaleX: -1 }] }]} />
                            </TouchableOpacity>
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
        width: '100%'
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