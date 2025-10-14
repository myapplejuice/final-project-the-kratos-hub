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

export default function PersonalTrainingProfile() {
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createOptions } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const insets = useSafeAreaInsets();

    const [fabVisible, setFabVisible] = useState(true);
    const [changes, setChanges] = useState(false);

    const [trainerStatus, setTrainerStatus] = useState(false);
    const [biography, setBiography] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState('New Trainer');

    useEffect(() => {
        const obj = {
            trainerStatus: trainerStatus,
            biography: biography,
            yearsOfExperience: yearsOfExperience
        }

        const isChanged = JSON.stringify(obj) !== JSON.stringify(user?.personalTrainingProfile);
        setChanges(isChanged);
    }, [trainerStatus, biography, yearsOfExperience]);

    async function handleNewUpdates() {

    }

    function handleYearsOfExperience() {
        createOptions({
            title: "Experience",
            options: ["New Trainer", "1 Year", "2 Years", "3+ Years", "6+ Years", "10+ Years"],
            current: yearsOfExperience,
            onConfirm: (selected) => {
                console.log(selected)
                if (selected) {
                    setYearsOfExperience(selected);
                }
            }

        })
    }

    function handleNewImage() {

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
                onPress={() => router.push(routes.FOOD_CREATOR)}
            />

            <View style={styles.main}>
                <ImageCapture />
                <AppScroll extraBottom={200} onScrollSetStates={setFabVisible}>
                    {/* Explanation Card */}
                    <View style={{ flexDirection: 'row', marginHorizontal: 15, justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            onPress={() => router.push(routes.PERSONAL_TRAINING_EXPLANATION)}
                            style={[styles.explanationCard, { width: '48%' }]}
                        >
                            <View style={styles.explanationContent}>
                                <Image
                                    source={Images.noHelp}
                                    style={styles.explanationIcon}
                                />
                                <View style={styles.explanationLeft}>

                                    <View style={styles.explanationText}>
                                        <AppText style={styles.explanationTitle}>
                                            What is training profile?
                                        </AppText>
                                    </View>
                                </View>

                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push(routes.PERSONAL_TRAINING_EXPLANATION)}
                            style={[styles.explanationCard, { width: '48%' }]}
                        >
                            <View style={styles.explanationContent}>
                                <Image
                                    source={Images.personalTrainer}
                                    style={styles.explanationIcon}
                                />
                                <View style={styles.explanationLeft}>

                                    <View style={styles.explanationText}>
                                        <AppText style={styles.explanationTitle}>
                                            Apply for Verification
                                        </AppText>
                                    </View>
                                </View>

                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Trainer Status Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <AppText style={styles.cardTitle}>Trainer Status</AppText>
                            <TouchableOpacity
                                onPress={() => setTrainerStatus(!trainerStatus)}
                                style={styles.toggleContainer}
                            >
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
                            </TouchableOpacity>
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
                            value={user.trainerBio}
                            onChangeText={setBiography}
                            style={styles.bioInput}
                            placeholder='Write about your experience, specialties, achievements, and what makes you a great trainer...'
                            placeholderTextColor={colors.mutedText}
                            textAlignVertical='top'
                            textAlign='left'
                            fontSize={14}
                            color='white'
                            fontWeight='normal'
                        />
                    </View>

                    {/* Years of Experience Card */}
                    <TouchableOpacity
                        onPress={handleYearsOfExperience}
                        style={styles.card}
                    >
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
                    </TouchableOpacity>

                    {/* Certificates Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AppText style={styles.sectionTitle}>Certificates & Awards</AppText>
                            <AppText style={styles.sectionSubtitle}>
                                Showcase your qualifications and achievements
                            </AppText>
                        </View>

                        {/* Optional: Show uploaded images preview 
                {uploadedImages.length > 0 && (
                    <View style={styles.imagesPreview}>
                        <AppText style={styles.previewTitle}>
                            Uploaded ({uploadedImages.length})
                        </AppText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {uploadedImages.map((image, index) => (
                                <View key={index} style={styles.imagePreview}>
                                    <Image source={{ uri: image }} style={styles.previewImage} />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}*/}

                        <TouchableOpacity
                            onPress={handleNewImage}
                            style={styles.uploadButton}
                        >
                            <View style={styles.uploadContent}>
                                <AppText style={styles.uploadText}>Upload Image</AppText>
                                <AppText style={styles.uploadHint}>
                                    PNG, JPG up to 10MB
                                </AppText>
                                <Image
                                    source={Images.arrow} // Replace with your upload icon
                                    style={[styles.uploadIcon, { transform: [{ rotate: '90deg' }], width: 25, height: 25, marginBottom: 0, marginTop: 10 }]}
                                />
                            </View>
                        </TouchableOpacity>
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
        fontSize: scaleFont(16),
    },
    // Toggle Switch
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecond,
        borderRadius: 12,
        overflow: 'hidden',
        minWidth: 100,
    },
    toggleOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        minWidth: 50,
    },
    toggleLeft: {
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    toggleRight: {
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    },
    toggleActive: {
        backgroundColor: colors.main,
    },
    toggleText: {
        color: colors.mutedText,
        fontWeight: '600',
        fontSize: scaleFont(13),
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
        width: 200,
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
    // Images Preview
    imagesPreview: {
        marginTop: 20,
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