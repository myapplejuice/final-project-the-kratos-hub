import { Keyboard, StyleSheet, View, } from "react-native";
import { useState, useEffect } from "react";
import { router, usePathname } from "expo-router";
import usePopups from "../../common/hooks/use-popups";
import AnimatedButton from "../../components/screen-comps/animated-button";
import ProgressDots from "../../components/screen-comps/progress-dots";
import { scaleFont } from "../../common/utils/scale-fonts";
import TextButton from "../../components/screen-comps/text-button";
import { useBackHandlerContext } from "../../common/contexts/back-handler-context";
import { routes } from "../../common/settings/constants";
import { Dimensions } from "react-native";
import AppText from "../../components/screen-comps/app-text";
import AppTextInput from "../../components/screen-comps/app-text-input";
import APIService from "../../common/services/api-service";
import AppScroll from "../../components/screen-comps/app-scroll";

export default function Recovery() {
    const [emailInputDisplay, setEmailInputDisplay] = useState(true);
    const [token, setToken] = useState();
    const [email, setEmail] = useState();
    const [recoveryCode, setRecoveryCode] = useState();
    const [recoveryCodeConfirmationDisplay, setRecoveryCodeConfirmationDisplay] = useState(false);
    const [recoveryCodeConfirmation, setRecoveryCodeConfirmation] = useState();
    const [passwordInputDisplay, setPasswordInputDisplay] = useState(false);
    const [password, setPassword] = useState();
    const [passwordConfirmation, setPasswordConfirmation] = useState();
    const { createAlert, createDialog, showSpinner, hideSpinner } = usePopups();
    const { setBackHandler } = useBackHandlerContext();
    const screen = usePathname();

    useEffect(() => {
        if (screen !== routes.RECOVERY) return;

        setBackHandler(() => {
            if (!emailInputDisplay)
                createDialog({
                    title: 'Password Recovery',
                    text: 'Are you sure you want to cancel your recovery proccess?',
                    onConfirm: () => router.back()
                })
            else
                router.back()
            return true;
        })
    }, [emailInputDisplay, screen]);

    async function initRecovery() {
        Keyboard.dismiss();
        showSpinner();

        if (!email) {
            createAlert({ title: 'Password Recovery', text: 'Please fill in your account email!' })
        } else {
            const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString()
            const result = await APIService.user.recoveryMail({ email, recoveryCode });

            if (result.success) {
                const token = result.data.token;
                setEmailInputDisplay(false);
                setRecoveryCodeConfirmationDisplay(true);
                setToken(token);
                setRecoveryCode(recoveryCode);
            } else {
                createAlert({ title: 'Password Recovery', text: result.message ?? "Password recovery failed!\nPlease try again later!" });
            }
        }
        hideSpinner();
    }

    function validateCode() {
        Keyboard.dismiss()

        if (recoveryCode != recoveryCodeConfirmation) {
            createAlert({ title: 'Password Recovery', text: "Incorrect code!\nPlease try again" });
        } else {
            setRecoveryCodeConfirmationDisplay(false)
            setPasswordInputDisplay(true)
        }
    }

    async function initPasswordChange() {
        showSpinner();
        Keyboard.dismiss();

        if (!password || !passwordConfirmation) {
            createAlert({ title: 'Password Recovery', text: "Please fill in both fields!" });
        } else if (password != passwordConfirmation) {
            createAlert({ title: 'Password Recovery', text: "Password doesnt match!\nPlease try again" });
        } else {
            updateUser()
        }
    }

    async function updateUser() {
        const result = await APIService.user.updateByRecovery({ email, password }, token)

        createAlert(
            result.success
                ? { title: 'Password Recovery', text: "Password successfully changed!\nPlease try logging in now", onPress: () => router.back() }
                : { title: 'Password Recovery', text: result.message ?? "Password recovery failed!\nPlease try again later" }
        );
        hideSpinner();
    }

    function cancelRecovery() {
        if (!emailInputDisplay)
            createDialog({ title: 'Password Recovery', text: 'Are you sure you want to cancel your recovery process?', onConfirm: () => router.back() })
        else
            router.back()
    }

    return (
        <AppScroll extraTop={20}>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={styles.header}>
                    <AppText style={styles.screenTitle}>Password Recovery</AppText>
                    <ProgressDots
                        steps={[emailInputDisplay, recoveryCodeConfirmationDisplay, passwordInputDisplay]}
                        activeColor="rgb(0,140,255)"
                        inactiveColor="rgb(82, 82, 82)"
                    />
                </View>

                {emailInputDisplay && (
                    <View>
                        <AppText style={styles.instructionText}>
                            Please enter your email to receive recovery code
                        </AppText>
                        <AppTextInput

                            onChangeText={setEmail}
                            placeholder="Email"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            style={styles.input}
                        />
                        <AnimatedButton title="Send Email" onPress={initRecovery} style={styles.button} textStyle={styles.buttonText} />
                        <View style={styles.cancelContainer}>
                            <TextButton
                                mainText={"Cancel recovery"}
                                mainTextStyle={styles.cancelButton}
                                onPress={cancelRecovery} />
                        </View>
                    </View>
                )}

                {recoveryCodeConfirmationDisplay && (
                    <View>
                        <AppText style={styles.instructionText}>
                            Please enter the recovery code sent to your email
                        </AppText>
                        <AppTextInput

                            onChangeText={setRecoveryCodeConfirmation}
                            placeholder="Recovery code"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            style={styles.input}
                            inputMode="numeric"
                        />
                        <AnimatedButton title="Submit" onPress={validateCode} style={styles.button} textStyle={{ fontSize: scaleFont(12) }} />
                        <View style={styles.cancelContainer}>
                            <TextButton
                                mainText={"Cancel recovery"}
                                mainTextStyle={styles.cancelButton}
                                onPress={cancelRecovery} />
                        </View>
                    </View>
                )}

                {passwordInputDisplay && (
                    <View>
                        <AppText style={styles.instructionText}>
                            Please enter a new password
                        </AppText>
                        <AppTextInput

                            onChangeText={setPassword}
                            placeholder="Password"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            style={styles.input}
                        />
                        <AppTextInput

                            onChangeText={setPasswordConfirmation}
                            placeholder="Confirm password"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            style={[styles.input, {marginTop: 0}]}
                        />
                        <AnimatedButton title="Update Password" onPress={initPasswordChange} style={styles.button} textStyle={{ fontSize: scaleFont(12) }} />
                        <View style={styles.cancelContainer}>
                            <TextButton
                                mainText={"Cancel recovery"}
                                mainTextStyle={styles.cancelButton}
                                onPress={cancelRecovery} />
                        </View>
                    </View>
                )}
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "rgb(10, 10, 10)",
    },

    header: {
        marginBottom: 20
    },
    title: {
        fontWeight: "bold",
        fontSize: scaleFont(40),
        color: "rgb(0, 140, 255)"
    },
    screenTitle: {
        fontSize: scaleFont(35),
        color: "rgb(0, 140, 255)",
    },

    cancelContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        alignSelf: 'center',
        marginVertical: 10,
    },
    cancelButton: {
        textAlign: 'center',
        color: 'rgb(0,140,255)'
    },
    instructionText: {
        paddingHorizontal: 10,
        fontSize: scaleFont(13),
        color: "rgb(255,255,255)",
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
    button: {
        marginVertical: 10,
        backgroundColor: 'rgb(0, 140, 255)',
        width: Dimensions.get('window').width * 0.9,
        height: 50,
        borderRadius: 20
    },
    buttonText: {
        fontSize: scaleFont(12)
    }
});
