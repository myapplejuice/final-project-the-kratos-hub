import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Keyboard, Linking, StyleSheet, TouchableOpacity, View } from "react-native";
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
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert, createOptions } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const insets = useSafeAreaInsets();

    const [fabVisible, setFabVisible] = useState(true);
    const [selectedImage, setSelectedImage] = useState({});
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

    const [summary, setSummary] = useState('');
    const [education, setEducation] = useState('');
    const [images, setImages] = useState([]);

    const [instagramLink, setInstagramLink] = useState('');
    const [facebookLink, setFacebookLink] = useState('');
    const [tikTokLink, setTikTokLink] = useState('');
    const [xLink, setXLink] = useState('');

    async function handleNewImage(asset) {
        const payload = {
            fileName: asset.fileName || asset.uri.split('/').pop(),
            url: asset.uri,
            type: asset.type || 'image/jpeg'
        }
        setImages(prev => [...prev, payload]);
    }

    async function handleSocialMediaLink(platform) {
        platform = platform.trim();

        const platformMap = {
            Instagram: {
                getUrl: handle => `https://www.instagram.com/${handle}`,
                link: instagramLink,
                setter: setInstagramLink,
            },
            Facebook: {
                getUrl: handle => `https://www.facebook.com/${handle}`,
                link: facebookLink,
                setter: setFacebookLink,
            },
            TikTok: {
                getUrl: handle => `https://www.tiktok.com/@${handle}`,
                link: tikTokLink,
                setter: setTikTokLink,
            },
            X: {
                getUrl: handle => `https://x.com/${handle}`,
                link: xLink,
                setter: setXLink,
            },
        };

        const link = platformMap[platform];
        if (!link) return;

        const cleanHandle = handle =>
            handle.replace(/^https?:\/\/(www\.)?(instagram\.com|facebook\.com|tiktok\.com|x\.com|twitter\.com)\/@?/, '');

        if (!link.link) {
            createInput({
                title: 'Social Media Link',
                confirmText: 'Ok',
                text: `Enter your ${platform} handle (e.g. ${user.firstname}.${user.lastname})`,
                placeholders: [platform],
                onSubmit: async ([handle]) => {
                    if (!handle) return;
                    link.setter(link.getUrl(cleanHandle(handle.trim())));
                },
            });
            return;
        }

        createDialog({
            title: 'Social Media Link',
            text: `Do you wish to change your ${platform} link or test it?`,
            confirmText: 'Change Link',
            abortText: 'Go To Link',
            onConfirm: () => {
                createInput({
                    title: 'Social Media Link',
                    confirmText: 'Ok',
                    text: `Enter your ${platform} handle (e.g. ${user.firstname}.${user.lastname})`,
                    placeholders: [platform],
                    onSubmit: async ([handle]) => {
                        if (!handle) return;
                        link.setter(link.getUrl(cleanHandle(handle.trim())));
                    },
                });
            },
            onAbort: async () => {
                await Linking.openURL(link.link).catch(err =>
                    console.warn('Failed to open link', err)
                );
            },
        });
    }

    function handleSocialMediaReset() {
        createDialog({
            title: 'Reset Links',
            text: 'Are you sure you want to reset your social media links?',
            confirmText: 'Reset',
            confirmButtonStyle: { backgroundColor: colors.negativeRed, borderColor: colors.negativeRed },
            onConfirm: () => {
                setInstagramLink('');
                setFacebookLink('');
                setTikTokLink('');
                setXLink('');
            },
        })
    }

    async function handleSubmittion() {
        const formFillCount = [
            summary.trim() !== '',
            education.trim() !== '',
            images.length > 0,
            instagramLink.trim() !== '',
            facebookLink.trim() !== '',
            tikTokLink.trim() !== '',
            xLink.trim() !== '',
        ].filter(Boolean).length;

        if (formFillCount < 2) return createToast({ message: 'Please fill out at least 2 sections before submitting' });

        createDialog({
            title: 'Submit Application',
            text: 'Are you sure you want to submit your application?',
            confirmText: 'Submit',
            onConfirm: async () => {
                try {
                    showSpinner();

                    const uploadedImages = await Promise.all(
                        images.map(async (image) => {
                            if (!image.url.startsWith("http")) {
                                const url = await APIService.uploadImageToCloudinary({
                                    uri: image.url,
                                    folder: "verification_application_images",
                                    fileName: `user${user.id}_${Date.now()}_${image.fileName}.jpg`,
                                });
                                return { ...image, url };
                            }
                            return image;
                        })
                    );

                    setImages(uploadedImages);

                    const payload = {
                        userId: user.id,
                        status: 'pending',
                        summary,
                        education,
                        images: uploadedImages,
                        links: [
                            instagramLink || '',
                            facebookLink || '',
                            tikTokLink || '',
                            xLink || '',
                        ]
                    }

                    const result = await APIService.verification.apply(payload);
                    console.log('result', result)
                    if (result.success) {
                        createAlert({ title: 'Success', text: 'Your application has been submitted!\n\nYou will be notified when we review your application.', onPress: () => router.replace(routes.SHIELD_APPLICATIONS) });
                    } else {
                        createToast({ message: "Failed to update profile." });
                    }
                }
                catch (err) {
                    console.error("Image upload failed:", err);
                } finally {
                    hideSpinner();
                }
            }
        })

    }

    return (
        <>
            <ImageCapture onConfirm={async (image) => handleNewImage(image)} />
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

            <FloatingActionButton
                icon={Images.shield}
                label={"Submit Application"}
                iconSize={18}
                labelStyle={{ fontSize: scaleFont(14) }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                position={{ bottom: insets.bottom + 20, right: 20, left: 20 }}
                visible={fabVisible}
                onPress={handleSubmittion}
            />

            <AppScroll extraBottom={200} onScrollSetStates={setFabVisible}>
                <View style={{ alignItems: 'center' }}>
                    <Image source={Images.shield} style={{ width: 80, height: 80, tintColor: 'white', marginTop: 25 }} />
                    <AppText style={{ color: 'white', fontSize: scaleFont(22), fontWeight: 'bold', marginTop: 15 }}>Application for Shield of Trust</AppText>
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12), textAlign: 'center', lineHeight: 20, marginTop: 5, marginHorizontal: 15 }}>
                        Fill out the form below - while all sections are optional, you must complete at least two to submit your application. However, it's strongly recommended that you complete the entire form to strengthen your application and improve your chances of approval.
                    </AppText>
                </View>

                <Divider orientation='horizontal' style={{ marginVertical: 15 }} />

                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>Summary</AppText>
                    <AppText style={styles.inputHint}>
                        Write about your experience as a professional trainer
                    </AppText>
                    <AppTextInput
                        multiline
                        value={summary}
                        onChangeText={setSummary}
                        style={styles.bioInput}
                        placeholder='Experience, specialties, achievements, and what makes you a great trainer...'
                        placeholderTextColor={colors.mutedText}
                        textAlignVertical='top'
                        textAlign='left'
                        fontSize={14}
                        color='white'
                        fontWeight='normal'
                    />
                </View>

                <View style={styles.section}>
                    <AppText style={styles.sectionTitle}>Education</AppText>
                    <AppText style={styles.inputHint}>
                        Write about your educational background
                    </AppText>
                    <AppTextInput
                        multiline
                        value={education}
                        onChangeText={setEducation}
                        style={styles.bioInput}
                        placeholder='College, university, or other educational or academic institution...'
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
                        <AppText style={styles.sectionSubtitle}>
                            Your work, certificates and achievements to support your application
                        </AppText>
                    </View>

                    {images.length > 0 && (
                        <>
                            {images.map((image, index) => (
                                <TouchableOpacity onPress={() => { setSelectedImage(image), setImagePreviewVisible(true) }} key={index}
                                    style={[{
                                        flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 20, backgroundColor: colors.cardBackground,
                                        borderRadius: 20, marginBottom: 10, alignItems: 'center'
                                    }]}>
                                    <AppText numberOfLines={1} ellipsizeMode="tail" style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(12), width: '91%' }}>{image.fileName}</AppText>
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

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <AppText style={styles.sectionTitle}>Social Media</AppText>
                        <AppText style={styles.sectionSubtitle}>
                            Link your social media profiles if any...
                        </AppText>
                    </View>


                    <TouchableOpacity onPress={() => handleSocialMediaLink('Instagram')} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.cardBackground, padding: 12, borderRadius: 20, alignItems: 'center', marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={Images.instagram} style={{ width: 30, height: 30 }} />
                            <AppText style={{ color: 'white', marginStart: 10, fontWeight: 'bold', fontSize: scaleFont(12) }}>{instagramLink || 'Not Linked'}</AppText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleSocialMediaLink('Facebook')} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.cardBackground, padding: 12, borderRadius: 20, alignItems: 'center', marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={Images.facebook} style={{ width: 30, height: 30 }} />
                            <AppText style={{ color: 'white', marginStart: 10, fontWeight: 'bold', fontSize: scaleFont(12) }}>{facebookLink || 'Not Linked'}</AppText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleSocialMediaLink('TikTok')} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.cardBackground, padding: 12, borderRadius: 20, alignItems: 'center', marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={Images.tiktokTwo} style={{ width: 30, height: 30 }} />
                            <AppText style={{ color: 'white', marginStart: 10, fontWeight: 'bold', fontSize: scaleFont(12) }}>{tikTokLink || 'Not Linked'}</AppText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleSocialMediaLink('X')} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.cardBackground, padding: 12, borderRadius: 20, alignItems: 'center', marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={Images.xTwo} style={{ width: 30, height: 30, tintColor: 'white' }} />
                            <AppText style={{ color: 'white', marginStart: 10, fontWeight: 'bold', fontSize: scaleFont(12) }}>{xLink || 'Not Linked'}</AppText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white' }} />
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleSocialMediaReset} style={{ width: 150, alignSelf: 'center', backgroundColor: colors.negativeRed, padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 15 }}>
                    <AppText style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(12) }}>Reset Links</AppText>
                </TouchableOpacity>

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