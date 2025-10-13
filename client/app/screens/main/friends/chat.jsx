import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, StyleSheet, TouchableOpacity, View, Platform, Keyboard, Dimensions, Animated } from "react-native";
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
import { Easing } from "react-native";
import AnimatedButton from "../../../components/screen-comps/animated-button";
import ImageCapture from "../../../components/screen-comps/image-capture";
import { LibraryContext } from "../../../common/contexts/library-context";
import { CameraContext } from "../../../common/contexts/camera-context";

export default function Chat() {
    const { createOptions, createDialog, createToast, showSpinner, hideSpinner } = usePopups();
    const { user, setUser, additionalContexts } = useContext(UserContext);
    const { libraryActive, setLibraryActive } = useContext(LibraryContext);
    const { cameraActive, setCameraActive } = useContext(CameraContext);
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);
    const initialScrollDone = useRef(false);
    const apiFetchDebounce = useRef(null);
    const currentPage = useRef(1);
    const morePages = useRef(true);

    const [chatBarVisible, setChatBarVisible] = useState(true);
    const [uploadOptionsVisible, setUploadOptionsVisible] = useState(false);
    const [fabVisible, setFabVisible] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const rotate = useRef(new Animated.Value(0)).current;
    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    const [roomId, setRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessageText, setNewMessageText] = useState(false);

    const [message, setMessage] = useState('');
    const [messageHeight, setMessageHeight] = useState(50);
    const messagesRef = useRef(messages);

    useEffect(() => {
        if (cameraActive || libraryActive) {
            setUploadOptionsVisible(false);
            setChatBarVisible(false);
        } else {
            setChatBarVisible(true);
        }
    }, [cameraActive, libraryActive]);

    useEffect(() => {
        if (!initialScrollDone.current && messages.length > 0) {
            initialScrollDone.current = true;

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

        Animated.loop(
            Animated.timing(rotate, {
                toValue: 1,
                duration: 800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    useEffect(() => {
        const profile = additionalContexts.chattingFriendProfile;
        if (!profile || !user?.id) return;

        const friendId = profile.id;
        const chatRoomId = user.friends.find(f => f.friendId === friendId).chatRoomId;
        setRoomId(chatRoomId);

        SocketService.joinRoom(chatRoomId);
        SocketService.on("new-message", (msg) => {
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


    async function fetchMoreMessages() {
        if (morePages.current === false) return;

        const friendId = additionalContexts.chattingFriendProfile.id;
        const payload = {
            userId: user.id,
            friendId,
            page: currentPage.current + 1
        }

        try {
            setIsLoadingMessages(true);
            const result = await APIService.userToUser.chat.messages(payload);
            const newMessages = result.data?.messages || [];

            setMessages(prev => [...newMessages, ...prev]);
            currentPage.current += 1;
            morePages.current = result.data?.hasMore;
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadingMessages(false);
        }
    }

    async function safeTrigger(callback) {
        if (apiFetchDebounce.current) return;
        apiFetchDebounce.current = true;

        try {
            await callback();
        } catch (err) {
            console.log(err);
        } finally {
            setTimeout(() => {
                apiFetchDebounce.current = false;
            }, 500);
        }
    }

    function handleMessageSend(extraInformation = {}) {
        if (Object.keys(extraInformation).length === 0) {
            if (!message.trim()) return;
        }

        const payload = {
            senderId: user.id,
            receiverId: additionalContexts.chattingFriendProfile.id,
            chatRoomId: roomId,
            message: extraInformation?.context === 'mealplan' ? 'Imported plan' : message,
            seenBy: [user.id],
            extraInformation: extraInformation,
            dateTimeSent: new Date()
        };

        setMessage('');
        SocketService.emit("send-message", payload, (newMessageId) => {
            payload.id = newMessageId;
            setMessages(prev => [...prev, payload]);
        });
        setTimeout(() => {
            scrollRef.current?.scrollToBottom({ animated: false });
        }, 0);
    }

    async function handleImportPlan() {
        const userPlans = user.plans;

        createOptions({
            title: 'Select a plan',
            options: userPlans.map(p => p.label),
            values: userPlans.map(p => p.id),
            onConfirm: (selected, value) => {
                console.log(selected, value);
                if (!selected || !value) return;

                const plan = userPlans.find(p => p.id === value);

                console.log(plan.id)
                const extraInformation = {
                    context: 'mealplan',
                    planId: plan.id,
                    planLabel: plan.label,
                    planDescription: plan.description,
                };

                handleMessageSend(extraInformation);
            }
        })
    }

    async function handleMealPlanSave(mealPlanId, senderId) {
        const result = await APIService.nutrition.mealPlans.otherUserPlans({ userId: senderId });
        const plans = result.data?.plans;
        const plan = plans?.find(p => p.id === mealPlanId);

        createDialog({
            title: 'Save meal plan',
            text: 'Do you want to clone and save this meal plan?',
            onConfirm: async () => {
                const payload = {
                    plan,
                    newUserId: user.id,
                    sourcePlanUsername: additionalContexts.chattingFriendProfile.firstname + ' ' + additionalContexts.chattingFriendProfile.lastname
                }

                const result = await APIService.nutrition.mealPlans.clone(payload);
                if (result.success) {
                    const plan = result.data?.plan;
                    setUser(prev => ({
                        ...prev,
                        plans: [plan, ...prev.plans]
                    }));
                    createToast({ message: 'Meal plan saved, you can find it in your nutrition section' });
                } else {
                    createToast({ message: 'Failed to save meal plan' });
                }
            }
        })
    }

    async function handleImageUpload(asset) {
        setLibraryActive(false);
        setCameraActive(false);
        showSpinner();

        try {
            const url = await APIService.uploadImageToCloudinary({
                uri: asset.uri,
                folder: "chat_images",
                fileName: `chat_room${roomId}_user${user.id}_${Date.now()}.jpg`,
            });

            console.log("Cloudinary URL:", url);

            handleMessageSend({
                context: "image",
                imageUrl: url,
            });
        } catch (err) {
            console.error("Image upload failed:", err);
        } finally {
            hideSpinner();
        }
    }

    return (
        <>
            <ImageCapture onCancel={() => setChatBarVisible(true)} onConfirm={(asset) => handleImageUpload(asset)} />

            {/* New Message Indicator */}
            <FadeInOut visible={newMessageText} style={{
                position: 'absolute',
                bottom: insets.bottom + 150 + keyboardHeight,
                backgroundColor: colors.main,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 25,
                alignItems: 'center',
                alignSelf: 'center',
                zIndex: 9999,
                shadowColor: colors.main,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5
            }}>
                <AppText style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(12) }}>New unread message</AppText>
            </FadeInOut>

            {/* Floating Action Button */}
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

            {/* Upload Options */}
            <FadeInOut visible={uploadOptionsVisible} style={{
                position: 'absolute',
                bottom: insets.bottom + 80 + keyboardHeight,
                left: 20,
                right: 20,
                zIndex: 9999,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(40, 40, 40, 0.95)',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                paddingHorizontal: 10
            }}>
                <TouchableOpacity onPress={handleImportPlan} style={{ padding: 15, alignItems: 'center', flex: 1 }}>
                    <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(74, 144, 226, 0.2)' }]}>
                        <Image source={Images.mealPlan} style={{ width: 24, height: 24, tintColor: '#4A90E2' }} />
                    </View>
                    <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5 }}>Meal plan</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCameraActive(true)} style={{ padding: 15, alignItems: 'center', flex: 1 }}>
                    <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(52, 199, 89, 0.2)' }]}>
                        <Image source={Images.camera} style={{ width: 24, height: 24, tintColor: '#34C759' }} />
                    </View>
                    <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5 }}>Camera</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setLibraryActive(true)} style={{ padding: 15, alignItems: 'center', flex: 1 }}>
                    <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(255, 149, 0, 0.2)' }]}>
                        <Image source={Images.image} style={{ width: 24, height: 24, tintColor: '#FF9500' }} />
                    </View>
                    <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5 }}>Image</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 15, alignItems: 'center', flex: 1 }}>
                    <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(175, 82, 222, 0.2)' }]}>
                        <Image source={Images.doc} style={{ width: 24, height: 24, tintColor: '#AF52DE' }} />
                    </View>
                    <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5 }}>Document</AppText>
                </TouchableOpacity>
            </FadeInOut>

            {/* Chat Input Bar */}
            <FadeInOut visible={chatBarVisible} style={{
                position: 'absolute',
                bottom: 0,
                paddingBottom: insets.bottom + 10 + keyboardHeight,
                paddingTop: 10,
                zIndex: 9999,
                flexDirection: 'row',
                paddingHorizontal: 15,
                backgroundColor: 'rgba(30, 30, 30, 0.98)',
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.15)'
            }}>
                <View style={{
                    width: '85%',
                    minHeight: 50,
                    maxHeight: 120,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 25,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.15)',
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    paddingLeft: 15
                }}>
                    <AppTextInput
                        multiline
                        onChangeText={setMessage}
                        value={message}
                        placeholder="Type a message..."
                        placeholderTextColor={"rgba(255, 255, 255, 0.4)"}
                        style={[styles.inputStripped, {
                            height: Math.min(120, Math.max(50, messageHeight)),
                            width: '82%',
                            paddingVertical: 15
                        }]}
                        onContentSizeChange={(e) =>
                            setMessageHeight(e.nativeEvent.contentSize.height)
                        } />
                    <TouchableOpacity
                        style={{
                            width: '18%',
                            height: 50,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        onPress={() => setUploadOptionsVisible(!uploadOptionsVisible)}
                    >
                        <View style={styles.plusButton}>
                            <Image source={Images.plus} style={{ width: 20, height: 20, tintColor: 'white' }} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ width: '15%', alignSelf: 'flex-end', marginLeft: 10 }}>
                    <TouchableOpacity onPress={handleMessageSend} style={styles.sendButton}>
                        <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </FadeInOut>

            {/* Loading Spinner */}
            <FadeInOut visible={isLoadingMessages} style={{ position: 'absolute', top: 100, alignSelf: 'center', zIndex: 9999 }}>
                <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
            </FadeInOut>

            {/* Messages Container */}
            <View style={styles.main}>
                <View style={{ flex: 1 }}>
                    <AppScroll onScrollToTop={() => safeTrigger(fetchMoreMessages)} ref={scrollRef} extraBottom={keyboardOpen ? keyboardHeight - 65 : 75}>
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
                                    ? styles.userBubble
                                    : styles.theirBubble;

                                const prevMessage = messages[index - 1];
                                const prevDate = prevMessage ? new Date(prevMessage.dateTimeSent) : null;
                                const currentDateStr = messageTimeDetails.toDateString();
                                const prevDateStr = prevDate ? prevDate.toDateString() : null;
                                const showDateDivider = currentDateStr !== prevDateStr;

                                const isUnread = !message.seenBy?.includes(user.id);
                                const showUnreadDivider = isUnread && (!prevMessage || prevMessage.seenBy?.includes(user.id));

                                let dayLabel = formatDate(message.dateTimeSent, { format: 'MMM d' });
                                if (isToday) dayLabel = 'Today';
                                else if (isYesterday) dayLabel = 'Yesterday';

                                return (
                                    <View key={index}>
                                        {showDateDivider && (
                                            <View style={styles.dateDivider}>
                                                <View style={styles.dateDividerLine} />
                                                <AppText style={styles.dateDividerText}>{dayLabel}</AppText>
                                                <View style={styles.dateDividerLine} />
                                            </View>
                                        )}

                                        {showUnreadDivider && (
                                            <View style={styles.unreadDivider}>
                                                <AppText style={styles.unreadDividerText}>Unread Messages</AppText>
                                            </View>
                                        )}

                                        <View style={[
                                            styles.messageContainer,
                                            isUser ? styles.userMessageContainer : styles.theirMessageContainer
                                        ]}>
                                            <View style={[
                                                styles.messageBubble,
                                                bubbleStyle,
                                                isUser ? styles.userMessageBubble : styles.theirMessageBubble
                                            ]}>
                                                {Object.keys(message?.extraInformation)?.length > 0 &&
                                                    message.extraInformation?.context === 'mealplan' ? (
                                                    <View style={styles.mealPlanContainer}>
                                                        <AppText style={styles.mealPlanTitle}>
                                                            {message.extraInformation.planLabel}
                                                        </AppText>
                                                        <AppText style={styles.mealPlanDescription}>
                                                            {message.extraInformation.planDescription}
                                                        </AppText>
                                                        {message.senderId !== user.id &&
                                                            user.plans.find(p => p.sourcePlanId === message.extraInformation.planId) === undefined ?
                                                            <AnimatedButton
                                                                onPress={() => handleMealPlanSave(message.extraInformation.planId, message.senderId)}
                                                                title={'Save Plan'}
                                                                style={styles.savePlanButton}
                                                                textStyle={styles.savePlanButtonText} />
                                                            :
                                                            user.id !== message.senderId &&
                                                            <View style={styles.savedPlanContainer}>
                                                                <Image source={Images.checkMark} style={styles.checkMark} />
                                                                <AppText style={styles.savedPlanText}>
                                                                    Plan Saved
                                                                </AppText>
                                                            </View>
                                                        }
                                                    </View>
                                                ) : message.extraInformation?.context === 'image' && (
                                                    <View style={styles.imageContainer}>
                                                        <Image
                                                            source={{ uri: message.extraInformation.imageUrl }}
                                                            style={[styles.messageImage, isUser ? {borderBottomRightRadius: 5} : {borderBottomLeftRadius: 5}]}
                                                        />
                                                    </View>
                                                )}
                                                {message.extraInformation?.context !== 'mealplan' &&
                                                    message.message &&
                                                    <AppText style={[
                                                        styles.messageText,
                                                        { marginTop: message.extraInformation?.context === 'mealplan' ? 10 : 0 }
                                                    ]}>
                                                        {message.message}
                                                    </AppText>
                                                }
                                                <AppText style={styles.messageTime}>
                                                    {timeDisplay}
                                                </AppText>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        }
                    </AppScroll>
                </View>
            </View>
        </>
    );
}
const styles = StyleSheet.create({
    // Input Styles
    inputStripped: {
        color: "white",
        paddingHorizontal: 0,
        fontSize: 16,
        backgroundColor: 'transparent',
    },
    plusButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        padding: 15,
        height: 50,
        backgroundColor: colors.main,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        borderRadius: 25,
        shadowColor: colors.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },

    // Upload Options
    uploadOptionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },

    // Message Styles
    main: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 5,
    },
    messageContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginBottom: 8,
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    theirMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: 'rgba(0, 35, 65, 1)',
        borderBottomRightRadius: 5,
    },
    theirBubble: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderBottomLeftRadius: 5,
    },
    userMessageBubble: {
        marginLeft: '20%',
    },
    theirMessageBubble: {
        marginRight: '20%',
    },
    messageText: {
        color: 'white',
        lineHeight: 20,
        flexShrink: 1,
        fontSize: scaleFont(14),
    },
    messageTime: {
        color: 'rgba(255, 255, 255, 0.4)',
        alignSelf: 'flex-end',
        marginTop: 4,
        fontSize: scaleFont(10),
    },

    // Date and Unread Dividers
    dateDivider: {
        alignItems: 'center',
        marginVertical: 20,
    },
    dateDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dateDividerText: {
        color: 'rgba(255,255,255,0.6)',
        marginHorizontal: 12,
        fontSize: scaleFont(12),
        fontWeight: '500',
    },
    unreadDivider: {
        alignItems: 'center',
        marginVertical: 15,
        paddingVertical: 5,
    },
    unreadDividerText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        fontSize: scaleFont(11),
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    // Meal Plan Styles
    mealPlanContainer: {
        minWidth: 200,
    },
    mealPlanTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: scaleFont(15),
        marginBottom: 4,
    },
    mealPlanDescription: {
        color: colors.mutedText,
        fontWeight: '600',
        fontSize: scaleFont(12),
        marginBottom: 12,
    },
    savePlanButton: {
        backgroundColor: colors.main,
        marginTop: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    savePlanButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: scaleFont(12),
    },
    savedPlanContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        justifyContent: 'center',
    },
    checkMark: {
        width: 16,
        height: 16,
        tintColor: '#34C759',
    },
    savedPlanText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: scaleFont(12),
        marginStart: 6,
    },

    // Image Message Styles
    imageContainer: {
        marginTop: 4,
        marginBottom: 4,
    },
    messageImage: {
        width: 250,
        height: 250,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        borderBottomLeftRadius: 16,
    },

    // Spinner
    spinner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderTopColor: colors.main,
        borderRightColor: 'transparent',
        borderBottomColor: colors.main,
        borderLeftColor: 'transparent',
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