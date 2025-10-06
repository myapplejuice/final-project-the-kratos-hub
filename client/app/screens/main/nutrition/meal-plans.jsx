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
import MealPlan from '../../../components/screen-comps/meal-plan';

export default function MealsPlans() {
    const { createInput, showSpinner, hideSpinner, createToast, createDialog } = usePopups();
    const { user, setUser, additionalContexts, setAdditionalContexts } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const [scrollToTop, setScrollToTop] = useState(false);
    const [fabVisible, setFabVisible] = useState(true);

    async function handlePlanAddition() {
        createInput({
            title: "Meal Addition",
            confirmText: "Add",
            text: `Enter a label & description for the plan`,
            placeholders: [`Meal Plan ${user.plans?.length + 1 || 1}`, `Write any explanation, notes, tips about your meal plan...`],
            initialValues: [``, ``],
            largeTextIndices: [1],
            onSubmit: async (vals) => {
                let label = vals[0];
                let description = vals[1];
                if (!label)
                    label = `Meal Plan ${user.plans?.length + 1 || 1}`;

                if (!description)
                    description = `No description provided`;

                showSpinner({ abandonable: true, text: "Adding meal plan...", abandonableText: 'Press "Hide" to continue using the app while you wait' });

                const payload = {
                    label,
                    description,
                    dateOfCreation: new Date(),
                    isCreatedByCoach: false,
                    coachId: null,
                }
                try {
                    const result = await APIService.nutrition.mealPlans.create(payload);
                    const newPlan = result.data.plan;

                    if (result.success) {
                        setUser(prev => ({
                            ...prev,
                            plans: [...prev.plans, newPlan]
                        }))
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

    async function handlePlanDeletion(plan) {
        const planId = plan.id
        createDialog({
            title: "Discard Meal Plan",
            confirmButtonStyle: { backgroundColor: 'rgb(255,59,48)', borderColor: 'rgb(255,59,48)' },
            confirmText: "Discard",
            text: `Are you sure you want to discard "${plan.label}"?`,
            onConfirm: async () => {
                showSpinner({ abandonable: true, text: "Deleting meal plan...", abandonableText: 'Press "Hide" to continue using the app while you wait' });
                try {
                    const result = await APIService.nutrition.mealPlans.delete({ planId });
                    if (result.success) {
                        setUser(prev => ({
                            ...prev,
                            plans: prev.plans.filter(plan => plan.id !== planId)
                        }))
                    }
                } catch (err) {
                    console.error("Failed to delete meal plan:", err);
                    createToast({ message: "Server error " + err });
                } finally {
                    hideSpinner();
                }
            }
        })
    }

    async function handlePlanUpdate(plan) {
        const planId = plan.id
        createInput({
            title: "Meal Plan Update",
            confirmText: "Update",
            text: `Enter a new label or description for the plan`,
            placeholders: [`${plan.label}`, `Write any explanation, notes, tips about your meal plan...`],
            initialValues: [`${plan.label}`, `${plan.description === 'No description provided' ? '' : plan.description}`],
            largeTextIndices: [1],
            onSubmit: async (vals) => {
                try {
                    showSpinner({ abandonable: true, text: "Updating meal plan...", abandonableText: 'Press "Hide" to continue using the app while you wait' });

                    let newLabel = vals[0];
                    let newDescription = vals[1];
                    if ((newLabel === plan.label && newDescription === plan.description) || (!newLabel && !newDescription)) {
                        return createToast({ message: "No changes detected" });
                    }

                    if (!newLabel) {
                        return createToast({ message: "Label cannot be empty" });
                    }

                    if (!newDescription) {
                        newDescription = `No description provided`;
                    }

                    const payload = {
                        planId,
                        newLabel,
                        newDescription
                    }

                    const result = await APIService.nutrition.mealPlans.update(payload);
                    if (result.success) {
                        setUser(prev => ({
                            ...prev,
                            plans: prev.plans.map(plan => plan.id === planId ? { ...plan, label: newLabel, description: newDescription } : plan)
                        }))
                    }
                } catch (err) {
                    console.error("Failed to update meal plan:", err);
                    createToast({ message: "Server error " + err });
                } finally {
                    hideSpinner();
                }
            },
        })
    }

    async function handlePlanImport(plan) {
        if (!plan.meals || plan.meals.length === 0) {
            return createToast({ message: "No meals to import in this plan, click \"View Full Plan\" to start adding meals" });
        }

        const meals = plan.meals;
        const day = additionalContexts.day;
        console.log(day)

        try {
            showSpinner();
            const result = await APIService.nutrition.meals.createMultiple({ nutritionLogId: day.id, meals });

            if (result.success) {
                setUser(prev => ({
                    ...prev,
                    nutritionLogs: {
                        ...prev.nutritionLogs,
                        [day]: {
                            ...prev.nutritionLogs[day],
                            meals: [
                                ...prev.nutritionLogs[day].meals,
                                ...result.data.meals
                            ]
                        }
                    }
                }))
            } else {
                createToast({ message: result.message });
            }
        } catch (err) {
            console.error("Failed to import meal plan:", err);
            createToast({ message: "Server error " + err });
        } finally {
            hideSpinner();
        }
    }

    async function handlePlanPress(plan) {
        setAdditionalContexts(prev => ({ ...prev, selectedPlan: plan }));
        router.push(routes.MEAL_PLANS_EDITOR);
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

            <AppScroll avoidKeyboard={false} extraBottom={250} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} scrollToTop={scrollToTop}>
                {user.plans?.length > 0 ?
                    <View>
                        {user.plans.map((plan, i) => (
                            <MealPlan
                                key={plan.id}
                                date={plan.dateOfCreation}
                                label={plan.label}
                                description={plan.description}
                                planId={plan.id}
                                meals={plan.meals}
                                isCreatedByCoach={plan.isCreatedByCoach}
                                coachId={plan.coachId}
                                expandedOnStart={i === 0}
                                intent={additionalContexts.mealPlansIntent}
                                onImportPlanPress={() => handlePlanImport(plan)}
                                onDeletePress={() => handlePlanDeletion(plan)}
                                onUpdatePress={() => handlePlanUpdate(plan)}
                                onPlanPress={() => handlePlanPress(plan)}
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