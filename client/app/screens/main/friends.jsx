import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../components/layout-comps/build-footer";
import AppText from "../../components/screen-comps/app-text";
import { Images } from '../../common/settings/assets';
import { UserContext } from "../../common/contexts/user-context";
import { formatDate, formatTime } from '../../common/utils/date-time';
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
import Invert from '../../components/effects/invert';
import ExpandInOut from '../../components/effects/expand-in-out';
import AppTextInput from '../../components/screen-comps/app-text-input';

export default function Friends() {
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [friendsList, setFriendsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedList, setSelectedList] = useState('all');
    const [visibleList, setVisibleList] = useState([]);

    useEffect(() => {
        async function fetchFriendsProfiles() {
            try {
                showSpinner();
                const idList = user.friends.map(friend => friend.friendId);
                const result = await APIService.userToUser.multipleAnotherProfile(idList);

                if (result.success) {
                    const profiles = result.data.profiles;
                    for (let i = 0; i < profiles.length; i++) {
                        if (profiles[i].imageBase64) {
                            profiles[i].image = { uri: `data:image/jpeg;base64,${profiles[i].imageBase64}` };
                            delete profiles[i].imageBase64;
                        }
                    }

                    setFriendsList(profiles);
                    setVisibleList(profiles);
                }
            } catch (error) {
                console.log(error);
            } finally {
                hideSpinner();
                setLoading(false);
            }
        }

        fetchFriendsProfiles();
    }, []);

    useEffect(() => {
        if (searchQuery === '') {
            setVisibleList(friendsList);
            return;
        }

        const query = searchQuery.trim().toLowerCase();
const filtered = friendsList.filter(profile =>
    (profile.firstname + ' ' + profile.lastname).toLowerCase().startsWith(query)
);
setVisibleList(filtered);
    }, [searchQuery]);

    function handleProfilePress(profile) {
        router.push({
            pathname: routes.USER_PROFILE,
            params: {
                userId: profile.id
            }
        })
    }

    return (
        <AppScroll extraBottom={loading ? 0 : 150}>
            {!loading ? (
                <View style={{ flex: 1, margin: 15 }}>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.inputBackground, alignItems: 'center', borderRadius: 15, height: 50 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '80%' }}>
                                <Image source={Images.magnifier} style={{ tintColor: colors.mutedText, width: 20, height: 20, marginHorizontal: 15 }} />
                                <AppTextInput
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={async () => {
                                        Keyboard.dismiss();
                                        //DO friend search
                                    }}
                                    value={searchQuery}
                                    placeholder="Search"
                                    placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                    style={styles.inputStripped} />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                            <TouchableOpacity onPress={() => setSelectedList('all')} style={{ padding: 10, borderWidth: 1, borderColor: selectedList === 'all' ? colors.main : colors.mutedText, backgroundColor: selectedList === 'all' ? colors.main : 'transparent', borderRadius: 15, width: '48%', alignItems: 'center' }}>
                                <AppText style={{ color: 'white', fontWeight: 'bold' }}>All</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSelectedList('unread')} style={{ padding: 10, borderWidth: 1, borderColor: selectedList === 'unread' ? colors.main : colors.mutedText, backgroundColor: selectedList === 'unread' ? colors.main : 'transparent', borderRadius: 15, width: '48%', alignItems: 'center' }}>
                                <AppText style={{ color: 'white', fontWeight: 'bold' }}>Unread</AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Divider orientation='horizontal' style={{ marginVertical: 25 }} />
                    {visibleList.length > 0 ? (
                        <View>
                            {visibleList.map((friend, i) => (
                                <TouchableOpacity
                                    onPress={() => console.log('go to messaging')}
                                    style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                                    key={i}
                                >
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity onPress={() => handleProfilePress(friend)} style={styles.imageWrapper}>
                                            <Image source={friend.image} style={{ width: 50, height: 50, borderRadius: 25 }} />
                                        </TouchableOpacity>
                                        <View style={{ marginStart: 15, justifyContent: 'center' }}>
                                            <AppText style={[styles.cardLabel, { fontWeight: 'bold', fontSize: scaleFont(15) }]}>
                                                {friend.firstname} {friend.lastname}
                                            </AppText>
                                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12) }}>
                                                I have news for you
                                            </AppText>
                                        </View>
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <AppText style={{ color: colors.mutedText }}>
                                            10/6/25{/* day or hour depending when message was sent */}
                                        </AppText>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                    ) : (
                        friendsList.length > 0 ? (
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, margin: 15 }}>
                                <Image source={Images.sad} style={{ width: 100, height: 100, tintColor: colors.mutedText + '40' }} />
                                <AppText style={{ color: colors.mutedText + '60', fontWeight: 'bold', fontSize: scaleFont(25), marginTop: 15 }}>
                                    Your friends list is empty
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(15), marginTop: 5, textAlign: 'center' }}>
                                    Explore the app, contribute to the community, make new friends, and grow your network.
                                </AppText>
                                <AnimatedButton
                                    title="Community Hub"
                                    onPress={() => console.log('replace with hub later')}
                                    style={{ marginTop: 20, padding: 15, borderRadius: 20, width: 200, backgroundColor: colors.main }}
                                />
                            </View>
                        ) :
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, margin: 15 }}>
                                <Image source={Images.sad} style={{ width: 100, height: 100, tintColor: colors.mutedText + '40' }} />
                                <AppText style={{ color: colors.mutedText + '60', fontWeight: 'bold', fontSize: scaleFont(25), marginTop: 15 }}>
                                    Your friends list is empty
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(15), marginTop: 5, textAlign: 'center' }}>
                                    Explore the app, contribute to the community, make new friends, and grow your network.
                                </AppText>
                                <AnimatedButton
                                    title="Community Hub"
                                    onPress={() => console.log('replace with hub later')}
                                    style={{ marginTop: 20, padding: 15, borderRadius: 20, width: 200, backgroundColor: colors.main }}
                                />
                            </View>
                    )}
                </View>
            ) : (
                <View style={{ marginTop: 15 }}>
                    <View style={[styles.card, { height: '40%' }]} />
                    <View style={[styles.card, { height: '50%', marginTop: 25 }]} />
                </View>
            )}
        </AppScroll>
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
    label: { fontSize: scaleFont(16), color: 'white', fontWeight: 'bold' },
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
    inputStripped: {
        height: 50,
        color: "white",
        width: '100%',
    },
    input: {
        height: 50,
        color: "white",
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 15,
        marginHorizontal: 15,
        backgroundColor: colors.inputBackground
    },
});