import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, StyleSheet, TouchableOpacity, View, Platform, Keyboard, Dimensions, Animated, Linking, Image } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
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

    const [noMessageWarningVisible, setNoMessageWarningVisible] = useState(additionalContexts.friendStatus === 'inactive');
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

        Animated.loop(
            Animated.timing(rotate, {
                toValue: 1,
                duration: 800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

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


        fetchMessages();
        return () => {
            showListener.remove();
            hideListener.remove();
        };
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
            message:
                extraInformation?.context === 'mealplan' ? extraInformation.planLabel :
                    extraInformation?.context === 'image' ? extraInformation.imageUrl :
                        extraInformation?.context === 'document' ? extraInformation.documentName :
                            extraInformation?.context === 'invite/whatsapp' ? extraInformation.inviteUrl :
                                message,
            seenBy: [user.id],
            extraInformation: extraInformation,
            dateTimeSent: new Date()
        };

        setMessage('');
        SocketService.emit("send-message", payload, (newMessageId) => {
            payload.id = newMessageId;
            console.log(payload)
            setMessages(prev => [...prev, payload]);
        });
        setTimeout(() => {
            scrollRef.current?.scrollToBottom({ animated: false });
        }, 0);
        setUploadOptionsVisible(false);
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

    async function handleDocumentUpload() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (!result.canceled && result.assets.length > 0) {
                const file = result.assets[0];
                showSpinner();
                const url = await APIService.uploadDocumentToCloudinary({
                    uri: file.uri,
                    folder: "chat_docs",
                    fileName: `chat_room${roomId}_user${user.id}_${Date.now()}_${file.name}`,
                    type: file.mimeType || 'application/octet-stream'
                });

                console.log("Document URL:", url);

                handleMessageSend({
                    context: "document",
                    documentUrl: url,
                    documentName: file.name,
                });
            }
        } catch (err) {
            console.log('Document picking error:', err);
        } finally {
            hideSpinner();
        }
    }

    async function downloadAsset(url, fileName) {
        showSpinner();
        try {
            const fileUri = FileSystem.documentDirectory + fileName;
            const { uri } = await FileSystem.downloadAsync(url, fileUri);

            await Sharing.shareAsync(uri);
            createToast({ message: 'Saved to device' });
        } catch (err) {
            console.error('download failed:', err);
        } finally {
            hideSpinner();
        }
    }

    async function handleWhatsAppInvite() {
        const phoneNumber = user.phone.replace(/\+/g, '');
        const url = `https://wa.me/${phoneNumber}`;

        handleMessageSend({
            context: 'invite/whatsapp',
            senderName: user.firstname,
            inviteUrl: url,
            inviteLabel: 'WhatsApp'
        });
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
            <FadeInOut
                visible={uploadOptionsVisible && message.length === 0}
                style={{
                    position: 'absolute',
                    bottom: insets.bottom + 80 + keyboardHeight,
                    left: 10,
                    right: 10,
                    zIndex: 9999,
                    backgroundColor: 'rgba(40, 40, 40, 0.95)',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                    paddingVertical: 10,
                    paddingHorizontal: 5,
                }}
            >
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {/* Top row: 2 icons aligned left */}
                    <TouchableOpacity onPress={handleImportPlan} style={{ padding: 15, alignItems: 'center', width: '25%' }}>
                        <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(74, 144, 226, 0.2)' }]}>
                            <Image source={Images.mealPlan} style={{ width: 24, height: 24, tintColor: '#4A90E2' }} />
                        </View>
                        <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5 }}>Meal plan</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setCameraActive(true)} style={{ padding: 15, alignItems: 'center', width: '25%' }}>
                        <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(199, 184, 52, 0.2)' }]}>
                            <Image source={Images.camera} style={{ width: 24, height: 24, tintColor: '#eef136ff' }} />
                        </View>
                        <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5 }}>Camera</AppText>
                    </TouchableOpacity>

                    {/* Bottom row: 4 icons */}
                    <TouchableOpacity onPress={() => setLibraryActive(true)} style={{ padding: 15, alignItems: 'center', width: '25%' }}>
                        <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(255, 149, 0, 0.2)' }]}>
                            <Image source={Images.image} style={{ width: 24, height: 24, tintColor: '#FF9500' }} />
                        </View>
                        <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5 }}>Image</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleDocumentUpload} style={{ padding: 15, alignItems: 'center', width: '25%' }}>
                        <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(175, 82, 222, 0.2)' }]}>
                            <Image source={Images.doc} style={{ width: 24, height: 24, tintColor: '#AF52DE' }} />
                        </View>
                        <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5 }}>Document</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleWhatsAppInvite} style={{ padding: 15, alignItems: 'center', width: '25%' }}>
                        <View style={[styles.uploadOptionIcon, { backgroundColor: '#396e3d9c' }]}>
                            <Image source={Images.whatsappTwo} style={{ width: 24, height: 24, tintColor: '#13c422ff' }} />
                        </View>
                        <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5, textAlign: 'center' }}>Whatsapp</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => console.log('instagram')} style={{ padding: 15, alignItems: 'center', width: '25%' }}>
                        <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(255, 45, 85, 0.2)' }]}>
                            <Image source={Images.instagramTwo} style={{ width: 24, height: 24, tintColor: '#FF2D55' }} />
                        </View>
                        <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5, textAlign: 'center' }}>Instagram</AppText>
                    </TouchableOpacity>
                </View>
            </FadeInOut>

            <FadeInOut visible={chatBarVisible && additionalContexts.friendStatus === 'active'} style={{
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
                        editable={additionalContexts.friendStatus === 'active'}
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
                <View style={{ width: '15%', alignSelf: 'flex-end' }}>
                    <TouchableOpacity onPress={handleMessageSend} style={styles.sendButton}>
                        <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </FadeInOut>

            {/* Loading Spinner */}
            <FadeInOut visible={isLoadingMessages} style={{ position: 'absolute', top: 100, alignSelf: 'center', zIndex: 9999 }}>
                <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
            </FadeInOut>

            {additionalContexts.friendStatus === 'inactive' && noMessageWarningVisible && (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setNoMessageWarningVisible(false)}
                    style={{
                        position: 'absolute',
                        bottom: insets.bottom + 50,
                        left: 20,
                        right: 20,
                        backgroundColor: colors.negativeRed, 
                        borderRadius: 15,
                        padding: 15,
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                    }}
                >
                    <AppText style={{ color: 'white', fontSize: scaleFont(13), textAlign: 'center', marginBottom: 5 }}>
                        Messaging is unavailable. Either you or this friend has blocked the other. Chat history remains visible.
                    </AppText>
                    <AppText style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center' }}>
                        Tap to dismiss
                    </AppText>
                </TouchableOpacity>
            )}

            {/* Messages Container */}
            <View style={styles.main}>
                <View style={{ flex: 1 }}>
                    <AppScroll dismissKeyboardOnTap={Platform.OS === 'ios'} onScrollToTop={() => safeTrigger(fetchMoreMessages)} ref={scrollRef} extraBottom={Platform.OS === 'android' && keyboardOpen ? keyboardHeight - 65 : 75}>
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
                                                ) : message.extraInformation?.context === 'image' ? (
                                                    <View style={{ borderRadius: 5, overflow: 'hidden' }}>
                                                        <Image
                                                            source={{ uri: message.extraInformation.imageUrl }}
                                                            style={[{
                                                                width: 300, height: 300, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: 5,
                                                                borderBottomLeftRadius: message.senderId === user.id ? 20 : 0, borderBottomLeftRadius: message.senderId === user.id ? 20 : 0, backgroundColor: 'transparent'
                                                            }]}
                                                            resizeMode="cover"
                                                        />

                                                        <TouchableOpacity
                                                            onPress={() => downloadAsset(message.extraInformation.imageUrl, `The_Kratos_Hub_Chat_${roomId}_image_${Date.now()}.jpg`)}
                                                            style={{
                                                                position: 'absolute',
                                                                bottom: 0,
                                                                right: 0,
                                                                left: 0,
                                                                paddingVertical: 15,
                                                                borderBottomLeftRadius: message.senderId === user.id ? 20 : 0,
                                                                borderBottomLeftRadius: message.senderId === user.id ? 20 : 0,
                                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <Image
                                                                source={Images.arrow}
                                                                style={{ width: 18, height: 18, tintColor: 'white', transform: [{ rotate: '90deg' }], marginTop: 3 }}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>

                                                ) :
                                                    message.extraInformation?.context === 'document' ? (
                                                        <TouchableOpacity
                                                            style={styles.documentContainer}
                                                            onPress={() => Linking.openURL(message.extraInformation.documentUrl)}
                                                        >
                                                            <Image source={Images.doc} style={styles.documentIcon} />
                                                            <AppText style={styles.documentName}>
                                                                {message.extraInformation.documentName || "Document"}
                                                            </AppText>
                                                        </TouchableOpacity>
                                                    ) :
                                                        message.extraInformation?.context === 'invite/whatsapp' &&
                                                        (
                                                            <>

                                                                <TouchableOpacity
                                                                    style={[styles.documentContainer]}
                                                                    onPress={() => message.senderId !== user.id && Linking.openURL(message.extraInformation.inviteUrl)}
                                                                >
                                                                    <Image source={Images.whatsappTwo} style={[styles.documentIcon, { tintColor: '#25D366' }]} />
                                                                    <View >
                                                                        <AppText style={styles.documentName}>
                                                                            {message.extraInformation.inviteUrl}
                                                                        </AppText>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            </>
                                                        )}
                                                {Object.keys(message?.extraInformation)?.length === 0 &&
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
    documentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        marginVertical: 4,
    },
    documentIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
        tintColor: '#FF9500',
    },
    documentName: {
        color: 'white',
        fontSize: scaleFont(14),
        flexShrink: 1,
    },
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