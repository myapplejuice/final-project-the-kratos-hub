import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { scaleFont } from '../../utils/scale-fonts';
import { Images } from '../../utils/assets'
import AnimatedButton from '../../components/screen-comps/animated-button';
import { routes } from '../../utils/settings/constants';
import { router } from 'expo-router';
import FloatingIcons from '../../components/screen-comps/floating-icons';
import { colors } from '../../utils/settings/styling';
import AppText from '../../components/screen-comps/app-text';

export default function Introduction() {
    return (
        <View style={styles.main}>
            <FloatingIcons />
            <View style={styles.contentContainer}>
                <View style={styles.introductionContainer}>
                    <Image
                        style={styles.logo}
                        source={Images.logo}
                    />
                    <AppText style={styles.welcomeText}>Welcome to{'\n'}The Kratos Hub</AppText>
                    <AppText style={styles.introText}>Track workouts, connect with friends and coaches, and crush your goals!</AppText>
                </View>
                <View style={styles.buttonContainer}>
                    <AnimatedButton
                        title="Register"
                        onPress={() => router.push(routes.REGISTER)}
                        style={[styles.button, styles.registerButton]}
                        textStyle={[styles.buttonText, styles.registerButtonText]}
                    />
                    <AnimatedButton
                        title="Sign In"
                        onPress={() => router.push(routes.LOGIN)}
                        style={styles.button}
                        textStyle={styles.buttonText}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },

    introductionContainer: {
        flex: 2,
        width: "100%",
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    logo: {
        width: 180,
        height: 140
    },
    welcomeText: {
        textAlign: 'center',
        fontSize: scaleFont(40),
        fontWeight: 'bold',
        color: colors.main,
        marginVertical: 10,
    },
    introText: {
        textAlign: 'center',
        fontSize: scaleFont(18),
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'monospace',
        marginVertical: 10,
        marginHorizontal: 18,
    },
    button: {
        marginVertical: 15,
        backgroundColor: colors.main,
        width: Dimensions.get('window').width * 0.8,
        height: 50,
        borderRadius: 20
    },
    buttonText: {
        fontSize: scaleFont(12)
    },
    registerButton: {
        backgroundColor: colors.background,
        borderColor: colors.main,
        borderWidth: 1,
    },
    registerButtonText: {
        color: colors.main,
    }
});