import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, StyleSheet, TouchableOpacity, View, Platform, Keyboard, Dimensions } from "react-native";
import AppText from "../../../components/screen-comps/app-text";
import { Images } from '../../../common/settings/assets';
import { UserContext } from "../../../common/contexts/user-context";
import { formatDate, formatTime, getDayComparisons, getHoursComparisons } from '../../../common/utils/date-time';
import usePopups from "../../../common/hooks/use-popups";
import { scaleFont } from "../../../common/utils/scale-fonts";
import APIService from '../../../common/services/api-service';
import { colors } from "../../../common/settings/styling";
import AppScroll from '../../../components/screen-comps/app-scroll'
import FadeInOut from '../../../components/effects/fade-in-out';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StaticIcons from "../../../components/screen-comps/static-icons";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import SlideInOut from "../../../components/effects/slide-in-out";
import SocketService from "../../../common/services/socket-service";
import FloatingActionButton from "../../../components/screen-comps/floating-action-button";

export default function Chat() {
    const { user, setUser, additionalContexts } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);
    const initialScrollDone = useRef(false);

    const [fabVisible, setFabVisible] = useState(false);

    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    const [roomId, setRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessageText, setNewMessageText] = useState(false);

    const [message, setMessage] = useState('');
    const [messageHeight, setMessageHeight] = useState(50);
    const messagesRef = useRef(messages);

    useEffect(() => {
        if (!initialScrollDone.current && messages.length > 0) {
            initialScrollDone.current = true;

            // Wait for rendering
            setTimeout(() => {
                scrollRef.current?.scrollToBottom({ animated: false });
            }, 0);
        }

        if (messages[messages.length - 1]?.senderId === user.id) {
            setTimeout(() => {
                scrollRef.current?.scrollToBottom({ animated: false });
            }, 0);
        }
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        const showListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setKeyboardOpen(true);
            }
        );
        const hideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                setKeyboardOpen(false);
            }
        );

        return () => {
            showListener.remove();
            hideListener.remove();
        };
    }, []);

    useEffect(() => {
        async function fetchMessages() {
            const friendId = additionalContexts.chattingFriendProfile.id;
            const payload = {
                userId: user.id,
                friendId
            }

            try {
                const result = await APIService.userToUser.chat.messages(payload);
                const messages = result.data?.messages;

                setMessages(messages);
            } catch (error) {
                console.log(error);
            } finally {
            }
        }

        fetchMessages();
    }, []);

    useEffect(() => {
        const profile = additionalContexts.chattingFriendProfile;
        if (!profile || !user?.id) return;

        const friendId = profile.id;
        const chatRoomId = user.friends.find(f => f.friendId === friendId).chatRoomId;
        setRoomId(chatRoomId);

        SocketService.joinRoom(chatRoomId);
        SocketService.on("new-message", (msg) => {
            console.log('crashes here?')
            if (msg.chatRoomId === chatRoomId) {
                if (!msg.seenBy.includes(user.id))
                    msg.seenBy.push(user.id);
                setMessages((prev) => [...prev, msg]);

                if (msg.senderId !== user.id) {
                    const isScrolledUp = scrollRef.current?.isScrolledToBottom(1000);
                    if (isScrolledUp) {
                        setNewMessageText(true);
                        setTimeout(() => setNewMessageText(false), 2000);
                        setFabVisible(true);
                    }
                }
            }
        });

        return () => {
            const messageIds = messagesRef.current.map(m => m.id);
            if (messageIds.length > 0) {
                SocketService.emit("mark-seen", {
                    userId: user.id,
                    messageIds,
                });
            }

            SocketService.emit("leave-room", chatRoomId);

            const lastMessageDetails = messagesRef.current[messagesRef.current.length - 1];
            if (!lastMessageDetails) return;

            const lastMessage = lastMessageDetails.message;
            const lastMessageTime = lastMessageDetails.dateTimeSent;
            const lastMessageSenderId = lastMessageDetails.senderId;

            setUser(prev => ({
                ...prev,
                friends: prev.friends.map(f =>
                    f.chatRoomId === chatRoomId
                        ? { ...f, lastMessage, lastMessageTime, unreadCount: 0, lastMessageSenderId }
                        : f
                )
            }));
        };
    }, [additionalContexts.chattingFriendProfile]);

    async function handleMessageSend() {
        if (!message.trim()) return;

        const payload = {
            senderId: user.id,
            receiverId: additionalContexts.chattingFriendProfile.id,
            chatRoomId: roomId,
            message,
            seenBy: [user.id],
            extraInformation: {},
            dateTimeSent: new Date()
        };

        setMessage('');
        SocketService.emit("send-message", payload, (newMessageId) => {
            payload.id = newMessageId;
            setMessages(prev => [...prev, payload]);
        });
    }

    async function handleImportPlan() {
        //TODO IMPORT PLANS, can work both ways 
        console.log('importing some plans')
    }

    return (
        <>
            <FadeInOut visible={newMessageText} style={{ position: 'absolute', bottom: insets.bottom + 150 + keyboardHeight, backgroundColor: colors.cardBackground, padding: 15, borderRadius: 20, alignItems: 'center', alignSelf: 'center', zIndex: 9999 }}>
                <AppText style={{ color: 'white', fontWeight: 'bold' }}>New unread message</AppText>
            </FadeInOut>
            <FloatingActionButton
                onPress={() => {
                    scrollRef.current.scrollToBottom()
                    setFabVisible(false);
                    setNewMessageText(false);
                }}
                visible={fabVisible}
                position={{ bottom: insets.bottom + 100 + keyboardHeight, left: Dimensions.get('window').width / 2 - 20 }}
                icon={Images.arrow}
                iconStyle={{ transform: [{ rotate: '90deg' }], marginTop: 3 }}
                iconSize={20}
                size={40}
            />
            <FadeInOut visible={true} style={{ position: 'absolute', bottom: 0, paddingBottom: insets.bottom + 10 + keyboardHeight, paddingTop: 10, zIndex: 9999, flexDirection: 'row', paddingHorizontal: 15, backgroundColor: 'rgba(0, 0, 0, 0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
                <View style={{ width: '85%', minHeight: 50, maxHeight: 120, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <AppTextInput
                        multiline
                        onChangeText={setMessage}
                        value={message}
                        placeholder="Type a message..."
                        placeholderTextColor={"rgba(255, 255, 255, 0.4)"}
                        style={[styles.inputStripped, { height: Math.min(120, Math.max(50, messageHeight)), width: '82%' }]}
                        onContentSizeChange={(e) =>
                            setMessageHeight(e.nativeEvent.contentSize.height)
                        } />
                    <TouchableOpacity style={{ width: '18%', height: 50, justifyContent: 'center', alignItems: 'center' }} onPress={handleImportPlan}>
                        <Image source={Images.plus} style={{ width: 22, height: 22, tintColor: colors.mutedText }} />
                    </TouchableOpacity>
                </View>
                <View style={{ width: '15%', alignSelf: 'flex-end' }}>
                    <TouchableOpacity onPress={handleMessageSend} style={{ padding: 15, height: 50, backgroundColor: colors.main, width: 50, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', borderRadius: 25 }}>
                        <Image source={Images.arrow} style={{ width: 22, height: 22, tintColor: 'white' }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </FadeInOut>
            <View style={styles.main}>
                <View>
                    <AppScroll ref={scrollRef} extraBottom={keyboardOpen ? keyboardHeight - 65 : 75}>
                        {messages && messages.length > 0 &&
                            messages.map((message, index) => {
                                const isUser = message.senderId === user.id;
                                const messageTimeDetails = new Date(message.dateTimeSent);
                                const { isToday, isYesterday } = getDayComparisons(messageTimeDetails);

                                const timeDisplay = isToday
                                    ? formatTime(message.dateTimeSent, { format: user.preferences.timeFormat.key })
                                    : isYesterday
                                        ? `Yesterday, ${formatTime(message.dateTimeSent, { format: user.preferences.timeFormat.key })}`
                                        : `${formatDate(message.dateTimeSent, { format: 'MMM d' })}, ${formatTime(message.dateTimeSent, { format: user.preferences.timeFormat.key })}`;

                                const bubbleStyle = isUser
                                    ? {
                                        backgroundColor: 'rgba(0, 35, 65, 1)',
                                        borderTopLeftRadius: 5,
                                        marginLeft: 10,
                                    }
                                    : {
                                        backgroundColor: 'rgba(255,255,255,0.08)',
                                        borderTopRightRadius: 5,
                                        marginRight: 10,
                                    };

                                const prevMessage = messages[index - 1];
                                const prevDate = prevMessage ? new Date(prevMessage.dateTimeSent) : null;
                                const currentDateStr = messageTimeDetails.toDateString();
                                const prevDateStr = prevDate ? prevDate.toDateString() : null;
                                const showDateDivider = currentDateStr !== prevDateStr;

                                // --- NEW: show unread divider ---
                                const isUnread = !message.seenBy?.includes(user.id);
                                const showUnreadDivider = isUnread && (!prevMessage || prevMessage.seenBy?.includes(user.id));

                                let dayLabel = formatDate(message.dateTimeSent, { format: 'MMM d' });
                                if (isToday) dayLabel = 'Today';
                                else if (isYesterday) dayLabel = 'Yesterday';

                                return (
                                    <View key={index}>
                                        {showDateDivider && (
                                            <View style={{ alignItems: 'center', marginVertical: 15 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                                                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                                    <AppText style={{ color: 'rgba(255,255,255,0.6)', marginHorizontal: 10 }}>{dayLabel}</AppText>
                                                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                                </View>
                                            </View>
                                        )}

                                        {showUnreadDivider && (
                                            <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                                <AppText style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Unread Messages</AppText>
                                            </View>
                                        )}

                                        <View style={{ flexDirection: 'row', justifyContent: isUser ? 'flex-start' : 'flex-end', paddingHorizontal: 5 }}>
                                            <View style={{ maxWidth: '90%', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, ...(isUser ? { marginEnd: 15 } : { marginStart: 15 }) }}>
                                                <View style={[{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 }, bubbleStyle]}>
                                                    <AppText style={{ color: 'white', lineHeight: 20, flexShrink: 1 }}>{message.message}</AppText>
                                                    <AppText style={{ color: 'rgba(255, 255, 255, 0.4)', alignSelf: 'flex-end', marginTop: 5 }}>
                                                        {timeDisplay}
                                                    </AppText>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        }
                    </AppScroll>
                </View >
            </View >
        </>
    );
}
const styles = StyleSheet.create({
    // Updated input styles
    inputStripped: {
        color: "white",
        paddingHorizontal: 15,
        fontSize: 16,
    },

    // New avatar styles
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.main,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },

    // Keep existing styles but update main for better spacing
    main: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 10,
    },

    // ... keep all your existing other styles exactly the same
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