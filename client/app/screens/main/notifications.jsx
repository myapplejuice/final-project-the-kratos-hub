import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../components/layout-comps/build-footer";
import AppText from "../../components/screen-comps/app-text";
import { Images } from '../../common/settings/assets';
import { UserContext } from "../../common/contexts/user-context";
import { formatDate } from '../../common/utils/date-time';
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

export default function Notifications() {
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const [requestsProfiles, setRequestsProfiles] = useState([]);
    const [openUser, setOpenUser] = useState(null);

    useEffect(() => {
        async function fetchPendingRequestsProfiles() {
            try {
                showSpinner();

                const pendingRequests = user.pendingFriends.filter(f => f.adderId !== user.id);
                const idList = pendingRequests.map(f => f.adderId);

                const result = await APIService.userToUser.multipleAnotherProfile(idList);
                if (result.success) {
                    const profiles = result.data.profiles.map(profile => {
                        const req = pendingRequests.find(f => f.adderId === profile.id);
                        return {
                            ...profile,
                            description: req?.description || '',
                            image: profile.imageBase64
                                ? { uri: `data:image/jpeg;base64,${profile.imageBase64}` }
                                : null,
                        };
                    });

                    setRequestsProfiles(profiles);
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

        fetchPendingRequestsProfiles();
    }, [])

    async function handleFriendRequest(){

    }

    return (
        <View style={styles.main}>
            <AppScroll extraBottom={20}>
                <View style={styles.card}>
                    <View style={{marginBottom: 25}}>
                    <AppText style={styles.label}>Friend Requests</AppText>
                    </View>
                    {requestsProfiles.length > 0 ? (
                        requestsProfiles.map((adder, index) => (
                            <TouchableOpacity onPress={() => setOpenUser(prev => (prev === adder.id ? null : adder.id))} key={index} style={{ marginBottom: index === requestsProfiles.length - 1 ? 0 : 15 }}>
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={{ width: '20%' }}>
                                        <Image source={adder.image} style={{ width: 50, height: 50, borderRadius: 25 }} />
                                    </View>
                                    <View style={{ justifyContent: 'center', width: '70%' }}>
                                        <AppText style={{ color: 'white', fontSize: scaleFont(14), fontWeight: 'bold' }}>{adder.firstname} {adder.lastname}</AppText>
                                        <AppText style={{ color: 'white' }}>{adder.email}</AppText>
                                    </View>
                                    <View style={{ width: '10%', justifyContent: 'center', alignItems: 'flex-end' }}>
                                        <Invert axis='horizontal' inverted={openUser === adder.id}>
                                            <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white', transform: [{ rotate: '-90deg' }] }} />
                                        </Invert>
                                    </View>
                                </View>
                                <ExpandInOut visible={openUser === adder.id}>
                                    <AppText style={{ color: colors.mutedText, textAlign: adder.description ? 'left' : 'center', marginVertical: 15 }}>
                                        {adder.description || 'No introduction provided'}
                                    </AppText>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                                        <TouchableOpacity onPress={handleFriendRequest} style={{ padding: 15, borderRadius: 10, backgroundColor: colors.accentPink, width: '48%', justifyContent: 'center', alignItems: 'center' }}>
                                            <AppText style={{ color: 'white' }}>Decline</AppText>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleFriendRequest} style={{ padding: 15, borderRadius: 10, backgroundColor: colors.accentGreen, width: '48%', justifyContent: 'center', alignItems: 'center' }}>
                                            <AppText style={{ color: 'white' }}>Accept</AppText>
                                        </TouchableOpacity>
                                    </View>
                                </ExpandInOut>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <AppText style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>No friend requests</AppText>
                    )}
                </View>
            </AppScroll>
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
    label: { fontSize: scaleFont(16), color: 'white', fontWeight: 'bold', marginStart: 15 },
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