import * as FileSystem from 'expo-file-system/legacy';
import { Image, ImageBackground } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Easing, Keyboard, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../../components/layout-comps/build-footer";
import AppText from "../../../components/screen-comps/app-text";
import { Images } from '../../../common/settings/assets';
import { UserContext } from "../../../common/contexts/user-context";
import { formatDate, formatTime, getDayComparisons, getHoursComparisons } from '../../../common/utils/date-time';
import usePopups from "../../../common/hooks/use-popups";
import { scaleFont } from "../../../common/utils/scale-fonts";
import DeviceStorageService from '../../../common/services/device-storage-service';
import APIService from '../../../common/services/api-service';
import { routes } from "../../../common/settings/constants";
import { colors } from "../../../common/settings/styling";
import Divider from '../../../components/screen-comps/divider';
import AppScroll from '../../../components/screen-comps/app-scroll'
import ImageCapture from '../../../components/screen-comps/image-capture';
import { CameraContext } from '../../../common/contexts/camera-context';
import { LibraryContext } from '../../../common/contexts/library-context';
import AnimatedButton from '../../../components/screen-comps/animated-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Invert from '../../../components/effects/invert';
import ExpandInOut from '../../../components/effects/expand-in-out';
import AppTextInput from '../../../components/screen-comps/app-text-input';
import CommunityPost from '../../../components/screen-comps/community-post';
import FloatingActionMenu from '../../../components/screen-comps/floating-action-menu';
import FloatingActionButton from '../../../components/screen-comps/floating-action-button';
import Gallery from '../../../components/screen-comps/gallery';

export default function UserPosts() {
    const { user } = useContext(UserContext);
    const insets = useSafeAreaInsets();

    const [loadingPosts, setLoadingPosts] = useState(false);
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [fabVisible, setFabVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [selectedPosts, setSelectedPosts] = useState('Any');

    useFocusEffect(
        useCallback(() => {
            async function fetchPosts() {
                const payload = {
                    userId: user.id,
                    forUser: true,
                    page: 1,
                    limit: 25
                }

                try {
                    const result = await APIService.community.posts(payload)

                    if (result.success) {
                        const posts = result.data.posts;
                        const hasMore = result.data.hasMore;
          
                        setPage(1);
                        setHasMore(hasMore);
                        setPosts(posts);
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            }

            fetchPosts();
        }, [])
    );

    async function handleMorePosts() {
        if (!hasMore || loadingPosts) return;

        setLoadingPosts(true);

        const payload = {
            userId: user.id,
            forUser: true,
            page: page + 1,
            limit: 25
        }

        try {
            const result = await APIService.community.posts(payload)

            if (result.success) {
                const posts = result.data.posts;
                const hasMore = result.data.hasMore;

                setHasMore(hasMore);
                setPage(prev => prev + 1);
                setPosts(prev => [...prev, ...posts]);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingPosts(false);
        }
    }

    let visibleList;
    if (selectedPosts === 'Any')
        visibleList = posts;
    else
        visibleList = posts.filter(post => post.topic === selectedPosts);

    return (
        <>
            <FloatingActionButton
                overlayColor="rgba(0, 0, 0, 0.8)"
                style={{ backgroundColor: colors.accentGreen, width: '100%', height: 50, }}
                label='Create New Post'
                onPress={() => router.push(routes.POST_CREATOR)}
                visible={fabVisible}
                position={{ bottom: insets.bottom + 20, right: 20, left: 20 }}
                icon={Images.plus}
            />

            {!loading ? (
                <AppScroll onScrollSetStates={setFabVisible} hideNavBarOnScroll={true} extraBottom={200} >
                    {posts.length > 0 && (
                        <>
                            <View style={{ height: 60 }}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                                    {["Any", "Trainer Ad", "Trainer Lookup", "Inquiry", "Tips", "Moments"].map((opt, idx) => {
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

                            <Gallery
                                sources={visibleList.map(post =>
                                    post.imagesURLS?.length > 0
                                        ? { uri: post.imagesURLS[0] }
                                        : Images.missingImage
                                )}

                                sourcesOnPress={visibleList.map((post) => () => {
                                    router.push({
                                        pathname: routes.USER_POST,
                                        params: {
                                            post: JSON.stringify(post)
                                        }
                                    })
                                })}
                            />

                            {hasMore &&
                                <TouchableOpacity onPress={handleMorePosts} style={{ alignItems: 'center', marginTop: 15, borderWidth: !loadingPosts ? 1 : 0, borderColor: colors.mutedText, borderRadius: 20, padding: 15, alignSelf: 'center' }}>
                                    {!loadingPosts && <AppText style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>Load More</AppText>}
                                    {loadingPosts && <ActivityIndicator color='white' size='large' />}
                                </TouchableOpacity>
                            }
                        </>
                    )}
                    {posts.length === 0 && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={Images.msisingImageTwo} style={{ width: 100, height: 100, marginBottom: 15, tintColor: colors.mutedText }} />
                            <AppText style={{ fontSize: scaleFont(14), color: colors.mutedText, fontWeight: 'bold' }}>You have nothing posted to the community yet</AppText>
                            <AppText style={{ fontSize: scaleFont(13), color: 'white', marginTop: 5,  textAlign: 'center' }}>Tap below to create a new post</AppText>
                        </View>
                    )}
                </AppScroll>
            ) :
                (
                    <View style={{ backgroundColor: colors.background, flex: 1, paddingTop: 75 }}>
                        {[...Array(1)].map((_, idx) => (
                            <View key={idx} style={{ marginTop: 15 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 10 }}>
                                    <View style={{ justifyContent: 'center' }}>
                                        <Animated.View style={{ width: 80, height: 30, borderRadius: 20, backgroundColor: colors.cardBackground, marginVertical: 5 }} />
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <Animated.View style={{ width: 80, height: 30, borderRadius: 20, backgroundColor: colors.cardBackground, marginVertical: 5 }} />
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <Animated.View style={{ width: 80, height: 30, borderRadius: 20, backgroundColor: colors.cardBackground, marginVertical: 5 }} />
                                    </View>
                                    <View style={{ justifyContent: 'center' }}>
                                        <Animated.View style={{ width: 80, height: 30, borderRadius: 20, backgroundColor: colors.cardBackground, marginVertical: 5 }} />
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginHorizontal: 10 }}>
                                    {Array(3).fill(0).map((_, idx) => (
                                        <Animated.View
                                            key={idx}
                                            style={{
                                                backgroundColor: colors.cardBackground,
                                                height: Dimensions.get('window').width * 0.32,
                                                width: '32%',
                                                borderRadius: 10,
                                            }}
                                        />
                                    ))}
                                </View>
                                <Animated.View style={{ backgroundColor: colors.cardBackground, height: 300, marginTop: 15, borderRadius: 10, marginHorizontal: 10 }} />
                            </View>
                        ))}
                    </View>
                )}
        </>
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