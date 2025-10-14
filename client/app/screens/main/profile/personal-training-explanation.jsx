import * as FileSystem from 'expo-file-system/legacy';
import { Image } from "expo-image";
import { router } from "expo-router";
import { useContext } from "react";
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

export default function PersonalTrainingExplanation() {
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, } = usePopups();
    const { user, setUser } = useContext(UserContext);

   return (
    <View style={styles.main}>
        <ImageCapture />
        <AppScroll extraBottom={20}>
            <View style={styles.card}>
                <AppText style={styles.cardLabel}>Training Profile Explained</AppText>

                <View style={styles.stepsContainer}>
                    <View style={styles.stepItem}>
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <AppText style={styles.stepNumberText}>1</AppText>
                            </View>
                            <AppText style={styles.stepTitle}>Mark Yourself as a Trainer</AppText>
                        </View>
                        <AppText style={styles.stepDescription}>
                            Set your profile as a trainer so others in the community can see your availability, contact you, or send friend requests to collaborate.
                        </AppText>
                    </View>

                    <View style={styles.stepItem}>
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <AppText style={styles.stepNumberText}>2</AppText>
                            </View>
                            <AppText style={styles.stepTitle}>Build Your Training Profile</AppText>
                        </View>
                        <AppText style={styles.stepDescription}>
                            Add a short biography, your experience, specialties, and upload photos or videos of your work. Keep it updated to show your skills and availability.
                        </AppText>
                    </View>

                    <View style={styles.stepItem}>
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <AppText style={styles.stepNumberText}>3</AppText>
                            </View>
                            <AppText style={styles.stepTitle}>Connect With Users</AppText>
                        </View>
                        <AppText style={styles.stepDescription}>
                            Interested users can reach out to you directly or send a friend request to work together.
                        </AppText>
                    </View>

                    <View style={styles.stepItem}>
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <AppText style={styles.stepNumberText}>4</AppText>
                            </View>
                            <AppText style={styles.stepTitle}>Verification Badge (Optional)</AppText>
                        </View>
                        <AppText style={styles.stepDescription}>
                            Submit certificates or documents to apply for a badge that marks you as a trusted trainer. Verification is optional but adds credibility.
                        </AppText>
                    </View>
                </View>
            </View>
        </AppScroll>
    </View>
);
}
const styles = StyleSheet.create({
    cardLabel: {
        fontSize: scaleFont(16),
        color: 'white',
        fontWeight: '700',
    },
    stepItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 3,
        borderLeftColor: colors.main,
        marginTop: 15
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.main,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        fontSize: scaleFont(12),
        color: 'white',
        fontWeight: 'bold',
    },
    stepTitle: {
        fontSize: scaleFont(14),
        color: 'white',
        fontWeight: '600',
        flex: 1,
    },
    stepDescription: {
        fontSize: scaleFont(13),
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
        marginLeft: 36, // Aligns with step title text
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
    label: { fontSize: scaleFont(12), color: 'white', fontWeight: '600', marginStart: 15 },
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