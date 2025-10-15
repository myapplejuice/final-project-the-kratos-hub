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

export default function BadgeOfTrust() {
    const { setLibraryActive } = useContext(LibraryContext);
    const { setCameraActive } = useContext(CameraContext);
    const { createSelector, createToast, hideSpinner, showSpinner, createDialog, createInput, } = usePopups();
    const { user, setUser } = useContext(UserContext);

    return (
        <View style={styles.main}>
            <ImageCapture />
            <AppScroll extraBottom={200}>
                <View style={{ marginBottom: 15 }}>
                    <View style={{ alignSelf: 'center', justifyContent: 'center', alignItems: 'center', padding: 15, backgroundColor: colors.cardBackground, borderRadius: 60, width: 120, height: 120 }}>
                        <Image source={Images.shield} style={{ width: 80, height: 80, tintColor: colors.main, marginTop: 5 }} />
                    </View>
                    <AppText style={[{ textAlign: 'center', fontSize: scaleFont(22), fontWeight: 'bold', color: colors.main, marginTop: 15 }]}>Shield of Trust</AppText>
                    <AppText style={{ color: colors.mutedText, fontSize: scaleFont(12), textAlign: 'center', fontWeight: 'bold', marginTop: 5 }}>A mark of credibility & trust in the Kratos Hub family</AppText>
                </View>

                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ width: '47%', alignItems: 'center', justifyContent: 'center', height: 100, borderRadius: 20, backgroundColor: colors.backgroundTop }}>
                            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.backgroundSecond, justifyContent: 'center', alignItems: 'center' }}>
                                <Image source={Images.premiumTwo} style={{ width: 30, height: 30 }} />
                            </View>
                            <AppText style={{ color: 'white', fontWeight: 'bold', marginTop: 5 }}>Premium Visiblity</AppText>
                        </View>

                        <View style={{ width: '47%', alignItems: 'center', justifyContent: 'center', height: 100, borderRadius: 20, backgroundColor: colors.backgroundTop }}>
                            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.backgroundSecond, justifyContent: 'center', alignItems: 'center' }}>
                                <Image source={Images.credibilityTwo} style={{ width: 30, height: 30 }} />
                            </View>
                            <AppText style={{ color: 'white', fontWeight: 'bold', marginTop: 5 }}>Credibility</AppText>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                        <View style={{ width: '47%', alignItems: 'center', justifyContent: 'center', height: 100, borderRadius: 20, backgroundColor: colors.backgroundTop }}>
                            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.backgroundSecond, justifyContent: 'center', alignItems: 'center' }}>
                                <Image source={Images.clientTwo} style={{ width: 30, height: 30 }} />
                            </View>
                            <AppText style={{ color: 'white', fontWeight: 'bold', marginTop: 5 }}>More Clients</AppText>
                        </View>

                        <View style={{ width: '47%', alignItems: 'center', justifyContent: 'center', height: 100, borderRadius: 20, backgroundColor: colors.backgroundTop }}>
                            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.backgroundSecond, justifyContent: 'center', alignItems: 'center' }}>
                                <Image source={Images.competitionTwo} style={{ width: 30, height: 30 }} />
                            </View>
                            <AppText style={{ color: 'white', fontWeight: 'bold', marginTop: 5 }}>Competitive Edge</AppText>
                        </View>
                    </View>
                </View>

                <View style={[styles.card, { flexDirection: 'row' }]}>
                    <View style={{ width: '10%' }}>
                        <Image source={Images.about} style={{ width: 23, height: 23, tintColor: 'white', marginEnd: 10 }} />
                    </View>
                    <View style={{ width: '90%' }}>
                        <AppText style={[styles.cardLabel,]}>Shield of Trust</AppText>
                        <AppText style={{ color: colors.detailText, lineHeight: 20, marginTop: 8 }}>
                            The Shield of Trust is a verification mark similar to popular social media verification badges such as Instagram and Facebook.
                        </AppText>
                        <AppText style={{ color: colors.detailText, lineHeight: 20, marginTop: 8 }}>
                            Being equipped with this shield would mean that you are a trusted trainer in the Kratos Hub community and with it it boosts your chances of attracting other athletes and getting more clients.
                        </AppText>
                    </View>
                </View>

                <View style={[styles.card, { flexDirection: 'row' }]}>
                    <View style={{ width: '10%' }}>
                        <Image source={Images.noHelp} style={{ width: 23, height: 23, tintColor: 'white', marginEnd: 10 }} />
                    </View>
                    <View style={{ width: '90%' }}>
                        <AppText style={[styles.cardLabel,]}>Is the shield mandatory?</AppText>
                        <AppText style={{ color: colors.detailText, lineHeight: 20, marginTop: 8 }}>
                            No. The shield is not mandatory for you to be marked as a trainer, but with it, you would stand out amongst other trainers in our platform.
                        </AppText>
                          <AppText style={{ color: colors.detailText, lineHeight: 20, marginTop: 8 }}>
                         With this shield, your credibility is higher than a regular trainer mark, granting you a competitive edge.
                        </AppText>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={[{ flexDirection: 'row' }]}>
                        <View style={{ width: '10%' }}>
                            <Image source={Images.shieldOutline} style={{ width: 23, height: 23, tintColor: 'white', marginEnd: 10 }} />
                        </View>
                        <View style={{ width: '90%' }}>
                            <AppText style={[styles.cardLabel,]}>How to get the Shield?</AppText>
                            <AppText style={{ color: colors.detailText, lineHeight: 20, marginTop: 8 }}>
                                You can submit an application for the Shield of Trust by filling out the form in your profile page.
                            </AppText>
                            <AppText style={{ color: colors.detailText, lineHeight: 20, marginTop: 8 }}>
                                There all will be explain further. And if your application is approved, you will be marked with the Shield of Trust.
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
        fontSize: scaleFont(18),
        color: 'white',
        fontWeight: '700',
    },
    stepItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 3,
        borderLeftColor: colors.main,
        marginBottom: 15
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
        padding: 20,
        marginTop: 15
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