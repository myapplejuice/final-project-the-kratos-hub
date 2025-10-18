import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, StyleSheet, TouchableOpacity, View, Platform, Keyboard, Dimensions, Animated, Linking, Image, Pressable, Clipboard } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import AppText from "../../../components/screen-comps/app-text";
import MediaLibrary from 'expo-media-library';
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
import { colorWithOpacity } from "../../../common/utils/random-functions";
import Divider from "../../../components/screen-comps/divider";

export default function Chat() {
    const { createOptions, createDialog, createToast, showSpinner, hideSpinner, createSelector } = usePopups();
    const { user, setUser, additionalContexts } = useContext(UserContext);
    const { libraryActive, setLibraryActive } = useContext(LibraryContext);
    const { cameraActive, setCameraActive } = useContext(CameraContext);
    const insets = useSafeAreaInsets();
    const scrollRef = useRef(null);
    const initialScrollDone = useRef(false);
    const apiFetchDebounce = useRef(null);
    const currentPage = useRef(1);
    const morePages = useRef(true);

    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageViewVisible, setImageViewVisible] = useState(false);
    const [noMessageWarningVisible, setNoMessageWarningVisible] = useState(additionalContexts.friendStatus === 'inactive');
    const [chatBarVisible, setChatBarVisible] = useState(true);
    const [uploadOptionsVisible, setUploadOptionsVisible] = useState(false);
    const [fabVisible, setFabVisible] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);


    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    const [roomId, setRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessageText, setNewMessageText] = useState(false);

    const [message, setMessage] = useState('');
    const [messageHeight, setMessageHeight] = useState(50);
    const messagesRef = useRef(messages);

    useEffect(() => {
        const profile = additionalContexts.chattingFriendProfile;
        if (!profile || !user?.id) return;

        const friendId = profile.id;
        const friendData = user.friends.find(f => f.friendId === friendId);
        if (!friendData) return;

        const chatRoomId = friendData.chatRoomId;
        setRoomId(chatRoomId);

        function handleNewMessage(msg) {
            if (msg.chatRoomId !== chatRoomId)
                return;

            if (!msg.seenBy.includes(user.id))
                msg.seenBy.push(user.id);

            setMessages(prev => [...prev, msg]);

            if (msg.senderId !== user.id) {
                const isScrolledUp = scrollRef.current?.isScrolledToBottom(1000);
                if (isScrolledUp) {
                    setNewMessageText(true);
                    setTimeout(() => setNewMessageText(false), 2000);
                    setFabVisible(true);
                }
            }
        };

        function handleUpdatedMessage(payload) {
            const { context, messageId } = payload;
            setMessages(prev =>
                prev.map(m => {
                    if (m.id !== messageId) return m;

                    switch (context) {
                        case "hide": return { ...m, hidden: true };
                        case "unhide": return { ...m, hidden: false };
                        case "discard": return { ...m, discarded: true };
                        case "restore": return { ...m, discarded: false };
                        default: return m;
                    }
                })
            );
        };

        SocketService.joinRoom(chatRoomId);
        SocketService.on("new-message", handleNewMessage);
        SocketService.on("updated-message", handleUpdatedMessage);

        async function fetchMessages() {
            showSpinner();
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
                hideSpinner();
                setLoading(false);
            }
        }

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
            const messageIds = messagesRef.current.map(m => m.id);
            if (messageIds.length > 0) {
                SocketService.emit("mark-seen", { userId: user.id, messageIds });
            }

            SocketService.emit("leave-room", chatRoomId);
            SocketService.off("new-message", handleNewMessage);
            SocketService.off("updated-message", handleUpdatedMessage);
            showListener.remove();
            hideListener.remove();

            const lastMessageDetails = messagesRef.current[messagesRef.current.length - 1];
            if (lastMessageDetails) {
                const { id: lastMessageId, message: lastMessage, dateTimeSent: lastMessageTime, senderId: lastMessageSenderId, hidden: lastMessageHidden, discarded: lastMessageDiscarded } = lastMessageDetails;
                setUser(prev => ({
                    ...prev,
                    friends: prev.friends.map(f =>
                        f.chatRoomId === chatRoomId
                            ? { ...f, lastMessageId, lastMessage, lastMessageTime, unreadCount: 0, lastMessageSenderId, lastMessageHidden, lastMessageDiscarded }
                            : f
                    )
                }));
            }
        };
    }, []);

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

    async function fetchMoreMessages() {
        if (morePages.current === false || isLoadingMessages) return;

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

    function handleMessageUpdate(messageId, context) {
        const payload = {
            senderId: user.id,
            receiverId: additionalContexts.chattingFriendProfile.id,
            chatRoomId: roomId,
            messageId,
            context
        }

        SocketService.emit("update-message", payload);
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
            extraInformation,
            dateTimeSent: new Date()
        };

        setMessage('');
        SocketService.emit("send-message", payload);

        setTimeout(() => {
            scrollRef.current?.scrollToBottom({ animated: false });
        }, 0);
        setUploadOptionsVisible(false);
    }

    async function handleImportPlan() {
        Keyboard.dismiss();
        const userPlans = user.plans;

        createOptions({
            title: 'Select a plan',
            options: userPlans.map(p => p.label),
            values: userPlans.map(p => p.id),
            onConfirm: (selected, value) => {
                if (!selected || !value) return;

                const plan = userPlans.find(p => p.id === value);

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
        Keyboard.dismiss();
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

    async function downloadFile(url) {
        try {
            if (await Linking.canOpenURL(url))
                await Linking.openURL(url);
            else
                createToast({ message: 'Download failed' });
        } catch (err) {
            createToast({ message: 'Download failed' });
        }
    }

    async function shareFile(url) {
        try {
            let extension = url.split('.').pop().split('?')[0].toLowerCase();
            if (!extension.match(/^[a-z0-9]+$/)) extension = 'dat';

            const fileUri = FileSystem.documentDirectory + `The_Kratos_Hub_Chat_${roomId}_image_${Date.now()}.${extension}`;
            await FileSystem.downloadAsync(url, fileUri);

            if (await Sharing.isAvailableAsync())
                await Sharing.shareAsync(fileUri);
        } catch (err) {
            createToast({ message: 'Sharing failed' });
        }
    }

    async function handleWhatsAppInvite() {
        Keyboard.dismiss();
        const phoneNumber = user.phone.replace(/\+/g, '');
        const url = `https://wa.me/${phoneNumber}`;

        handleMessageSend({
            context: 'invite/whatsapp',
            senderName: user.firstname,
            inviteUrl: url,
            inviteLabel: 'WhatsApp'
        });
    }

    function handleMessageLongPress(message) {
        if (message.extraInformation.context === 'image') return;
        if (message.senderId !== user.id && message.hidden) return;

        createSelector({
            title: "Message Actions",
            text: null,
            optionAText: message.senderId === user.id ? message.hidden ? "Unhide Message" : "Hide Message" : null,
            optionBText: "Copy Message",
            cancelText: "Cancel",
            onPressA: message.senderId === user.id ? () => handleMessageUpdate(message.id, message.hidden ? "unhide" : "hide") : null,
            onPressB: () => {
                Clipboard.setString(message.message);
                createToast({ message: 'Copied to clipboard' });
            }
        });
    }

    return (
        <>
            <ImageCapture onCancel={() => setChatBarVisible(true)} onConfirm={(asset) => handleImageUpload(asset)} />

            {imageViewVisible &&
                <TouchableOpacity activeOpacity={1} onPress={() => { setImageViewVisible(false) }}
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10000
                    }}>
                    <Image source={{ uri: selectedImage }} style={{ width: 500, height: 500, }} resizeMode="contain" />
                </TouchableOpacity>
            }

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

                    <TouchableOpacity onPress={() => { Keyboard.dismiss(), setCameraActive(true) }} style={{ padding: 15, alignItems: 'center', width: '25%' }}>
                        <View style={[styles.uploadOptionIcon, { backgroundColor: 'rgba(199, 184, 52, 0.2)' }]}>
                            <Image source={Images.camera} style={{ width: 24, height: 24, tintColor: '#eef136ff' }} />
                        </View>
                        <AppText style={{ color: 'white', fontSize: scaleFont(9), fontWeight: '600', marginTop: 5 }}>Camera</AppText>
                    </TouchableOpacity>

                    {/* Bottom row: 4 icons */}
                    <TouchableOpacity onPress={() => { Keyboard.dismiss(), setLibraryActive(true) }} style={{ padding: 15, alignItems: 'center', width: '25%' }}>
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
                    <TouchableOpacity onPress={() => handleMessageSend()} style={styles.sendButton}>
                        <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </FadeInOut>

            <FadeInOut visible={isLoadingMessages} style={{ position: 'absolute', top: 100, alignSelf: 'center', zIndex: 9999 }}>
                <AppText style={{ padding: 8, backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'white', borderRadius: 10, fontSize: scaleFont(17), fontWeight: 'bold' }}>Loading</AppText>
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
                {!loading &&
                    <View style={{ flex: 1 }}>
                        <AppScroll
                            dismissKeyboardOnTap={Platform.OS === 'ios'}
                            onScrollToTop={() => safeTrigger(fetchMoreMessages)}
                            ref={scrollRef}
                            extraBottom={Platform.OS === 'android' && keyboardOpen ? keyboardHeight - 65 : 75}
                        >
                            {messages?.length > 0 && messages.map((message, index) => {
                                const isUser = message.senderId === user.id;
                                const messageTime = new Date(message.dateTimeSent);
                                const { isToday, isYesterday } = getDayComparisons(messageTime);

                                const timeDisplay = isToday
                                    ? formatTime(message.dateTimeSent, { format: user.preferences.timeFormat.key })
                                    : isYesterday
                                        ? `Yesterday, ${formatTime(message.dateTimeSent, { format: user.preferences.timeFormat.key })}`
                                        : `${formatDate(message.dateTimeSent, { format: 'MMM d' })}, ${formatTime(message.dateTimeSent, { format: user.preferences.timeFormat.key })}`;

                                const prevMessage = messages[index - 1];
                                const showDateDivider = !prevMessage || new Date(prevMessage.dateTimeSent).toDateString() !== messageTime.toDateString();
                                const isUnread = !message.seenBy?.includes(user.id);
                                const showUnreadDivider = isUnread && (!prevMessage || prevMessage.seenBy?.includes(user.id));

                                const bubbleStyle = isUser ? styles.userBubble : styles.theirBubble;

                                const dayLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : formatDate(message.dateTimeSent, { format: 'MMM d' });

                                const renderTime = () => (
                                    <AppText style={[styles.messageTime, { alignSelf: isUser ? 'flex-end' : 'flex-start' }]}>
                                        {timeDisplay}
                                    </AppText>
                                );

                                const renderHiddenNotice = (text) => (
                                    <AppText style={[styles.messageText, { color: colors.mutedText, marginTop: message.extraInformation?.context === 'mealplan' ? 10 : 0 }]}>
                                        {text}
                                    </AppText>
                                );

                                const renderDivider = (text, styleText, styleLine) => (
                                    <View style={styleLine}>
                                        <AppText style={styleText}>{text}</AppText>
                                    </View>
                                );

                                const renderMealPlan = () => (
                                    <View style={styles.mealPlanContainer}>
                                        <AppText style={styles.mealPlanTitle}>{message.extraInformation.planLabel}</AppText>
                                        <AppText style={styles.mealPlanDescription}>{message.extraInformation.planDescription}</AppText>

                                        {message.senderId !== user.id && user.plans.find(p => p.sourcePlanId === message.extraInformation.planId) === undefined ? (
                                            <AnimatedButton
                                                onPress={() => handleMealPlanSave(message.extraInformation.planId, message.senderId)}
                                                title="Save Plan"
                                                style={styles.savePlanButton}
                                                textStyle={styles.savePlanButtonText}
                                            />
                                        ) : (
                                            user.id !== message.senderId && (
                                                <View style={styles.savedPlanContainer}>
                                                    <Image source={Images.checkMark} style={styles.checkMark} />
                                                    <AppText style={styles.savedPlanText}>Plan Saved</AppText>
                                                </View>
                                            )
                                        )}
                                    </View>
                                );

                                const renderImageMessage = () => (
                                    <TouchableOpacity
                                        onPress={() => { setSelectedImage(message.extraInformation.imageUrl); setImageViewVisible(true); }}
                                        style={{ borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}
                                    >
                                        {/* Image with overlay */}
                                        <View style={{ width: 300, height: 300, borderRadius: 20, borderTopLeftRadius: isUser ? 20 : 5, borderTopRightRadius: !isUser ? 20 : 5, marginTop: 5, overflow: 'hidden', position: 'relative' }}>
                                            <Image
                                                source={{ uri: message.extraInformation.imageUrl }}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderTopLeftRadius: isUser ? 20 : 5,
                                                    borderTopRightRadius: !isUser ? 20 : 5,
                                                    opacity: message.hidden ? 0.5 : 1,
                                                }}
                                                resizeMode="cover"
                                            />

                                            {message.hidden && (
                                                <View
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0, left: 0, right: 0, bottom: 0,
                                                        backgroundColor: 'rgba(0,0,0,0.85)',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {isUser && (
                                                        <AppText style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(16) }}>
                                                            Photo Hidden
                                                        </AppText>
                                                    )}
                                                </View>
                                            )}
                                        </View>

                                        <View style={{
                                            position: 'absolute', bottom: 0, right: 0, left: 0, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row',
                                            justifyContent: 'space-around', backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 15, alignItems: 'center'
                                        }}>
                                            <TouchableOpacity onPress={() => downloadFile(message.extraInformation.imageUrl)} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                                <Image source={Images.arrow} style={{ width: 18, height: 18, tintColor: 'white', transform: [{ rotate: '90deg' }], marginTop: 3 }} />
                                                <AppText style={{ color: 'white', marginTop: 5 }}>Download</AppText>
                                            </TouchableOpacity>
                                            
                                            <Divider orientation="vertical" color="white" />

                                            <TouchableOpacity onPress={() => shareFile(message.extraInformation.imageUrl)} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                                <Image source={Images.shareOutline} style={{ width: 18, height: 18, tintColor: 'white', marginTop: 3 }} />
                                                <AppText style={{ color: 'white', marginTop: 5 }}>Share</AppText>
                                            </TouchableOpacity>

                                        </View>

                                        {isUser && (
                                            <TouchableOpacity
                                                onPress={() => handleMessageUpdate(message.id, message.hidden ? 'unhide' : 'hide')}
                                                style={{
                                                    position: 'absolute',
                                                    top: 15,
                                                    right: 10,
                                                    padding: 7,
                                                    borderRadius: 5,
                                                    backgroundColor: colorWithOpacity(colors.cardBackground, 16),
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Image
                                                    source={message.hidden ? Images.unHide : Images.hide}
                                                    style={{ width: 18, height: 18, tintColor: 'white' }}
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                );

                                const renderDocument = () => (
                                    <TouchableOpacity
                                        style={styles.documentContainer}
                                        onPress={() => Linking.openURL(message.extraInformation.documentUrl)}
                                    >
                                        <Image source={Images.doc} style={styles.documentIcon} />
                                        <AppText style={styles.documentName}>
                                            {message.extraInformation.documentName || 'Document'}
                                        </AppText>
                                    </TouchableOpacity>
                                );

                                const renderInvite = () => (
                                    <TouchableOpacity
                                        style={styles.documentContainer}
                                        onPress={() => message.senderId !== user.id && Linking.openURL(message.extraInformation.inviteUrl)}
                                    >
                                        <Image source={Images.whatsappTwo} style={[styles.documentIcon, { tintColor: '#25D366' }]} />
                                        <AppText style={styles.documentName}>
                                            {message.extraInformation.inviteUrl}
                                        </AppText>
                                    </TouchableOpacity>
                                );

                                const renderMainMessage = () => {
                                    const ctx = message.extraInformation?.context;

                                    if (ctx === 'mealplan') return renderMealPlan();
                                    if (ctx === 'image') return renderImageMessage();
                                    if (ctx === 'document') return renderDocument();
                                    if (ctx === 'invite/whatsapp') return renderInvite();

                                    // Default text message
                                    return message.message && (
                                        <AppText style={[styles.messageText, { marginTop: ctx === 'mealplan' ? 10 : 0 }]}>
                                            {message.message}
                                        </AppText>
                                    );
                                };

                                return (
                                    <View key={index}>
                                        {showDateDivider && (
                                            <View style={styles.dateDivider}>
                                                <View style={styles.dateDividerLine} />
                                                <AppText style={styles.dateDividerText}>{dayLabel}</AppText>
                                                <View style={styles.dateDividerLine} />
                                            </View>
                                        )}

                                        {showUnreadDivider && renderDivider('Unread Messages', styles.unreadDividerText, styles.unreadDivider)}

                                        <Pressable
                                            onLongPress={() => handleMessageLongPress(message)}
                                            delayLongPress={350}
                                            style={({ pressed }) => [
                                                {
                                                    backgroundColor: pressed ? 'rgba(0,0,0,0.7)' : 'transparent',
                                                }
                                            ]}
                                        >
                                            <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.theirMessageContainer]}>
                                                {message.hidden ?
                                                    ((message.extraInformation.context === 'image' && isUser) ?
                                                        <View style={[styles.messageBubble, bubbleStyle, isUser ? styles.userMessageBubble : styles.theirMessageBubble]}>
                                                            {renderMainMessage()}
                                                            {renderTime()}
                                                        </View>
                                                        : (
                                                            <View style={[styles.messageBubble, bubbleStyle, isUser ? styles.userMessageBubble : styles.theirMessageBubble]}>
                                                                {renderHiddenNotice(`${user.id === message.senderId ? 'You are hiding' : additionalContexts.chattingFriendProfile.firstname + ' is hiding'} this message`)}
                                                                <View style={{ flexDirection: 'row', marginTop: 5, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                                                                    <Image source={Images.hide} style={{ width: 15, height: 15, tintColor: colors.mutedText, marginEnd: 5 }} />
                                                                    {renderTime()}
                                                                </View>
                                                            </View>
                                                        ))
                                                    : (
                                                        <View style={[styles.messageBubble, bubbleStyle, isUser ? styles.userMessageBubble : styles.theirMessageBubble]}>
                                                            {renderMainMessage()}
                                                            {renderTime()}
                                                        </View>
                                                    )}
                                            </View>
                                        </Pressable>
                                    </View>
                                );
                            })}
                        </AppScroll>
                    </View>
                }
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
        borderTopRightRadius: 5,
    },
    theirBubble: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderTopLeftRadius: 5,
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
        fontSize: scaleFont(10)
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
        marginBottom: 2,
    },
    mealPlanDescription: {
        color: colors.mutedText,
        fontWeight: '600',
        fontSize: scaleFont(12),
        marginBottom: 7
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