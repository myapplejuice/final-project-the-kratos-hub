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
import { formatDate, formatSqlTime, formatTime, isValidTime } from '../../../common/utils/date-time';
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

    useEffect(() => {
        setPlan(prev => user.plans.find(p => p.id === prev.id));
    }, [user.plans])

    async function handleMealAddition() {
        createInput({
            title: "Meal Addition",
            confirmText: "Add",
            text: `OPTIONAL:\nEnter a label for the meal & timing of meal in 24-hour format (e.g. 18:00)`,
            placeholders: [`Label`, [`HH`, `MM`]],
            initialValues: [``, [``, ``]],
            extraConfigs: [[], [{ keyboardType: "numeric" }, { keyboardType: "numeric" }]],
            onSubmit: async (vals) => {
                let label = vals[0];
                let hour = Number(vals[1][0]);
                let minute = Number(vals[1][1]);

                if (!label) label = `Meal ${plan.meals.length + 1}`;

                let time = null;

                if (vals[1][0] || vals[1][1]) {
                    if (!vals[1][0]) hour = 0;
                    if (!vals[1][1]) minute = 0;

                    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

                    if (!isValidTime(timeStr)) {
                        return createToast({ message: `${timeStr} is an invalid time, please try again` });
                    }

                    time = `${timeStr}:00`;
                }

                if (!time) {
                    return createDialog({
                        title: 'Warning',
                        text: `Time was not provided, are you sure you want to continue?`,
                        onConfirm: async () => await confirmMealAddition(label, time),
                    });
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

    async function handleMealUpdate(meal) {
        const formatedTime = formatSqlTime(meal.time);
        const HH = formatedTime.split('T')[1].split(':')[0];
        const MM = formatedTime.split('T')[1].split(':')[1];

        createInput({
            title: "Meal Addition",
            confirmText: "Add",
            text: `Enter new label for the meal & timing`,
            placeholders: [`Label`, [`HH`, `MM`]],
            initialValues: [`${meal.label}`, [`${HH || ''}`, `${MM || ''}`]],
            extraConfigs: [[], [{ keyboardType: "numeric" }, { keyboardType: "numeric" }]],
            onSubmit: async (vals) => {
                let label = vals[0];
                let hour = Number(vals[1][0]);
                let minute = Number(vals[1][1]);
                let time;

                if (!hour && !minute && !label)
                    return createToast({ message: "No changes made" });

                if (!label)
                    label = meal.label;

                if (!vals[1][0] && !vals[1][1]) {
                    time = meal.time;
                } else {
                    if (vals[1][0] || vals[1][1]) {
                        if (!vals[1][0]) hour = 0;
                        if (!vals[1][1]) minute = 0;

                        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

                        if (!isValidTime(timeStr)) {
                            return createToast({ message: `${timeStr} is an invalid time, please try again` });
                        }

                        time = `${timeStr}:00`;
                    }
                }

                await confirmMealUpdate(meal.id, label, time);
            },
        });
    }

    async function confirmMealUpdate(mealId, label, time) {
        try {
            showSpinner();

            const payload = {
                mealId,
                newLabel: label,
                newTime: time,
            };

            const result = await APIService.nutrition.mealPlans.meals.update(payload);

            if (result.success) {
                const meal = result.data.meal;

                setUser(prev => ({
                    ...prev,
                    plans: prev.plans.map(p =>
                        p.id === plan.id
                            ? {
                                ...p,
                                meals: p.meals.map(m =>
                                    m.id === meal.id
                                        ? { ...m, ...meal }
                                        : m
                                )
                            }
                            : p
                    )
                }))

                createToast({ message: "Meal updated" });
            } else {
                createToast({ message: result.message || "Failed to update meal" });

            }
        } catch (err) {
            console.error("Failed to update meal:", err);
            createToast({ message: "Server error " + err });
        } finally {
            hideSpinner();
        }
    }


    async function handleMealDeletion(mealId, meal) {
        createDialog({
            title: "Discard Meal",
            text: `Are you sure you want to discard "${meal.label}"?`,
            confirmText: "Discard",
            confirmButtonStyle: { backgroundColor: 'rgb(255,59,48)', borderColor: 'rgb(255,59,48)' },
            onConfirm: async () => {
                try {
                    showSpinner();

                    const result = await APIService.nutrition.mealPlans.meals.delete({ mealId });

                    if (result.success) {
                        setUser(prev => ({
                            ...prev,
                            plans: prev.plans.map(p =>
                                p.id === plan.id
                                    ? {
                                        ...p,
                                        meals: p.meals.filter(m => m.id !== mealId)
                                    }
                                    : p
                            )
                        }))
                    } else {
                        createToast({ message: result.message || "Failed to delete meal" });
                    }
                } catch (err) {
                    console.error("Failed to delete meal:", err);
                    createToast({ message: "Server error " + err });
                } finally {
                    hideSpinner();
                }
            },
        })
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
                            onRenamePress={() => handleMealUpdate(meal)}
                            onDeletePress={() => handleMealDeletion(meal.id, meal)}
                            expandedOnStart={openMeals.includes(meal.id)}
                            isTimeByDate={false}
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