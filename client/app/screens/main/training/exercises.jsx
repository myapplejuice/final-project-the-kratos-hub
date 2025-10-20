import { router, useLocalSearchParams, } from 'expo-router';
import { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppScroll from "../../../components/screen-comps/app-scroll";
import AppText from "../../../components/screen-comps/app-text";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import AppView from "../../../components/screen-comps/app-view";
import Divider from "../../../components/screen-comps/divider";
import FloatingActionButton from "../../../components/screen-comps/floating-action-button";
import { Images } from "../../../common/settings/assets";
import { UserContext } from "../../../common/contexts/user-context";
import { convertEnergy } from "../../../common/utils/unit-converter";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { routes } from "../../../common/settings/constants";
import { colors, nutritionColors } from "../../../common/settings/styling";
import FadeInOut from "../../../components/effects/fade-in-out";
import { CameraContext } from '../../../common/contexts/camera-context';
import BarcodeScanner from '../../../components/screen-comps/barcode-scanner';
import { exercises } from '../../../common/utils/global-options';
import ExerciseCard from './exercise-card';

export default function Exercises() {
    const params = useLocalSearchParams();
    const date = params.date;
    const { user } = useContext(UserContext);
    const { setCameraActive } = useContext(CameraContext);
    const insets = useSafeAreaInsets();
    const [fabVisible, setFabVisible] = useState(true);
    const [scrollToTop, setScrollToTop] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        console.log(params)
    }, []);

    return (
        <>
            <FloatingActionButton
                onPress={() => setScrollToTop(true)}
                visible={!fabVisible}
                position={{ bottom: insets.bottom + 40, left: 20 }}
                icon={Images.arrow}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
                iconSize={20}
                size={40}
            />

            <AppView style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.inputBackground, alignItems: 'center', borderRadius: 15, marginVertical: 15, height: 50 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '80%' }}>
                        <Image source={Images.magnifier} style={{ tintColor: colors.mutedText, width: 20, height: 20, marginHorizontal: 15 }} />
                        <AppTextInput
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            placeholder="Search"
                            placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                            style={styles.inputStripped} />
                    </View>
                </View>

                <Divider orientation="horizontal" thickness={2} color={colors.divider} style={{ borderRadius: 50, marginBottom: 15 }} />

                <AppScroll scrollToTop={scrollToTop} extraBottom={200} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} extraTop={0} topPadding={false}>
                        <ExerciseCard exercise={exercises[0]} />
                </AppScroll>
            </AppView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: 'white',
        marginHorizontal: 10,
        marginBottom: 10
    },
    inputStripped: {
        height: 50,
        color: "white",
        width: '100%',
    },
    input: {
        height: 50,
        color: "white",
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 15,
        marginHorizontal: 15,
        backgroundColor: colors.inputBackground
    },
    card: {
        backgroundColor: colors.cardBackground,
        padding: 15,
        borderRadius: 15,
        marginTop: 15,
        marginHorizontal: 15
    },
});