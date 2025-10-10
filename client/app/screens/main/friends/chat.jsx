import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Button, StyleSheet, TouchableOpacity, View, Platform, Keyboard } from "react-native";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StaticIcons from "../../../components/screen-comps/static-icons";
import AppTextInput from "../../../components/screen-comps/app-text-input";

export default function Chat() {
    const { createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert } = usePopups();
    const { user, setUser, setAdditionalContexts, additionalContexts } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const [profile, setProfile] = useState({});
    const [messagesList, setMessagesList] = useState([]);

    const [message, setMessage] = useState('');
    const [messageHeight, setMessageHeight] = useState(50);

    useEffect(() => {
        const profile = additionalContexts.chattingFriendProfile;
        const friendMessages = user.friends.find(f => f.friendId === profile?.id)?.messages || [];

        setMessagesList(friendMessages);
        setProfile(profile);

        const showListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const hideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            showListener.remove();
            hideListener.remove();
            setAdditionalContexts({ ...additionalContexts, chattingFriendProfile: null });
        };
    }, []);

    async function handleMessageSend() {
        console.log(message)
    }

    return (
        <>
            <StaticIcons color={colors.mutedText} />
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 20 + keyboardHeight, zIndex: 9999, flexDirection: 'row', marginHorizontal: 15 }}>
                <View style={{ width: '85%', minHeight: 50, maxHeight: 120, backgroundColor: colors.cardBackground, borderRadius: 20 }}>
                    <AppTextInput
                        multiline
                        onChangeText={setMessagesList}
                        value={message}
                        placeholder="Message..."
                        placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                        style={[styles.inputStripped, { height: Math.min(120, Math.max(50, messageHeight)) }]}
                        onContentSizeChange={(e) =>
                            setMessageHeight(e.nativeEvent.contentSize.height)
                        } />
                </View>
                <View style={{ width: '15%', alignSelf: 'flex-end', }}>
                    <TouchableOpacity onPress={handleMessageSend} style={{ padding: 15, height: 50, backgroundColor: colors.main, width: 50, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', borderRadius: 25 }}>
                        <Image source={Images.arrow} style={{ width: 25, height: 30, tintColor: 'white', margin: 0 }} resizeMode="center" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.main}>
                <AppScroll>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 }}>
                        <View style={{ width: '10%', alignItems: 'flex-start', height: '100%' }}>
                            <Image source={profile?.image} style={{ width: 26, height: 26, borderRadius: 13 }} />
                        </View>
                        <View style={{ width: '90%', padding: 15, borderRadius: 15, backgroundColor: colors.mainOpacied }}>
                            <AppText style={{ color: 'white' }}>lIRUMdwal,pd opiwrjim warowna ruiwa nriwdwakdmnwaiofdrnwauirnwairnawuriawiunrwainrasuirniaurnwiaunriawunruiwanriawnruiwnriaiwnuranriwanrwaurnwairawnrawnia</AppText>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 15 }}>
                        <View style={{ width: '90%', padding: 15, borderRadius: 15, backgroundColor: colors.mainOpacied }}>
                            <AppText style={{ color: 'white' }}>lIRUMdwal,pd opiwrjim warowna ruiwa nriwdwakdmnwaiofdrnwauirnwairnawuriawiunrwainrasuirniaurnwiaunriawunruiwanriawnruiwnriaiwnuranriwanrwaurnwairawnrawnia</AppText>
                        </View>
                        <View style={{ width: '10%', alignItems: 'flex-end', height: '100%' }}>
                            <Image source={profile?.image} style={{ width: 26, height: 26, borderRadius: 13 }} />
                        </View>
                    </View>
                </AppScroll>
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
    inputStripped: {
        height: 50,
        color: "white",
        width: '100%',
        paddingHorizontal: 15
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