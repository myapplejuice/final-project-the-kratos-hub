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

export default function UserPost() {
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { user, setUser } = useContext(UserContext);
    const { setBackHandler } = useBackHandlerContext();
    const { showSpinner, hideSpinner, createToast, createDialog, createAlert, createSelector } = usePopups();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    let post = JSON.parse(params.post);

    const [selectedImage, setSelectedImage] = useState('');
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
    const [fabVisible, setFabVisible] = useState(true);

    const [isChange, setIsChange] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(post.topic || 'None');
    const [caption, setCaption] = useState(post.caption || '');
    const [images, setImages] = useState(post.imagesURLS || []);

    useEffect(() => {
        setBackHandler(() => {
            if (isEditing) {
                setIsEditing(false);
                setSelectedTopic(post.topic || 'None');
                setCaption(post.caption || '');
                setImages(post.imagesURLS || []);
                return true;
            } else {
                return false;
            }
        });

        return () => setBackHandler(null);
    }, [isEditing]);

    useEffect(() => {
        const original = {
            topic: post.topic || '',
            caption: post.caption || '',
            imagesURLS: post.imagesURLS || []
        };

        const changes = {
            topic: selectedTopic === 'None' ? '' : selectedTopic,
            caption: caption,
            imagesURLS: images
        };

        if (JSON.stringify(original) !== JSON.stringify(changes)) {
            setIsChange(true);
        } else {
            setIsChange(false);
        }
    }, [selectedTopic, caption, images]);

    async function handleDeletePost() {
        createDialog({
            title: "Delete Post",
            text: "Are you sure you want to delete this post?",
            confirmText: "Delete",
            confirmButtonStyle: { backgroundColor: colors.negativeRed, borderColor: colors.negativeRed },
            onConfirm: async () => {
                try {
                    showSpinner();

                    const result = await APIService.community.delete({ postId: post.id });
                    if (result.success) {
                        createAlert({ title: "Success", text: "Post deleted", onPress: () => router.back() });
                    } else {
                        createToast({ message: result.message });
                    }
                } catch (err) {
                    console.error("Failed to delete post:", err);
                    createToast({ message: "Server error " + err });
                }
                finally {
                    hideSpinner();
                }
            }
        })
    }

    return (
        <>
            <ImageCapture onConfirm={async (image) => setImages(prev => [...prev, image.uri])} />
            <FadeInOut visible={imagePreviewVisible} style={{ position: 'absolute', zIndex: 9999, top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <TouchableOpacity onPress={() => { setImagePreviewVisible(false), setSelectedImage(''), setFabVisible(true) }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(30), marginBottom: 15 }}>Tap anywhere to dismiss</AppText>
                    <Image source={{ uri: selectedImage }} style={{ width: 500, height: 500, alignSelf: 'center' }} resizeMode='contain' />
                    <AnimatedButton
                        title={'Delete Photo'}
                        onPress={() => { setImagePreviewVisible(false), setSelectedImage(''), setImages(images.filter(i => i !== selectedImage)), setFabVisible(true) }}
                        style={{ backgroundColor: colors.negativeRed, padding: 15, borderRadius: 30, width: '90%', marginTop: 15 }}
                        textStyle={{ fontSize: scaleFont(15) }}
                        leftImage={Images.trash}
                        leftImageStyle={{ width: 20, height: 20, marginEnd: 5 }}
                    />
                </TouchableOpacity>
            </FadeInOut>
            <FloatingActionButton
                overlayColor="rgba(0, 0, 0, 0.8)"
                style={{ backgroundColor: colors.accentGreen, width: '100%', height: 50, }}
                label='Confirm Changes'
                onPress={() => router.push(routes.POST_CREATOR)}
                visible={fabVisible && isEditing && isChange}
                position={{ bottom: insets.bottom + 20, right: 20, left: 20 }}
                icon={Images.plus}
            />

            <AppScroll hideNavBarOnScroll={true} extraBottom={100} extraTop={60} onScrollSetStates={setFabVisible}>
                {!isEditing ?
                    (
                        <CommunityPost
                            isUserPost={true}
                            post={post}
                            onDeletePress={handleDeletePost}
                            onEditPress={() => setIsEditing(true)}
                        />
                    )
                    :
                    (
                        <>
                            <View style={styles.section}>
                                <AppText style={styles.sectionTitle}>Topic</AppText>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>

                                    {["None", "Trainer Lookup", "Trainer Ad",].map((opt, idx) => {
                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                onPress={() => setSelectedTopic(opt)}
                                                style={{
                                                    height: 30,
                                                    width: '31%',
                                                    borderRadius: 20,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: selectedTopic === opt ? colors.main : colors.cardBackground,
                                                }}
                                            >
                                                <AppText style={{ color: 'white', fontSize: scaleFont(12) }}>{opt}</AppText>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                                    {["Tips", "Inquiry", "Moments"].map((opt, idx) => {
                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                onPress={() => setSelectedTopic(opt)}
                                                style={{
                                                    height: 30,
                                                    width: '31%',
                                                    borderRadius: 20,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: selectedTopic === opt ? colors.main : colors.cardBackground
                                                }}
                                            >
                                                <AppText style={{ color: 'white', fontSize: scaleFont(12) }}>{opt}</AppText>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </View>

                            <View style={styles.section}>
                                <AppText style={styles.sectionTitle}>Caption</AppText>
                                <AppTextInput
                                    multiline
                                    value={caption}
                                    onChangeText={setCaption}
                                    style={styles.bioInput}
                                    placeholder='Share your thoughts...'
                                    placeholderTextColor={colors.mutedText}
                                    textAlignVertical='top'
                                    textAlign='left'
                                    fontSize={14}
                                    color='white'
                                    fontWeight='normal'
                                />
                            </View>


                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <AppText style={styles.sectionTitle}>Images</AppText>
                                </View>

                                {images.length > 0 && (
                                    <>
                                        {images.map((image, index) => (
                                            <TouchableOpacity onPress={() => { setSelectedImage(image), setImagePreviewVisible(true) }} key={index}
                                                style={[{
                                                    flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 20, backgroundColor: colors.cardBackground,
                                                    borderRadius: 20, marginBottom: 10, alignItems: 'center'
                                                }]}>
                                                <AppText numberOfLines={1} ellipsizeMode="tail" style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(12), width: '91%' }}>{image.fileName || image.split('/').pop()}</AppText>
                                                <View style={{ width: '9%', alignItems: 'center', flexDirection: 'row', }}>
                                                    <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white', marginStart: 10 }} />
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                )}

                                <TouchableOpacity
                                    onPress={() => {
                                        Keyboard.dismiss();

                                        createSelector({
                                            title: "Profile Picture",
                                            text: "Do you want to take a photo using camera or upload an image?",
                                            optionAText: "Take a Photo",
                                            optionBText: "Upload Image",
                                            cancelText: "Cancel",
                                            onPressA: async () => setCameraActive(true),
                                            onPressB: async () => setLibraryActive(true)
                                        });
                                    }}
                                    style={styles.uploadButton}
                                >
                                    <View style={styles.uploadContent}>
                                        <Image
                                            source={Images.arrow}
                                            style={[styles.uploadIcon, { transform: [{ rotate: '-90deg' }], width: 25, height: 25, marginBottom: 0, marginBottom: 10 }]}
                                        />
                                        <AppText style={styles.uploadText}>Upload Image</AppText>
                                        <AppText style={styles.uploadHint}>
                                            PNG, JPG, JPEG up to 10MB
                                        </AppText>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
            </AppScroll>
        </>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 15,
    },
    // Explanation Card
    explanationCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
    },
    explanationContent: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    explanationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    explanationIcon: {
        tintColor: 'white',
        width: 27,
        height: 30,
    },
    explanationTitle: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: scaleFont(12),
        marginTop: 4,
    },
    explanationSubtitle: {
        fontWeight: '600',
        color: colors.mutedText,
        fontSize: scaleFont(11),
    },
    // Cards
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        marginHorizontal: 15,
        padding: 20,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: scaleFont(14),
    },
    // Toggle Switch
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecond,
        borderRadius: 12,
        overflow: 'hidden',
    },
    toggleOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        minWidth: 50,
    },
    toggleLeft: {
        width: 50,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    toggleRight: {
        width: 50,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    toggleActive: {
        backgroundColor: colors.main,
    },
    toggleText: {
        color: colors.mutedText,
        fontWeight: '600',
        fontSize: scaleFont(12),
    },
    toggleTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    // Sections
    section: {
        padding: 15,
    },
    sectionHeader: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: scaleFont(16),
        marginBottom: 4,
    },
    sectionSubtitle: {
        color: colors.mutedText,
        fontSize: scaleFont(13),
    },
    // Bio Input
    bioInput: {
        marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        color: 'white',
        borderRadius: 16,
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        padding: 16,
        fontSize: scaleFont(14),
        fontWeight: '500',
        minHeight: 150,
        width: '100%',
        textAlignVertical: 'top',
    },
    inputHint: {
        color: colors.mutedText,
        fontSize: scaleFont(12),
    },
    // Value Container
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        color: 'white',
        fontSize: scaleFont(13),
        fontWeight: '600',
        marginEnd: 8,
    },
    // Upload Section
    uploadButton: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        padding: 30,
        marginTop: 8,
        width: '100%',
        height: 100,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadContent: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    uploadIcon: {
        width: 40,
        height: 40,
        tintColor: colors.mutedText,
        marginBottom: 12,
    },
    uploadText: {
        fontWeight: 'bold',
        color: colors.mutedText,
        fontSize: scaleFont(16),
    },
    uploadHint: {
        color: colors.mutedText,
        fontSize: scaleFont(12),
        fontWeight: '500',
    },
    previewTitle: {
        color: 'white',
        fontSize: scaleFont(14),
        fontWeight: '600',
        marginBottom: 12,
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    // Icons
    arrowIcon: {
        tintColor: 'white',
        width: 20,
        height: 20,
    },
});