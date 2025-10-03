import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from "expo-image";
import { useContext, useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppScroll from "../../../components/screen-comps/app-scroll";
import AppText from "../../../components/screen-comps/app-text";
import DateDisplay from "../../../components/screen-comps/date-display";
import Divider from "../../../components/screen-comps/divider";
import FloatingActionButton from "../../../components/screen-comps/floating-action-button";
import FloatingActionMenu from "../../../components/screen-comps/floating-action-menu";
import Meal from "../../../components/screen-comps/meal";
import ProgressBar from "../../../components/screen-comps/progress-bar";
import { Images } from "../../../common/settings/assets";
import { UserContext } from '../../../common/contexts/user-context';
import { convertEnergy, convertFluid } from "../../../common/utils/unit-converter";
import { formatDate } from '../../../common/utils/date-time';
import usePopups from "../../../common/hooks/use-popups";
import { scaleFont } from "../../../common/utils/scale-fonts";
import APIService from "../../../common/services/api-service";
import { colors, nutritionColors } from "../../../common/settings/styling";
import { getDayComparisons } from '../../../common/utils/date-time'
import { router } from 'expo-router';
import { routes } from '../../../common/settings/constants';
import { getSQLTime } from '../../../common/utils/date-time';
import { totalDayConsumption } from '../../../common/utils/metrics-calculator';
import FadeInOut from '../../../components/effects/fade-in-out';
import Invert from '../../../components/effects/invert';

export default function MealsPlans() {
    const { createInput, showSpinner, hideSpinner, createToast, createDialog } = usePopups();
    const { user, setUser, setAdditionalContexts } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const [scrollToTop, setScrollToTop] = useState(false);
    const [fabVisible, setFabVisible] = useState(true);

    async function handlePlanAddition() {
        createInput({
            title: "Meal Addition",
            confirmText: "ADD",
            text: `Enter a label & description for the plan`,
            placeholders: [`Meal Plan ${user.nutrition?.plans?.length + 1 || 1}`, `Write any explanation, notes, tips about your meal plan...`],
            initialValues: [``, ``],
            largeTextIndices: [1],
            onSubmit: async (vals) => {
                let label = vals[0];
                let description = vals[1];
                if (!label)
                    label = `Meal ${user.nutrition?.plans?.length + 1}`;

                if (!description)
                    description = `No description provided.`;

                showSpinner({ abandonable: true, text: "Adding meal plan...", abandonableText: 'Press "Hide" to continue using the app while you wait' });

                try {
                    //const result = await APIService.nutrition.meals.create({ nutritionLogId: currentDayLog.id, label, time });
                
                    if (result.success) {
                       
                    } else {
                        createToast({ message: result.message || "Failed to add meal" });
                    }
                } catch (err) {
                    console.error("Failed to add meal:", err);
                    createToast({ message: "Server error" });
                } finally {
                    hideSpinner();
                }
            },
        });
    }

    return (
        <>
            <FloatingActionButton
                onPress={() => setScrollToTop(true)}
                visible={!fabVisible}
                position={{ bottom: insets.bottom + 50, left: 20 }}
                icon={Images.arrow}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
                iconSize={20}
                size={40}
            />

            <FloatingActionButton
                onPress={handlePlanAddition}
                visible={fabVisible}
                position={{ bottom: insets.bottom + 50, right: 20 }}
                icon={Images.plus}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
            />

            <AppScroll avoidKeyboard={false} extraBottom={150} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} scrollToTop={scrollToTop}>
                {user.nutrition?.plans?.length > 0 ?
                    <View>
                        {user.nutrition.plans.map((plan, i) => (
                            <Meal
                                key={i}
                            />
                        ))}
                    </View>
                    :
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Image source={Images.list3Outline} style={{ width: 120, height: 120, tintColor: colors.mutedText + '99' }} />
                        <AppText style={{ fontSize: scaleFont(16), color: colors.mutedText, textAlign: 'center', fontWeight: 'bold', marginTop: 20 }}>
                            You have no meal plans
                        </AppText>
                        <AppText style={{ fontSize: scaleFont(14), color: 'white', textAlign: 'center', marginTop: 5 }}>
                            Tap on plus the "+" to add new meal plan
                        </AppText>
                    </View>}
            </AppScroll >
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.cardBackground,
        padding: 15,
        borderRadius: 15,
        marginTop: 15,
        marginHorizontal: 15
    },
    sectionTitle: {
        fontSize: scaleFont(19),
        fontWeight: '700',
        color: 'white',
        marginBottom: 12,
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    feedbackBullet: {
        color: 'white',
        fontSize: scaleFont(14),
        marginRight: 6,
    },
    feedbackText: {
        color: 'white',
        fontSize: scaleFont(12),
        lineHeight: 20,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    iconWrapper: {
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 40,
        height: 40,
    },
    textWrapper: {
        flex: 1,
        marginLeft: 5,
    },
    label: {
        fontWeight: '700',
        fontSize: scaleFont(22),
    },
    subText: {
        fontSize: scaleFont(12),
        color: colors.mutedText,
        marginTop: 2,
    },
    arrow: {
        width: 20,
        height: 20,
        tintColor: 'white',
        marginLeft: 6,
        alignSelf: 'center',
    },
    divider: { width: 1, backgroundColor: "rgba(102,102,102,0.2)", alignSelf: "center", height: "60%" },
    button: {
        marginTop: 18,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'linear-gradient(90deg, rgba(0,140,255,1) 0%, rgba(0,200,255,1) 100%)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: scaleFont(14),
    }
});