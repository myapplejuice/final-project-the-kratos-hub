import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "../../../components/screen-comps/app-text";
import { Images } from '../../../common/settings/assets';
import { scaleFont } from "../../../common/utils/scale-fonts";
import { colors } from "../../../common/settings/styling";
import AppScroll from '../../../components/screen-comps/app-scroll'
import ImageCapture from '../../../components/screen-comps/image-capture';
import AppTextInput from '../../../components/screen-comps/app-text-input';
import FadeInOut from '../../../components/effects/fade-in-out';

export default function UserTrainerProfile() {
    const [selectedImage, setSelectedImage] = useState({});
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

    const profile = JSON.parse(useLocalSearchParams().profile);
    const trainerStatus = profile.trainerStatus === 'active';
    const biography = profile.biography;
    const yearsOfExperience = profile.yearsOfExperience;
    const images = profile.images;

    return (
        <>
            <FadeInOut visible={imagePreviewVisible} style={{ position: 'absolute', zIndex: 9999, top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <TouchableOpacity onPress={() => { setImagePreviewVisible(false), setSelectedImage({}) }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <AppText style={{ color: 'white', fontSize: scaleFont(30), marginBottom: 15 }}>Tap anywhere to dismiss</AppText>
                    <Image source={{ uri: selectedImage.url }} style={{ width: 500, height: 500, alignSelf: 'center' }} resizeMode='contain' />
                </TouchableOpacity>
            </FadeInOut>

            <View style={styles.main}>
                <ImageCapture onConfirm={async (image) => handleNewImage(image)} />
                <AppScroll extraBottom={300}>
                    {/* Trainer Status Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <AppText style={styles.cardTitle}>Trainer Status</AppText>
                            <View style={styles.toggleContainer} >
                                <View style={[
                                    styles.toggleOption,
                                    styles.toggleLeft,
                                    trainerStatus && styles.toggleActive
                                ]}>
                                    <AppText style={[
                                        styles.toggleText,
                                        trainerStatus && styles.toggleTextActive
                                    ]}>On</AppText>
                                </View>
                                <View style={[
                                    styles.toggleOption,
                                    styles.toggleRight,
                                    !trainerStatus && styles.toggleActive
                                ]}>
                                    <AppText style={[
                                        styles.toggleText,
                                        !trainerStatus && styles.toggleTextActive
                                    ]}>Off</AppText>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Professional Overview Section */}
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>Professional Overview</AppText>
                        <AppText style={styles.inputHint}>
                            This will be visible to potential clients
                        </AppText>
                        <AppTextInput
                            multiline
                            value={biography}
                            style={styles.bioInput}
                            placeholder='Write about yourself and your experience...'
                            placeholderTextColor={colors.mutedText}
                            textAlignVertical='top'
                            textAlign='left'
                            fontSize={14}
                            color='white'
                            fontWeight='normal'
                        />
                    </View>

                    {/* Years of Experience Card */}
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            <AppText style={styles.cardTitle}>Years of Experience</AppText>
                            <View style={styles.valueContainer}>
                                <AppText style={styles.valueText}>{yearsOfExperience}</AppText>
                                <Image
                                    source={Images.arrow}
                                    style={styles.arrowIcon}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Certificates Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AppText style={styles.sectionTitle}>Certificates & Awards</AppText>
                            <AppText style={styles.sectionSubtitle}>
                                Showcase your qualifications and achievements
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
        minHeight: 140,
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