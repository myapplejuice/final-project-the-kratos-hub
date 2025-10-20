import * as FileSystem from 'expo-file-system/legacy';
import { Image, ImageBackground } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { use, useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Keyboard, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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
import { useBackHandlerContext } from '../../../common/contexts/back-handler-context';
import FadeInOut from '../../../components/effects/fade-in-out';
import AppView from '../../../components/screen-comps/app-view';
import LikersModal from '../../../components/screen-comps/likers-modal';
import AppImageBackground from '../../../components/screen-comps/app-image-background';
import AppImage from '../../../components/screen-comps/app-image';

export default function Post() {
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { user, setUser } = useContext(UserContext);
    const { setBackHandler } = useBackHandlerContext();
    const { showSpinner, hideSpinner, createToast, createDialog, createAlert, createSelector } = usePopups();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imagePreviewImages, setImagesPreviewImages] = useState([]);
    const [imagesPreviewVisible, setImagesPreviewVisible] = useState(false);

    const [post, setPost] = useState(JSON.parse(params.post));
    const [selectedImage, setSelectedImage] = useState('');
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [imagesURLS, setImagesURLS] = useState(post.imagesURLS);
    const [likers, setLikers] = useState([]);
    const [likersVisible, setLikersVisible] = useState(false);

    async function handlerViewLikersPress(postId) {
        try {
            showSpinner();
            const result = await APIService.community.likers({ postId });

            if (result.success) {
                const likers = result.data.likers;
                setLikers(likers);
                setLikersVisible(true);
            } else {
                createToast({ message: result.message });
            }
        } catch (err) {
            console.error("Failed to fetch likers:", err);
        } finally {
            hideSpinner();
        }
    }

    async function handleLikePress(postId, posterId, postImageURL) {
        try {
            const payload = {
                userId: user.id,
                postId,
                userFirstname: user.firstname,
                userLastname: user.lastname,
                posterId,
                postImageURL
            }
            const result = await APIService.community.like(payload);

            if (result.success) {
                const liked = result.data.liked;
                setPost(prev => ({ ...prev, isLikedByUser: liked, likeCount: liked ? prev.likeCount + 1 : Math.max(prev.likeCount - 1, 0) }));
            } else {
                createToast({ message: 'Post not found, it may have been deleted' });
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function handleSavePress(postId) {
        try {
            const result = await APIService.community.save({ userId: user.id, postId });

            if (result.success) {
                const saved = result.data.isSaved;
                setPost(prev => ({ ...prev, isSavedByUser: saved }));
            } else {
                createToast({ message: 'Post not found, it may have been deleted' });
            }
        } catch (err) {
            console.log(err);
        }
    }

    async function handleImagesPress(URLS) {
        setSelectedImageIndex(0);
        setImagesPreviewImages(URLS);
        setImagesPreviewVisible(true);
    }


    return (
        <>
            <FadeInOut visible={imagesPreviewVisible} style={{ position: 'absolute', zIndex: 10000, top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <TouchableOpacity activeOpacity={1} onPress={() => { setImagesPreviewVisible(false) }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(30), marginBottom: 15 }}>Tap anywhere to dismiss</AppText>
                    <AppImageBackground
                        source={{ uri: imagePreviewImages[selectedImageIndex] }}
                        style={{ width: '100%', height: Dimensions.get('screen').height * 0.7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'center', tintColor: 'white' }}
                        resizeMode='contain'
                    >
                        {imagePreviewImages.length > 1 &&
                            <>
                                <TouchableOpacity onPress={() => setSelectedImageIndex(prev => (prev - 1 < 0 ? imagePreviewImages.length - 1 : prev - 1))} style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, transform: [{ rotate: '180deg' }] }}>
                                    <AppImage source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} resizeMode='contain' />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSelectedImageIndex(prev => (prev + 1 > imagePreviewImages.length - 1 ? 0 : prev + 1))} style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, }}>
                                    <AppImage source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} resizeMode='contain' />
                                </TouchableOpacity>
                            </>
                        }
                    </AppImageBackground>
                </TouchableOpacity>
            </FadeInOut>

            <LikersModal visible={likersVisible} likers={likers} onClose={() => setLikersVisible(false)} />

            <FadeInOut visible={imagePreviewVisible} style={{ position: 'absolute', zIndex: 9999, top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <TouchableOpacity onPress={() => { setImagePreviewVisible(false), setSelectedImage('') }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(30), marginBottom: 15 }}>Tap anywhere to dismiss</AppText>
                    <Image source={{ uri: selectedImage }} style={{ width: 500, height: 500, alignSelf: 'center' }} resizeMode='contain' />
                    <AnimatedButton
                        title={'Delete Photo'}
                        onPress={() => { setImagePreviewVisible(false), setSelectedImage(''), setImagesURLS(imagesURLS.filter(i => i !== selectedImage)) }}
                        style={{ backgroundColor: colors.negativeRed, padding: 15, borderRadius: 30, width: '90%', marginTop: 15 }}
                        textStyle={{ fontSize: scaleFont(15) }}
                        leftImage={Images.trash}
                        leftImageStyle={{ width: 20, height: 20, marginEnd: 5 }}
                    />
                </TouchableOpacity>
            </FadeInOut>

            <AppView extraTop={60}>
                <CommunityPost
                    isUserPost={false}
                    post={post}
                    onViewLikersPress={() => handlerViewLikersPress(post.id)}
                    isLikedByUser={post.isLikedByUser}
                    isSavedByUser={post.isSavedByUser}
                    onLikePress={() => handleLikePress(post.id, post.postUser.id, post.imagesURLS[0])}
                    onSavePress={() => handleSavePress(post.id)}
                    onImagesPress={()=> handleImagesPress(post.imagesURLS)}
                />
            </AppView>
        </>
    );
}