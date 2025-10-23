import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
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

export default function CommunityPostReportForm() {
    const reportedUserId = useLocalSearchParams().reportedUserId;
    const reportedPostId = useLocalSearchParams().reportedPostId;
    console.log(reportedUserId, reportedPostId)
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert, createOptions } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const insets = useSafeAreaInsets();

    const [fabVisible, setFabVisible] = useState(true);
    const [selectedImage, setSelectedImage] = useState({});
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

    const [offense, setOffense] = useState('');
    const [summary, setSummary] = useState('');
    const [images, setImages] = useState([]);

    async function handleNewImage(asset) {
        const payload = {
            fileName: asset.fileName || asset.uri.split('/').pop(),
            url: asset.uri,
            type: asset.type || 'image/jpeg'
        }
        setImages(prev => [...prev, payload]);
    }

    async function handleReport() {
        try {
            showSpinner();

            const uploadedImages = await Promise.all(
                images.map(async (image) => {
                    if (image.url?.includes("res.cloudinary.com")) {
                        return image;
                    }

                    try {
                        const url = await APIService.uploadImageToCloudinary({
                            uri: image.url || image.uri,
                            folder: "user_reports_images",
                            fileName: `user${user.id}_${Date.now()}_${image.fileName}_report_on_${reportedUserId}.jpg`,
                        });

                        return { ...image, url };
                    } catch (err) {
                        console.error(`Failed to upload image ${image.fileName}:`, err);
                        return image;
                    }
                })
            );

            setImages(uploadedImages);

            const payload = {
                userId: user.id,
                reportedUserId,
                type: "user",
                offense,
                summary,
                imagesURLS: uploadedImages.map(image => image.url)
            }

            const result = await APIService.reports.create(payload);
            if (result.success){
                createAlert({ title: 'User Report', text: "Your report has been submitted, we will review it as soon as possible and take appropriate action! Thank you for your patience.", onPress: () => router.back() });
            } else {
                createAlert({ title: 'Error', text: result.message });
            }
        } catch (e) {
            console.log(e);
        } finally {
            hideSpinner();
        }
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
                icon={Images.email}
                label={"Submit Report"}
                iconSize={18}
                labelStyle={{ fontSize: scaleFont(14) }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                position={{ bottom: insets.bottom + 20, right: 20, left: 20 }}
                visible={fabVisible}
                onPress={handleReport}
            />

            <AppScroll extraBottom={200} onScrollSetStates={setFabVisible} >
                <View style={{ alignItems: 'center' }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(22), fontWeight: 'bold', marginTop: 25, marginBottom: 15 }}>User Report Form</AppText>
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12), textAlign: 'center', lineHeight: 20, marginTop: 5, marginHorizontal: 15 }}>
                        Fill out the form below - explain briefly about the user's offense. Do not include any personal information or personal exchanges between you and the user. Unserious or unproven allegations should not be included. If the report is deemed to be valid, the user will be penalized.
                    </AppText>
                </View>

                <Divider orientation='horizontal' style={{ marginVertical: 25 }} />

                <AppText style={{ color: 'white', fontSize: scaleFont(16), fontWeight: 'bold', marginHorizontal: 15 }}>Offense</AppText>
                {['Hate Speech & Discrimination', 'Harassment', 'Trolling & Toxicity', 'Inappropriate Language', 'False Information', 'Spam', 'Other'].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.7}
                        onPress={() => setOffense(item)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 6,
                            padding: 10,
                            borderRadius: 10,
                            backgroundColor: offense === item ? 'rgba(96,165,250,0.12)' : 'rgba(255,255,255,0.05)',
                            marginHorizontal: 15,
                        }}
                    >
                        <View
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: offense === item ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10
                            }}
                        >
                            {offense === item && (
                                <View
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: '#60a5fa'
                                    }}
                                />
                            )}
                        </View>
                        <AppText style={{ color: 'white', fontSize: 16 }}>{item}</AppText>
                    </TouchableOpacity>
                ))}

                <View style={[styles.section, { marginVertical: 30 }]}>
                    <AppText style={styles.sectionTitle}>Summary</AppText>
                    <AppText style={styles.inputHint}>
                        Explain further about the user's offense in detail. Its best to provide a proper and complete argument.
                    </AppText>
                    <AppTextInput
                        multiline
                        value={summary}
                        onChangeText={setSummary}
                        style={styles.bioInput}
                        placeholder='Write your summary here...'
                        placeholderTextColor={colors.mutedText}
                        textAlignVertical='top'
                        textAlign='left'
                        fontSize={14}
                        color='white'
                        fontWeight='normal'
                    />
                </View>

                <View style={[styles.sectionHeader, { marginHorizontal: 15 }]}>
                    <AppText style={styles.sectionTitle}>Images</AppText>
                    <AppText style={styles.inputHint}>
                        Your work, certificates and achievements to support your application
                    </AppText>
                </View>

                {images.length > 0 && (
                    <>
                        {images.map((image, index) => (
                            <TouchableOpacity onPress={() => { setSelectedImage(image), setImagePreviewVisible(true) }} key={index}
                                style={[{
                                    flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: colors.cardBackground,
                                    borderRadius: 20, marginBottom: 10, alignItems: 'center', marginHorizontal: 15
                                }]}>
                                <AppText numberOfLines={1} ellipsizeMode="tail" style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(12), width: '91%' }}>{image.fileName}</AppText>
                                <View style={{ width: '9%', alignItems: 'center', flexDirection: 'row', }}>
                                    <Image source={Images.arrow} style={{ width: 20, height: 20, tintColor: 'white', marginStart: 10 }} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <View style={{ marginHorizontal: 15 }}>
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
        marginTop: 15,
        width: '100%',
        height: 100,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
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