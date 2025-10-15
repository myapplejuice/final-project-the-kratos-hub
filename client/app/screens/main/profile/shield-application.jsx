import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import BuildFooter from "../../../components/layout-comps/build-footer";
import AppText from "../../../components/screen-comps/app-text";
import { Images } from '../../../common/settings/assets';
import { UserContext } from "../../../common/contexts/user-context";
import { formatDate } from '../../../common/utils/date-time';
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
import AppTextInput from '../../../components/screen-comps/app-text-input';
import FloatingActionButton from '../../../components/screen-comps/floating-action-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBackHandlerContext } from '../../../common/contexts/back-handler-context';
import FadeInOut from '../../../components/effects/fade-in-out';

export default function ShieldApplication() {
    const { setBackHandler } = useBackHandlerContext();
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createOptions } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const insets = useSafeAreaInsets();

    const [fabVisible, setFabVisible] = useState(true);
    const [changes, setChanges] = useState(false);
    const [selectedImage, setSelectedImage] = useState({});
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

    const [trainerStatus, setTrainerStatus] = useState(user.trainerProfile.trainerStatus === 'active');
    const [biography, setBiography] = useState(user.trainerProfile.biography);
    const [yearsOfExperience, setYearsOfExperience] = useState(user.trainerProfile.yearsOfExperience);
    const [images, setImages] = useState(user.trainerProfile.images);

    useEffect(() => {
        const obj = {
            userId: user.id,
            isVerified: user.trainerProfile.isVerified,
            trainerStatus: trainerStatus === true ? 'active' : 'inactive',
            biography,
            yearsOfExperience,
            images
        }

        const isChanged = JSON.stringify(obj) !== JSON.stringify(user?.trainerProfile);
        setChanges(isChanged);
    }, [trainerStatus, biography, yearsOfExperience, images, user.trainerProfile]);

    function handleYearsOfExperience() {
        createOptions({
            title: "Experience",
            options: ["New Trainer", "1 Year", "2 Years", "3+ Years", "6+ Years", "10+ Years"],
            current: yearsOfExperience,
            onConfirm: (selected) => {
                if (selected) {
                    setYearsOfExperience(selected);
                }
            }
        })
    }

    async function handleNewImage(asset) {
        const payload = {
            fileName: asset.fileName || asset.uri.split('/').pop(),
            url: asset.uri,
            type: asset.type || 'image/jpeg'
        }
        setImages(prev => [...prev, payload]);
    }

    async function handleNewUpdates() {
        try {
            showSpinner();

            const newImages = JSON.stringify(user.trainerProfile.images) !== JSON.stringify(images);
            let uploadedImages = images;

            if (newImages) {
                console.log('uploading images');
                uploadedImages = await Promise.all(
                    images.map(async (image) => {
                        if (!image.url.startsWith("http")) {
                            const url = await APIService.uploadImageToCloudinary({
                                uri: image.url,
                                folder: "user_trainer_profile_images",
                                fileName: `user${user.id}_${Date.now()}_${image.fileName}.jpg`,
                            });
                            return { ...image, url };
                        }
                        return image;
                    })
                );
            }

            setImages(uploadedImages);

            const payload = {
                userId: user.id,
                isVerified: user.trainerProfile.isVerified,
                trainerStatus: trainerStatus ? 'active' : 'inactive',
                biography,
                yearsOfExperience,
                images: uploadedImages,
            };

            const result = await APIService.user.trainerProfile.update(payload);

            if (result.success) {
                createToast({ message: "Trainer profile updated" });
                setUser(prev => ({
                    ...prev,
                    trainerProfile: payload,
                }));
            } else {
                createToast({ message: "Failed to update profile." });
            }
        } catch (err) {
            console.error(err);
            createToast({ message: "Error updating profile." });
        } finally {
            hideSpinner();
        }
    }

    return (
        <>
            <FloatingActionButton
                icon={Images.checkMark}
                label={"Confirm Changes"}
                iconSize={18}
                labelStyle={{ fontSize: scaleFont(14) }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                position={{ bottom: insets.bottom + 20, right: 20, left: 20 }}
                visible={fabVisible && changes}
                onPress={handleNewUpdates}
            />

            <FadeInOut visible={imagePreviewVisible} style={{ position: 'absolute', zIndex: 9999, top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <TouchableOpacity onPress={() => { setImagePreviewVisible(false), setSelectedImage({}), setFabVisible(true) }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(30), marginBottom: 15 }}>Tap anywhere to dismiss</AppText>
                    <Image source={{ uri: selectedImage.url }} style={{ width: 500, height: 500, alignSelf: 'center' }} resizeMode='contain' />
                    <AnimatedButton
                        title={'Delete Photo'}
                        onPress={() => { setImagePreviewVisible(false), setSelectedImage({}), setImages(images.filter(i => i.url !== selectedImage.url)), setFabVisible(true) }}
                        style={{ backgroundColor: colors.negativeRed, padding: 15, borderRadius: 30, width: '90%', marginTop: 15 }}
                        textStyle={{ fontSize: scaleFont(15) }}
                        leftImage={Images.trash}
                        leftImageStyle={{ width: 20, height: 20, marginEnd: 5 }}
                    />
                </TouchableOpacity>
            </FadeInOut>

            <View style={styles.main}>
                <ImageCapture onConfirm={async (image) => handleNewImage(image)} />
                <AppScroll extraBottom={200} onScrollSetStates={setFabVisible}>
                    <View style={{ alignItems: 'center' }}>
                        <Image source={Images.shield} style={{ width: 80, height: 80, tintColor: 'white', marginTop: 5 }} />
                        <AppText style={{ color: 'white', fontSize: scaleFont(22), fontWeight: 'bold', marginTop: 15 }}>Application for Shield of Trust</AppText>
                    </View>

                </AppScroll>
            </View>
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
        height: 140,
        minWidth: '100%',
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