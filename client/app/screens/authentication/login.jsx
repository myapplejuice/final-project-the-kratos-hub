import { Keyboard, StyleSheet, View, Dimensions, Image, TouchableOpacity } from "react-native";
import { useState, useContext, use } from "react";
import { router } from "expo-router";
import usePopups from "../../common/hooks/use-popups";
import AnimatedButton from "../../components/screen-comps/animated-button";
import TextButton from "../../components/screen-comps/text-button"
import { scaleFont } from '../../common/utils/scale-fonts';
import { UserContext } from "../../common/contexts/user-context";
import { routes } from '../../common/settings/constants'
import { Images } from "../../common/settings/assets";
import AppText from "../../components/screen-comps/app-text";
import AppTextInput from "../../components/screen-comps/app-text-input";
import DeviceStorageService from "../../common/services/device-storage-service";
import APIService from "../../common/services/api-service";
import AppScroll from '../../components/screen-comps/app-scroll';

export default function Login() {
    const { createAlert, showSpinner, hideSpinner } = usePopups();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const { setUser } = useContext(UserContext);

    async function initSignIn() {
        Keyboard.dismiss();
        showSpinner();

        if (!email || !password) {
            createAlert({ title: "Login", text: "Please fill in all the fields" });
        } else {
            const payload = { email, password };
            const result = await APIService.user.login(payload);

            if (result.success) {
                const token = result.data.token;
                const userProfile = await DeviceStorageService.initUserSession(token);
                if (!userProfile) {
                    createAlert({ title: "Login Failed", text: 'Internal Server Error, please try again later!' });
                } else {
                    setUser(userProfile);
                    router.replace(routes.HOMEPAGE);
                }
            } else {
                createAlert({ title: "Login Failed", text: "One or both credentials are wrong!" });
            }
        }
        hideSpinner();
    }

    return (
        <AppScroll extraTop={0}>
            <View style={styles.titleContainer}>
                <TouchableOpacity style={styles.arrowContainer} onPress={() => router.back()}>
                    <Image source={Images.arrow} style={styles.arrow} />
                </TouchableOpacity>
                <AppText style={styles.screenTitle}>Sign in</AppText>
            </View>
            <View style={styles.formContainer}>
                <AppTextInput
                    onChangeText={(value) => setEmail(value)}
                    placeholder="Email"
                    placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                    style={styles.input}
                />
                <AppTextInput

                    secureTextEntry={true}
                    onChangeText={(value) => setPassword(value)}
                    placeholder="Password"
                    placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                    style={styles.input}
                />
                <AnimatedButton
                    title="Sign In"
                    onPress={initSignIn}
                    style={styles.button}
                    textStyle={styles.buttonText}
                />
                <TextButton

                    onPress={() => router.push(routes.RECOVERY)}
                    mainText="I forgot my password"
                    mainTextStyle={styles.recovery}
                />
                <TextButton

                    onPress={() => router.push(routes.REGISTER)}
                    mainText="Don't have an account?"
                    linkText="Click here"
                    mainTextStyle={styles.registerText}
                    linkTextStyle={styles.registerLink}
                />
            </View>
        </AppScroll>
    )
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: "rgb(10, 10, 10)",
    },
    scrollViewContent: {
        flexGrow: 1,
        backgroundColor: "rgb(10, 10, 10)",
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
        marginVertical: 20
    },
    screenTitle: {
        fontSize: scaleFont(35),
        color: "rgb(0, 140, 255)",
    },
    arrowContainer: {
        transform: [{ scaleX: -1 }],
        position: "absolute",
        left: 20,
    },
    arrow: {
        width: 30,
        height: 30,
    },
    formContainer: {
        justifyContent: "flex-start",
        alignItems: "center",
    },
    input: {
        width: Dimensions.get('window').width * 0.9,
        height: 50,
        color: "rgb(255, 255, 255)",
        borderColor: "black",
        borderWidth: 1,
        marginVertical: 15,
        borderRadius: 15,
        padding: 7,
        backgroundColor: "rgb(39, 40, 56)",
    },
    recovery: {
        color: 'rgb(0, 140, 255)',
        fontSize: scaleFont(12),
        marginVertical: 15
    },
    registerText: {
        color: 'white',
        fontSize: scaleFont(12)
    },
    registerLink: {
        color: 'rgb(0, 140, 255)',
        fontSize: scaleFont(12)
    },
    button: {
        marginVertical: 15,
        backgroundColor: 'rgb(0, 140, 255)',
        width: Dimensions.get('window').width * 0.9,
        height: 50,
        borderRadius: 20
    },
    buttonText: {
        fontSize: scaleFont(12)
    }
});