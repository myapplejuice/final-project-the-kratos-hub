import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../components/layout-comps/build-footer";
import AppText from "../../components/screen-comps/app-text";
import { Images } from '../../common/settings/assets';
import { UserContext } from "../../common/contexts/user-context";
import { formatDate, formatTime, getDayComparisons } from '../../common/utils/date-time';
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
import AppImage from '../../components/screen-comps/app-image';

export default function Notifications() {
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [pageLoading, setPageLoading] = useState(true);
    const [selectedList, setSelectedList] = useState('notifications');
    const [requests, setRequests] = useState([]);
    const [openRequest, setOpenRequest] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        async function prepareRequests() {
            try {
                if (!user?.pendingFriends?.length) return;

                const requests = user.pendingFriends.filter(f => f.adderId !== user.id);
                const idList = requests.map(f => f.adderId);

                showSpinner();
                const result = await APIService.userToUser.multipleAnotherProfile(idList);

                if (result.success) {
                    const profiles = result.data.profiles;

                    for (let i = 0; i < requests.length; i++) {
                        const profile = profiles.find(p => p.id === requests[i].adderId);
                        requests[i].profile = profile;
                    }

                    setRequests(requests);
                } else {
                    createAlert({ title: 'Failure', text: result.message });
                }
            } catch (error) {
                createAlert({ title: 'Failure', text: error.message });
                console.error(error);
            } finally {
                hideSpinner();
                setPageLoading(false);
            }
        }

        async function confirmSeen() {
            try {
                const notSeenNotificationsIds = user.notifications.filter(n => !n.seen).map(n => n.id);

                const result = await APIService.notifications.seen(notSeenNotificationsIds);
                if (!result.success) {
                    createAlert({ title: 'Failure', text: result.message });
                }
            } catch (error) {
                createAlert({ title: 'Failure', text: error.message });
                console.error(error);
            }
        }

        function setUserNotificationsSeen() {
            setUser(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, seen: true })) }));
        }

        prepareRequests();
        setNotifications(user.notifications);
        confirmSeen();
        return () => setUserNotificationsSeen();
    }, []);

    useEffect(() => {
        setNotifications(user.notifications);
    }, [user.notifications]);

    async function handleFriendRequest(reply, request) {
        createDialog({
            title: 'Friend Request',
            text: `Are you sure you want to ${reply} this friend request?`,
            onConfirm: async () => {
                showSpinner();

                try {
                    const payload = {
                        id: request.id,
                        reply,
                        adderId: request.adderId,
                        receiverId: user.id
                    };

                    const result = await APIService.userToUser.replyRequest(payload);

                    if (result.success) {
                        const newFriendshipId = result.data.id;
                        const chatRoomId = result.data.chatRoomId;

                        setUser(prev => ({
                            ...prev,
                            pendingFriends: prev.pendingFriends.map(f =>
                                f.id === request.id ? { ...f, status: reply } : f
                            ),
                            friends: reply === 'accepted'
                                ? [...prev.friends, {
                                    id: newFriendshipId, friendId: request.adderId,
                                    status: 'active', lastMessage: null, lastMessageTime: null,
                                    lastMessageSenderId: null, lastMessageId: null,
                                    lastMessageHidden: false, lastMessageDiscarded: false,
                                    unreadCount: 0, chatRoomId
                                }]
                                : prev.friends
                        }));

                        setRequests(prevRequests =>
                            prevRequests.map(r =>
                                r.id === request.id ? { ...r, status: reply } : r
                            )
                        );

                    } else {
                        createAlert({ title: 'Failure', text: result.message });
                    }
                } catch (error) {
                    createAlert({ title: 'Failure', text: error.message });
                    console.error(error);
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    async function handleNotificationPress(notification) {
        if (notification.clickableDestination === 'profile') {
            router.push({
                pathname: routes.USER_PROFILE,
                params: {
                    userId: notification.clickableInfo.userId
                }
            })
        }else if (notification.clickableDestination === 'user-post') {
            const result = await APIService.community.post({postId: notification.clickableInfo.postId});
            const post = result.data.post;

            console.log(post)
            router.push({
                pathname: routes.USER_POST,
                params: {
                    post: JSON.stringify(post)
                }
            })
        }
    }

    function handleProfile(profile) {
        router.push({
            pathname: routes.USER_PROFILE,
            params: {
                userId: profile.id
            }
        })
    }

    return (
        <View style={[styles.main]}>
            {!pageLoading ? (
                <AppScroll extraBottom={20} extraTop={30} contentStyle={{ padding: 15 }}>
                    <View style={{ flexDirection: 'row', height: 50, borderRadius: 15, justifyContent: 'space-between', marginTop: 15, }}  >
                        <TouchableOpacity onPress={() => setSelectedList('notifications')}
                            style={{
                                justifyContent: 'center', alignItems: 'center', width: '48%',
                                backgroundColor: selectedList === 'notifications' ? colors.main : 'transparent',
                                borderColor: selectedList === 'notifications' ? colors.main : colors.mutedText,
                                borderWidth: 1, marginVertical: 5, marginStart: 5, borderRadius: 15
                            }}>
                            <AppText style={{ color: 'white', fontWeight: 'bold' }}>
                                Notifications
                            </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedList('friendRequests')}
                            style={{
                                justifyContent: 'center', alignItems: 'center', width: '48%',
                                backgroundColor: selectedList === 'friendRequests' ? colors.main : 'transparent',
                                borderColor: selectedList === 'friendRequests' ? colors.main : colors.mutedText,
                                borderWidth: 1, marginVertical: 5, marginStart: 5, borderRadius: 15
                            }}>
                            <AppText style={{ color: 'white', fontWeight: 'bold' }}>
                                Friend Requests
                            </AppText>
                        </TouchableOpacity>
                    </View>
                    <Divider orientation='horizontal' style={{ marginVertical: 25 }} />
                    {selectedList === 'friendRequests' &&
                        <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
                                <AppText style={styles.label}>Friend Requests</AppText>
                                {requests.filter(r => r.status === 'pending').length > 0 &&
                                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: 'red', borderWidth: 1, borderColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
                                        <AppText style={{ color: 'white', fontSize: scaleFont(12) }}>{requests.filter(r => r.status === 'pending').length}</AppText>
                                    </View>
                                }
                            </View>
                            {requests.length > 0 ? (
                                requests.map((request, index) => {
                                    const profile = request.profile || {};
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => request.status === 'pending' ? setOpenRequest(prev => (prev === profile.id ? null : profile.id)) : handleProfile(profile)}
                                            style={{ marginBottom: index === requests.length - 1 ? 0 : 15, backgroundColor: colors.cardBackground + '60', padding: 15, borderRadius: 15 }}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: 'row', width: '70%' }}>
                                                    <View style={{ marginEnd: 15 }}>
                                                        <Image
                                                            source={{ uri: profile.imageURL } || Images.profilePic}
                                                            cachePolicy="disk"
                                                            style={{ width: 50, height: 50, borderRadius: 25 }}
                                                        />
                                                    </View>
                                                    <View style={{ justifyContent: 'center' }}>
                                                        <AppText style={{ color: 'white', fontSize: scaleFont(14), fontWeight: 'bold' }}>
                                                            {profile.firstname || 'Unknown'} {profile.lastname || ''}
                                                        </AppText>
                                                        <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12) }}>
                                                            {(() => {
                                                                const messageTimeDetails = new Date(request.dateOfCreation);
                                                                const timeComparisons = getDayComparisons(messageTimeDetails);
                                                                const isToday = timeComparisons.isToday;
                                                                const isYesterday = timeComparisons.isYesterday;

                                                                return isToday
                                                                    ? formatTime(messageTimeDetails, { format: user.preferences.timeFormat.key })
                                                                    : isYesterday
                                                                        ? 'Yesterday'
                                                                        : formatDate(messageTimeDetails, { format: user.preferences.dateFormat.key });
                                                            })()}
                                                        </AppText>
                                                    </View>
                                                </View>
                                                <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-end' }}>
                                                    {request.status === 'pending' ?
                                                        <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                                            <Invert axis='horizontal' inverted={openRequest === profile.id}>
                                                                <Image
                                                                    source={Images.arrow}
                                                                    style={{
                                                                        width: 20,
                                                                        height: 20,
                                                                        tintColor: 'white',
                                                                        transform: [{ rotate: '-90deg' }],
                                                                    }}
                                                                />
                                                            </Invert>
                                                        </View>
                                                        : <AppText style={{ alignSelf: 'flex-end', color: request.status === 'accepted' ? colors.accentGreen : colors.accentPink }}>{request.status === 'accepted' ? 'Accepted' : 'Declined'}</AppText>}
                                                </View>
                                            </View>
                                            {request.status === 'pending' &&
                                                <ExpandInOut visible={openRequest === profile.id}>
                                                    <AppText
                                                        style={{
                                                            color: colors.mutedText,
                                                            textAlign: request.description ? 'left' : 'center',
                                                            marginVertical: 15,
                                                        }}
                                                    >
                                                        {request.description || 'No introduction provided'}
                                                    </AppText>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                                                        <TouchableOpacity
                                                            onPress={() => handleFriendRequest('declined', request)}
                                                            style={{
                                                                padding: 15,
                                                                borderRadius: 10,
                                                                backgroundColor: colors.accentPink,
                                                                width: '48%',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <AppText style={{ color: 'white' }}>Decline</AppText>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => handleFriendRequest('accepted', request)}
                                                            style={{
                                                                padding: 15,
                                                                borderRadius: 10,
                                                                backgroundColor: colors.accentGreen,
                                                                width: '48%',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <AppText style={{ color: 'white' }}>Accept</AppText>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <AnimatedButton
                                                        onPress={() => handleProfile(request.profile)}
                                                        style={{
                                                            padding: 15,
                                                            borderRadius: 10,
                                                            backgroundColor: colors.main,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            marginTop: 15
                                                        }}
                                                        rightImage={Images.arrow}
                                                        rightImageStyle={{ width: 15, height: 15, tintColor: 'white', marginStart: 5 }}
                                                        textStyle={{ color: 'white', fontSize: scaleFont(12) }}
                                                        title={'View Profile'}
                                                    />
                                                </ExpandInOut>}
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', textAlign: 'center', marginVertical: 40 }}>
                                    No friend requests
                                </AppText>
                            )}
                        </View>
                    }
                    {selectedList === 'notifications' &&
                        <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
                                <AppText style={styles.label}>Notifications</AppText>
                                {notifications.filter(n => !n.seen).length > 0 &&
                                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: 'red', borderWidth: 1, borderColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
                                        <AppText style={{ color: 'white', fontSize: scaleFont(12) }}>{notifications.filter(n => !n.seen).length}</AppText>
                                    </View>
                                }
                            </View>
                            {notifications.length > 0 ? (
                                <>
                                    {notifications.map((notification, index) => {
                                        const isLastUnseen = !notification.seen && (index === notifications.findIndex(n => n.seen) - 1 || index === notifications.filter(n => !n.seen).length - 1);
                                        const seenNotificationsExist = notifications.some(n => n.seen);

                                        const messageTimeDetails = new Date(notification.dateOfCreation);
                                        const timeComparisons = getDayComparisons(messageTimeDetails);
                                        const isToday = timeComparisons.isToday;
                                        const isYesterday = timeComparisons.isYesterday;

                                        const displayTime =
                                            isToday ? formatTime(messageTimeDetails, { format: user.preferences.timeFormat.key }) :
                                                isYesterday ? 'Yesterday' :
                                                    formatDate(messageTimeDetails, { format: user.preferences.dateFormat.key });

                                        return (
                                            <View key={notification.id}>
                                                <TouchableOpacity style={{ marginBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => notification.clickable && handleNotificationPress(notification)}>
                                                    <View style={{
                                                        borderStartColor: notification.seen ? colors.mutedText : notification.sentiment === 'negative' ? colors.negativeRed : notification.sentiment === 'positive' ? colors.accentGreen : 'white',
                                                        borderStartWidth: 2, paddingStart: 15, width:  notification.clickableDestination === 'user-post' ? '80%' : '100%'
                                                    }}>
                                                        <AppText style={{ fontSize: scaleFont(13), fontWeight: '600', color: notification.seen ? colors.mutedText : 'white' }}>
                                                            {notification.notification}
                                                        </AppText>
                                                        <AppText style={{ fontSize: scaleFont(11), fontWeight: '600', color: colors.mutedText, marginTop: 5, alignSelf: 'flex-start' }}>
                                                            {displayTime}
                                                        </AppText>
                                                    </View>
                                                    {notification.clickableDestination === 'user-post' && notification.clickableInfo.postImageURL &&
                                                        <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                                                            <AppImage source={{uri: notification.clickableInfo.postImageURL}} style={{ width: 60, height: 60, borderRadius: 10 }} resizeMode='contain' />
                                                        </View>
                                                    }
                                                </TouchableOpacity>
                                                {isLastUnseen && seenNotificationsExist && <Divider orientation='horizontal' style={{ marginVertical: 15 }} />}
                                            </View>
                                        );
                                    })}
                                </>
                            ) : (
                                <AppText style={{ color: colors.mutedText, fontWeight: 'bold', textAlign: 'center', marginVertical: 40 }}>
                                    No notifications
                                </AppText>
                            )}
                        </View>
                    }
                </AppScroll>
            ) : (
                <AppScroll>
                    <View style={[styles.card, { height: '40%' }]} />
                    <View style={[styles.card, { height: '50%', marginTop: 25 }]} />
                </AppScroll>
            )}

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
});