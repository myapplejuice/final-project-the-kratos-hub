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
import ProgressBar from "../../../components/screen-comps/progress-bar";
import { Images } from "../../../common/settings/assets";
import { UserContext } from '../../../common/contexts/user-context';
import { convertEnergy, convertFluid } from "../../../common/utils/unit-converter";
import { formatDate, isValidTime } from '../../../common/utils/date-time';
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
import Meal from '../../../components/screen-comps/meal';

export default function MealPlansEditor() {
    const { createInput, showSpinner, hideSpinner, createToast, createDialog } = usePopups();
    const { user, setUser, additionalContexts, setAdditionalContexts } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const [scrollToTop, setScrollToTop] = useState(false);
    const [fabVisible, setFabVisible] = useState(true);
    const [plan, setPlan] = useState(additionalContexts.selectedPlan);
    const [openMeals, setOpenMeals] = useState([]);

    useEffect(()=>{
      setPlan(prev => user.plans.find(p => p.id === prev.id));
      console.log(user.plans[0].meals)
    },[user.plans])

    async function handleMealAddition() {
        createInput({
            title: "Meal Addition",
            confirmText: "Add",
            text: `OPTIONAL:\nEnter a label for the meal && timing of meal in 24-hour format (e.g. 18:00)`,
            placeholders: [`Meal ${plan?.meals?.length + 1 || 1}`, [`HH`, `MM`]],
            initialValues: [``, [``, ``]],
            extraConfigs: [[], [{ keyboardType: "numeric" }, { keyboardType: "numeric" }]],
            onSubmit: async (vals) => {
                let label = vals[0];
                let time = vals[1][0] + ':' + vals[1][1];

                if (!label)
                    label = `Meal ${plan.meals.length + 1}`;

                if (!vals[1][0] && !vals[1][1])
                    time = 'Timing not provided';
                else if (!vals[1][0])
                    time = `00:${vals[1][1]}`;
                else if (!vals[1][1])
                    time = `${vals[1][0]}:00`;

                if (time !== 'Timing not provided') {
                    if (!isValidTime(time)) {
                        createDialog({
                            title: 'Invalid Time',
                            text: `${time} is an invalid time, are you sure you want to continue?`,
                            onConfirm: async () => await handleMealAddition(label, time),
                        });
                    }
                }

                await confirmMealAddition(label, time);
            },
        });
    }

    async function confirmMealAddition(label, time) {
        try {
            showSpinner();

            const payload = {
                planId: plan.id,
                label,
                time,
            };

            const result = await APIService.nutrition.mealPlans.meals.add(payload);

            if (result.success) {
                const meal = result.data.meal;

                setOpenMeals(prev => [...prev, meal.id]);
                setUser(prev => ({
                    ...prev,
                    plans: prev.plans.map(p =>
                        p.id === plan.id
                            ? {
                                ...p,
                                meals: [...(p.meals || []), { ...meal }]
                            }
                            : p
                    )
                }));

            } else {
                createToast({ message: result.message || "Failed to add meal" });
            }
        } catch (err) {
            console.error("Failed to add meal:", err);
            createToast({ message: "Server error" });
        } finally {
            hideSpinner();
        }
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
                onPress={handleMealAddition}
                visible={fabVisible}
                position={{ bottom: insets.bottom + 50, right: 20 }}
                icon={Images.plus}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
            />

            <AppScroll avoidKeyboard={false} extraBottom={150} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} scrollToTop={scrollToTop}>
                {plan?.meals?.length > 0 ? (
                    plan.meals.map((meal, index) => (
                        <Meal
                            label={meal.label}
                            time={meal.time}
                            foods={meal.foods}
                            expandedOnStart={openMeals.includes(meal.id)}
                            key={index}
                        />
                    ))
                ) : (
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Image source={Images.mealPlan} style={{ width: 120, height: 120, tintColor: colors.mutedText + '99' }} />
                        <AppText style={{ fontSize: scaleFont(16), color: colors.mutedText, textAlign: 'center', fontWeight: 'bold', marginTop: 20 }}>
                            This plan is empty of any meals
                        </AppText>
                        <AppText style={{ fontSize: scaleFont(14), color: 'white', textAlign: 'center', marginTop: 5 }}>
                            Tap on plus the "+" to add a new meal
                        </AppText>
                    </View>
                )}
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