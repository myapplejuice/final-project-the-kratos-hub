import * as FileSystem from 'expo-file-system/legacy';
import { Image, ImageBackground } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, Keyboard, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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
import CommunityPost from '../../components/screen-comps/community-post';

export default function Community() {
    const { user, setAdditionalContexts } = useContext(UserContext);
    const [friendsList, setFriendsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPosts, setSelectedPosts] = useState('Any');

    const fadeAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.3,
                    duration: 600,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        );
        console.log(user.trainerProfile)
        animation.start();

        setTimeout(() => {
            setLoading(false);
            animation.stop();
        }, 1000);
    }, []);

    if (loading) {
        return (
            <View style={{ backgroundColor: colors.background, flex: 1, paddingTop: 75 }}>
                {[...Array(2)].map((_, idx) => (
                    <View key={idx} style={{ marginTop: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Animated.View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardBackground, marginStart: 15, opacity: fadeAnim }} />
                            <View style={{ justifyContent: 'center' }}>
                                <Animated.View style={{ width: 90, height: 10, borderRadius: 20, backgroundColor: colors.cardBackground, marginStart: 15, marginVertical: 5, opacity: fadeAnim }} />
                                <Animated.View style={{ width: 60, height: 7, borderRadius: 20, backgroundColor: colors.cardBackground, marginStart: 15, marginVertical: 5, opacity: fadeAnim }} />
                            </View>
                        </View>
                        <Animated.View style={{ backgroundColor: colors.cardBackground, height: 300, width: '100%', marginTop: 15, opacity: fadeAnim, borderRadius: 10 }} />
                    </View>
                ))}
            </View>
        );
    }

    return (
        <AppScroll hideNavBarOnScroll={true} hideTopBarOnScroll={true} extraBottom={100}>
            <View style={{ height: 60 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                    {["Any", "Tips", "Trainer Ad", "Need Trainer", "Moments", "Inquiry"].map((opt, idx) => {
                        return (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => setSelectedPosts(opt)}
                                style={{
                                    paddingHorizontal: 15,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor: selectedPosts === opt ? colors.main : colors.cardBackground,
                                    marginStart: idx === 0 ? 10 : 5,
                                    marginEnd: idx === 5 ? 10 : 5
                                }}
                            >
                                <AppText style={{ color: 'white', fontSize: 14 }}>{opt}</AppText>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>

            <Divider orientation='horizontal' style={{ marginBottom: 15 }} />

            <CommunityPost
                post={{
                    user: {
                        id: 'u1',
                        firstname: 'John',
                        lastname: 'Doe',
                        imageURL: user.imageURL,
                        trainerProfile: {
                            trainerStatus: 'active',
                            isVerified: true,
                        },
                    },
                    imageURL: 'https://res.cloudinary.com/dkujdjk2d/image/upload/v1760458605/profile_images/wcntywjjocrff0kegi53.jpg',
                    caption: 'Feeling strong today 💪',
                    likes: 140,
                    shares: 2,
                    time: '10:00 AM',
                    type: 'Trainer Ad',
                }} />
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
    cardNoPadding: {
        backgroundColor: colors.cardBackground,
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