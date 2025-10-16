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
import SocketService from '../../../common/services/socket-service';
import ExpandInOut from '../../../components/effects/expand-in-out';
import Invert from '../../../components/effects/invert';

export default function ShieldApplications() {
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, createAlert, createOptions } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const insets = useSafeAreaInsets();

    const [openApplication, setOpenApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fabVisible, setFabVisible] = useState(true);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        async function fetchUserApplications() {
            try {
                const result = await APIService.verification.fetchApplications();

                if (result.success) {
                    const applications = result.data.applications;
                    setApplications(applications);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

        fetchUserApplications()
    }, []);

    async function handleNewSubmittion() {
        if (user.trainerProfile.isVerified) return createToast({ message: 'You are already a verified member with a Shield of Trust' });
        if (applications.some(app => app.status === 'pending'))
            return createToast({ message: 'You already have a pending application' });

        router.replace(routes.SHIELD_APPLICATION);
    }

    function handleApplicationPress(application) {
        router.replace({
            pathname: routes.SHIELD_APPLICATION_REVIEW,
            params: { application: JSON.stringify(application) }
        });
    }

    async function handleApplicationCancelation(applicationId) {
        createDialog({
            title: 'Cancel Application',
            text: 'Are you sure you want to cancel this application?',
            confirmText: 'Cancel',
            confirmButtonStyle: { backgroundColor: colors.negativeRed, borderColor: colors.negativeRed },
            onConfirm: async () => {
                try {
                    showSpinner();

                    const result = await APIService.verification.cancel({ applicationId });

                    if (result.success) {
                        setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status: 'cancelled' } : app));
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    return (
        <>

            <FloatingActionButton
                icon={Images.plus}
                iconSize={22}
                style={{ backgroundColor: colors.accentGreen }}
                position={{ bottom: insets.bottom + 20, right: 20 }}
                visible={fabVisible}
                onPress={handleNewSubmittion}
            />

            <AppScroll extraBottom={200} onScrollSetStates={setFabVisible}>
                {!loading ?
                    applications.length > 0 ?
                        <View style={{ marginTop: 15 }}>
                            {applications.map((application, index) => (
                                <View key={index} style={[styles.card, { marginBottom: 15, borderWidth: application.status === 'pending' ? 1 : 0, borderColor: colors.accentYellow + '50' }]}>
                                    <TouchableOpacity onPress={() => setOpenApplication(openApplication === application.id ? null : application.id)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ justifyContent: 'center' }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
                                                <AppText style={[styles.cardTitle, { fontSize: scaleFont(16) }]}>{formatDate(application.dateOfCreation, { format: user.preferences.dateFormat.key })}</AppText>
                                                <AppText style={{ marginStart: 10, textAlign: 'center', fontSize: scaleFont(10), color: 'white', backgroundColor: application.status === 'pending' ? colors.accentYellow : application.status === 'accepted' ? colors.accentGreen : colors.negativeRed, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                                                    {application.status === 'pending' ? 'Under Review' : application.status === 'accepted' ? 'Approved' : application.status === 'cancelled' ? 'Cancelled' : 'Denied'}
                                                </AppText>
                                            </View>
                                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12), marginTop: 2 }}>
                                                Application #{index + 1}
                                            </AppText>
                                        </View>
                                        <Invert axis='horizontal' inverted={openApplication === application.id} style={{ alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={Images.arrow} style={{ width: 15, height: 18, tintColor: 'white', transform: [{ rotate: '90deg' }] }} />
                                        </Invert>
                                    </TouchableOpacity>
                                    <ExpandInOut removeWhenHidden visible={openApplication === application.id} style={{}}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 }}>
                                            {application.status === 'pending' &&
                                                <AnimatedButton
                                                    onPress={() => handleApplicationCancelation(application.id)}
                                                    leftImage={Images.xMark}
                                                    title={"Cancel"} textStyle={{ fontSize: scaleFont(14) }}
                                                    leftImageStyle={{ textColor: colors.negativeRed, marginEnd: 5 }}
                                                    style={{ width: '48%', backgroundColor: colors.negativeRed, padding: 15, borderRadius: 20 }}
                                                />
                                            }
                                            <AnimatedButton
                                                onPress={() => handleApplicationPress(application)}
                                                rightImage={Images.arrow} title={"View App"}
                                                textStyle={{ fontSize: scaleFont(14) }}
                                                rightImageStyle={{ textColor: colors.negativeRed, marginStart: 5 }}
                                                style={{ width: application.status === 'pending' ? '48%' : '100%', backgroundColor: colors.main, padding: 15, borderRadius: 20 }}
                                            />
                                        </View>
                                    </ExpandInOut>
                                </View>
                            ))}
                        </View>
                        :
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: colors.background }}>
                            <Image source={Images.shield} style={{ width: 100, height: 100, tintColor: colors.mutedText + '40' }} />
                            <AppText style={{ color: colors.mutedText + '60', fontWeight: 'bold', fontSize: scaleFont(25), marginTop: 15 }}>
                                You don't have any applications
                            </AppText>
                            <AppText style={{ color: colors.mutedText, fontSize: scaleFont(15), marginTop: 5, textAlign: 'center' }}>
                                You can submit by clicking on the '+' button
                            </AppText>
                        </View>
                    :
                    <View style={{ marginTop: 15 }}>
                        <View style={[styles.card, { height: '40%' }]} />
                        <View style={[styles.card, { height: '50%', marginTop: 25 }]} />
                    </View>
                }
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