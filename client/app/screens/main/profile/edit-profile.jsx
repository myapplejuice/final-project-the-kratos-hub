import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useContext } from "react";
import { UserContext } from "../../../common/contexts/user-context";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { colors } from "../../../common/settings/styling";
import { Image } from "expo-image";
import { Images } from '../../../common/settings/assets'
import usePopups from "../../../common/hooks/use-popups";
import APIService from "../../../common/services/api-service";
import AppText from "../../../components/screen-comps/app-text";
import Divider from "../../../components/screen-comps/divider";
import AppScroll from "../../../components/screen-comps/app-scroll";

export default function EditProfile() {
    const { createToast, hideSpinner, showSpinner, createInput } = usePopups();
    const { user, setUser } = useContext(UserContext);

    async function handleFullname() {
        createInput({
            title: "Change Fullname",
            confirmText: "Submit",
            text: "Enter your new fullname",
            initialValues: [user.firstname, user.lastname],
            placeholders: ["Firstname", "Lastname"],
            onSubmit: async ([firstname, lastname]) => {
                firstname = firstname.trim();
                lastname = lastname.trim();

                if (!firstname && !lastname) {
                    createToast({ message: "Firstname and lastname cannot be empty" });
                    return;
                }

                if (firstname === user.firstname && lastname === user.lastname) {
                    createToast({ message: "No changes detected" });
                    return;
                }

                const payload = {};
                const nameRegex = /^[A-Za-z'-]+( [A-Za-z'-]+)*$/;

                if (firstname && firstname !== user.firstname) {
                    if (!nameRegex.test(firstname)) {
                        createToast({ message: "Firstname must contain only letters" });
                        return;
                    }
                    payload.firstname = firstname;
                }

                if (lastname && lastname !== user.lastname) {
                    if (!nameRegex.test(lastname)) {
                        createToast({ message: "Lastname must contain only letters" });
                        return;
                    }
                    payload.lastname = lastname;
                }

                if (Object.keys(payload).length === 0) {
                    createToast({ message: "No changes detected" });
                    return;
                }

                showSpinner();
                const result = await APIService.user.update({ profile: payload });
                hideSpinner();

                if (result.success) {
                    setUser(prev => ({ ...prev, ...payload }));
                    createToast({ message: 'Fullname changed' });
                } else {
                    createToast({ message: "Update failure " + result.message });
                }
            },
        });
    }

    async function handleEmail() {
        createInput({
            title: "Change Email",
            confirmText: "Submit",
            text: "Enter your new email",
            initialValues: [user.email],
            placeholders: ["Email"],
            extraConfigs: [{ keyboardType: "email-address" }],
            onSubmit: async ([email]) => {
                email = email.trim();

                if (email === user.email) {
                    createToast({ message: "No changes detected." });
                    return;
                }

                if (!email) {
                    createToast({ message: "Email cannot be empty" });
                    return;
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    createToast({ message: "Please enter a valid email address" });
                    return;
                }

                const payload = { email };
                showSpinner();
                const result = await APIService.user.update({ profile: payload });
                hideSpinner();

                if (result.success) {
                    setUser(prev => ({ ...prev, ...payload }));
                    createToast({ message: "Email changed" });
                } else {
                    createToast({ message: "Update failure " + result.message });
                }
            },
        });
    }

    async function handlePhone() {
        createInput({
            title: "Change Phone",
            confirmText: "Submit",
            text: "Enter your new phone number",
            initialValues: [user.phone],
            placeholders: ["Phone"],
            extraConfigs: [{ keyboardType: "phone-pad" }],
            onSubmit: async ([phone]) => {
                phone = phone.trim();

                if (phone === user.phone) {
                    createToast({ message: "No changes detected." });
                    return;
                }

                if (!phone) {
                    createToast({ message: "Phone number cannot be empty." });
                    return;
                }

                const phoneRegex = /^[0-9+\-\s()]+$/;
                if (!phoneRegex.test(phone)) {
                    createToast({ message: "Please enter a valid phone number!" });
                    return;
                }

                const phoneDigits = phone.replace(/\D/g, '');
                if (phoneDigits.length < 7 || phoneDigits.length > 15) {
                    createToast({ message: "Enter a valid phone number!" });
                    return;
                }

                const payload = { phone };
                showSpinner();
                const result = await APIService.user.update({ profile: payload });
                hideSpinner();

                if (result.success) {
                    setUser(prev => ({ ...prev, ...payload }));
                    createToast({ message: "Phone number changed" });
                } else {
                    createToast({ message: "Update failure " + result.message });
                }
            },
        });
    }

    return (
        <AppScroll>
            <View style={styles.card}>
                <AppText style={[styles.cardLabel]}>
                    Personal Information
                </AppText>

                {[
                    { icon: Images.autograph, label: "Change Fullname", onPress: handleFullname },
                    { icon: Images.email, label: "Change Email", onPress: handleEmail },
                    { icon: Images.phoneTwo, label: "Change Phone", onPress: handlePhone },
                ].map((item, i) => (
                    <View key={i}>
                        <TouchableOpacity key={i} style={[styles.optionRow]} onPress={item.onPress}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                <View style={{ backgroundColor: 'rgba(61, 61, 61, 1)', padding: 8, borderRadius: 10 }}>
                                    <Image source={item.icon} style={styles.modeIcon} />
                                </View>
                                <AppText style={styles.label}>
                                    {item.label}
                                </AppText>
                            </View>
                            <Image source={Images.backArrow} style={[styles.arrow, { transform: [{ scaleX: -1 }] }]} />
                        </TouchableOpacity>

                        {i !== 2 && <Divider orientation='horizontal' style={{ marginVertical: 15 }} />}
                    </View>
                )
                )}
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: 15,
        margin: 15
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: scaleFont(12),
        color: 'white',
        fontWeight: '600',
        marginStart: 15
    },
    modeIcon: {
        width: 20,
        height: 20,
        tintColor: 'white'
    },
    arrow: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    }, cardLabel: {
        marginBottom: 15,
        fontSize: scaleFont(12),
        color: 'white',
        fontWeight: '600'
    },

});
