import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../components/layout-comps/build-footer";
import AppText from "../../components/screen-comps/app-text";
import { Images } from '../../common/settings/assets';
import { UserContext } from "../../common/contexts/user-context";
import { formatDate, formatTime, getDayComparisons, getHoursComparisons } from '../../common/utils/date-time';
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
    const { user, setAdditionalContexts } = useContext(UserContext);
    const [friendsList, setFriendsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedList, setSelectedList] = useState('active');
    const [visibleList, setVisibleList] = useState([]);

    useEffect(() => {
        async function fetchFriendsProfiles() {
            try {
                const idList = user.friends.map(friend => friend.friendId);
                let profiles = [];

                if (idList.length > 0) {
                    const result = await APIService.userToUser.multipleAnotherProfile(idList);

                    if (result.success) {
                        profiles = result.data.profiles;
                    }
                }

                const activeIds = user.friends.filter(friend => friend.status === 'active').map(friend => friend.friendId);
                setFriendsList(profiles);
                setVisibleList(profiles.filter(profile => activeIds.includes(profile.id)));
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

        fetchFriendsProfiles();
    }, []);

    useEffect(() => {
        const idList = user.friends.filter(friend => friend.status === selectedList).map(friend => friend.friendId);
        const filtered = friendsList.filter(profile => idList.includes(profile.id));
        setVisibleList(filtered);
    }, [selectedList, user.friends]);

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

    function handleFriendClick(chattingFriendProfile, status) {
        setAdditionalContexts({ chattingFriendProfile, friendStatus: status });
        router.push(routes.CHAT)
    }

    return (
        <AppScroll extraBottom={loading ? 0 : 150} avoidKeyboard={false}>
            {!loading ? (
                <View style={{ flex: 1, margin: 15 }}>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.inputBackground, alignItems: 'center', borderRadius: 15, height: 50 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '80%' }}>
                                <Image source={Images.magnifier} style={{ tintColor: colors.mutedText, width: 20, height: 20, marginHorizontal: 15 }} />
                                <AppTextInput
                                    onChangeText={setSearchQuery}
                                    value={searchQuery}
                                    placeholder="Search"
                                    placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                    style={styles.inputStripped} />
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                            <TouchableOpacity onPress={() => setSelectedList('active')} style={{ padding: 10, borderWidth: 1, borderColor: selectedList === 'active' ? colors.main : colors.mutedText, backgroundColor: selectedList === 'active' ? colors.main : 'transparent', borderRadius: 15, width: '48%', alignItems: 'center' }}>
                                <AppText style={{ color: 'white', fontWeight: 'bold' }}>Active Friends</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSelectedList('inactive')} style={{ padding: 10, borderWidth: 1, borderColor: selectedList === 'inactive' ? colors.main : colors.mutedText, backgroundColor: selectedList === 'inactive' ? colors.main : 'transparent', borderRadius: 15, width: '48%', alignItems: 'center' }}>
                                <AppText style={{ color: 'white', fontWeight: 'bold' }}>Blocked Friends</AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Divider orientation='horizontal' style={{ marginVertical: 25 }} />
                    {visibleList.length > 0 ? (
                        <View>
                            {visibleList.map((friend, i) => {
                                const friendship = user.friends.find(f => f.friendId === friend.id) || {};
                                const sender = friendship.lastMessageSenderId === user.id ? 'You: ' : '';
                                const displayMessage = friendship.lastMessage || 'No messages yet';

                                const messageTimeDetails = new Date(friendship.lastMessageTime);
                                const displayTime = (() => {
                                    if (!friendship.lastMessageTime) return '';

                                    const now = new Date();
                                    const diffMs = now - messageTimeDetails;
                                    const diffMinutes = Math.floor(diffMs / 60000);

                                    if (diffMinutes < 1) return 'Just now';
                                    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;

                                    // Only check day comparisons if not recent
                                    const { isToday, isYesterday } = getDayComparisons(messageTimeDetails);

                                    if (isToday) {
                                        return formatTime(messageTimeDetails, { format: user.preferences.timeFormat.key });
                                    } else if (isYesterday) {
                                        return 'Yesterday';
                                    } else {
                                        return formatDate(messageTimeDetails, { format: user.preferences.dateFormat.key });
                                    }
                                })();

                                const isUnread = friendship.unreadCount > 0;

                                return (
                                    <TouchableOpacity
                                        onPress={() => handleFriendClick(friend, friendship.status)}
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 15,
                                            backgroundColor: colors.cardBackground + '80',
                                            padding: 10,
                                            borderRadius: 15,
                                            borderWidth: isUnread ? 2 : 0,
                                            borderColor: isUnread ? colors.mutedText : 'transparent',
                                        }}
                                        key={i}
                                    >
                                        {/* LEFT SIDE: Avatar + Name + Message */}
                                        <View style={{ flexDirection: 'row', flex: 1, marginRight: 10 }}>
                                            <TouchableOpacity
                                                onPress={() => handleProfilePress(friend)}
                                                style={styles.imageWrapper}
                                            >
                                                <Image
                                                    source={{uri: friend.imageURL}}
                                                      cachePolicy="disk"   
                                                    style={{ width: 50, height: 50, borderRadius: 25 }}
                                                />
                                            </TouchableOpacity>

                                            <View style={{ marginStart: 15, justifyContent: 'center', flex: 1 }}>
                                                <AppText
                                                    style={[
                                                        styles.cardLabel,
                                                        { fontWeight: 'bold', fontSize: scaleFont(15) },
                                                    ]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
                                                    {friend.firstname} {friend.lastname}
                                                </AppText>

                                                <AppText
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                    style={{
                                                        color: isUnread ? 'white' : colors.mutedText,
                                                        fontSize: scaleFont(12),
                                                    }}
                                                >
                                                    {sender + displayMessage}
                                                </AppText>
                                            </View>
                                        </View>

                                        {/* RIGHT SIDE: Timestamp */}
                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                            <AppText
                                                style={{
                                                    color: isUnread ? 'white' : colors.mutedText,
                                                    fontSize: scaleFont(11),
                                                }}
                                                numberOfLines={1}
                                            >
                                                {displayTime}
                                            </AppText>
                                        </View>
                                    </TouchableOpacity>

                                );
                            })}
                        </View>

                    ) : (
                        friendsList.length > 0 ? (
                            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, margin: 15 }}>
                                <Image source={Images.noProfile} style={{ width: 100, height: 100, tintColor: colors.mutedText + '40' }} />
                                <AppText style={{ color: colors.mutedText + '60', fontWeight: 'bold', fontSize: scaleFont(25), marginTop: 15 }}>
                                    User not found
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: scaleFont(15), marginTop: 5, textAlign: 'center' }}>
                                    Try a again and make sure your friend is in your friends list
                                </AppText>
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