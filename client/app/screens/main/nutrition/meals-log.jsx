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
import SlideInOut from '../../../components/effects/slide-in-out';

export default function MealsLog() {
    const { createInput, showSpinner, hideSpinner, createToast, createDialog } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const [scrollToTop, setScrollToTop] = useState(false);

    const [openMeals, setOpenMeals] = useState([]);
    const [fabVisible, setFabVisible] = useState(true);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [currentDayLog, setCurrentDayLog] = useState({});
    const [waterAmount, setWaterAmount] = useState(user.preferences.fluidUnit.key === 'ml' ? 250 : user.preferences.fluidUnit.key === 'floz' ? 8 : 1);
    const [pageDate, setPageDate] = useState(new Date());
    const [pageDateKey, setPageDateKey] = useState(formatDate(new Date(), { format: "YYYY-MM-DD" }));
    const [dateComparisons, setDateComparisons] = useState({});

    useEffect(() => {
        setDateComparisons(getDayComparisons(pageDate));

        const interval = setInterval(() => {
            setDateComparisons(getDayComparisons(pageDate));
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, [pageDate]);

    useEffect(() => {
        const dayLog = user.nutritionLogs[pageDateKey] || {};
        const { energyKcal, carbs, protein, fat } = totalDayConsumption(dayLog);

        dayLog.consumedEnergyKcal = energyKcal;
        dayLog.consumedCarbGrams = carbs;
        dayLog.consumedProteinGrams = protein;
        dayLog.consumedFatGrams = fat;
        setCurrentDayLog(dayLog);
    }, [user.nutritionLogs]);

    async function handleDate(val, source) {
        let newDate;
        let newPageDateKey;

        if (source === 'prev' || source === 'next') {
            newDate = new Date(pageDate);
            newDate.setDate(newDate.getDate() + val);
        } else if (source === 'picker') {
            newDate = new Date(val);
        }

        newPageDateKey = formatDate(newDate, { format: "YYYY-MM-DD" });
        const { isPast } = getDayComparisons(newDate);

        if (!user.nutritionLogs[newPageDateKey]) {
            if (!isPast) {
                await createFutureDays(newPageDateKey);
            } else {
                setCurrentDayLog({});
            }
        } else {
            setCurrentDayLog(user.nutritionLogs[newPageDateKey]);
        }

        setPageDateKey(newPageDateKey);
        setPageDate(newDate);
    }

    async function createFutureDays(date) {
        showSpinner();
        const result = await APIService.nutrition.days.futureDays(date);

        if (result.success) {
            setUser(prev => ({
                ...prev,
                nutritionLogs: {
                    ...(prev.nutritionLogs || {}),
                    ...result.data.newDays
                }
            }));
        } else {
            createToast({ message: `Server error, ${result.message}` });
            console.log('failed to create today\'s nutrition day:', result.message);
            setCurrentDayLog({});
        }
        hideSpinner();
    }

    async function handleWaterAmountChange() {
        createInput({
            title: "Water Intake",
            confirmText: "Ok",
            text: `Enter water value (${user.preferences.fluidUnit.field})`,
            placeholders: [user.preferences.fluidUnit.field],
            initialValues: [waterAmount],
            extraConfigs: [{ keyboardType: "numeric" }],
            onSubmit: async (vals) => {
                if (vals[0] === "" || isNaN(vals[0])) {
                    createToast({ message: 'Please enter a number!' });
                    return;
                }

                const waterVal = Number(vals[0]);

                if (typeof waterVal !== 'number' || waterVal < 0) {
                    createToast({ message: "Water amount cannot be below 0!" });
                    return;
                }

                setWaterAmount(waterVal);
            },
        });
    }

    async function handleWater(adjustment) {
        try {
            adjustment = Number(adjustment);

            if (user.preferences.fluidUnit.key === 'floz')
                adjustment = convertFluid(adjustment, 'floz', 'ml');
            else if (user.preferences.fluidUnit.key === 'cups')
                adjustment = convertFluid(adjustment, 'cups', 'ml');

            let consumedWaterMl = currentDayLog.consumedWaterMl + adjustment;
            if (consumedWaterMl < 0)
                consumedWaterMl = 0;

            if (currentDayLog.consumedWaterMl === 0 && consumedWaterMl === 0)
                return;

            const result = await APIService.nutrition.days.updateConsumption(pageDateKey, { consumedWaterMl });
            if (result.success) {
                setUser(prev => ({
                    ...prev,
                    nutritionLogs:
                    {
                        ...prev.nutritionLogs,
                        [pageDateKey]: {
                            ...prev.nutritionLogs[pageDateKey],
                            consumedWaterMl
                        }
                    }
                }));
            } else {
                createToast({ message: `Failed to update consumption: ${result.message}` });
            }
        } catch (err) {
            console.error("Failed to update consumption:", err.message);
        }
    }

    async function handleMealAddition() {
        createInput({
            title: "Meal Addition",
            confirmText: "Add",
            text: `Enter a label for the meal (e.g. Breakfast, Dinner, Pre-Workout...)`,
            placeholders: [`Meal ${currentDayLog?.meals?.length + 1 || 1}`],
            initialValues: [``],
            onSubmit: async (vals) => {
                let label = vals[0];
                if (!label)
                    label = `Meal ${currentDayLog?.meals?.length + 1}`;

                let time = new Date();
                let hour = time.getHours();
                let minute = time.getMinutes();
                const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                time = `${timeStr}:00`;

                showSpinner();
                try {
                    const result = await APIService.nutrition.meals.create({ nutritionLogId: currentDayLog.id, label, time });

                    if (result.success) {
                        const meal = result.data.meal;

                        setOpenMeals(prev => [...prev, meal.id]);
                        setUser(prev => ({
                            ...prev,
                            nutritionLogs: {
                                ...prev.nutritionLogs,
                                [pageDateKey]: {
                                    ...prev.nutritionLogs[pageDateKey],
                                    meals: [...(prev.nutritionLogs[pageDateKey].meals || []), { ...meal, foods: [] }]
                                }
                            }
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
            },
        });
    }

    async function handleMealRemoval(mealId, label) {
        createDialog({
            title: `Drop Meal`,
            text: `Are you sure you want to drop "${label}"?`,
            confirmText: "Drop",
            confirmButtonStyle: { backgroundColor: 'rgb(255,59,48)', borderColor: 'rgb(255,59,48)' },
            onConfirm: async () => {
                showSpinner();
                try {
                    const result = await APIService.nutrition.meals.delete({ mealId });

                    if (result.success) {
                        setUser(prev => {
                            const dayLog = prev.nutritionLogs[pageDateKey];
                            if (!dayLog) return prev;

                            return {
                                ...prev,
                                nutritionLogs: {
                                    ...prev.nutritionLogs,
                                    [pageDateKey]: {
                                        ...dayLog,
                                        meals: (dayLog.meals || []).filter(meal => meal.id !== mealId)
                                    }
                                }
                            };
                        });
                    } else {
                        createToast({ message: result.message || "Failed to drop meal" });
                    }
                } catch (err) {
                    console.error("Failed to drop meal:", err);
                    createToast({ message: "Server error" });
                } finally {
                    hideSpinner();
                }
            },
        })
    }

    async function handleMealRelabel(mealId) {
        createInput({
            title: "Relabel Meal",
            confirmText: "Submit",
            text: `Enter new label for the meal`,
            placeholders: [`${currentDayLog?.meals?.find(meal => meal.id === mealId)?.label}`],
            initialValues: [`${currentDayLog?.meals?.find(meal => meal.id === mealId)?.label}`],
            onSubmit: async (vals) => {
                let newLabel = vals[0];
                if (!newLabel || newLabel === currentDayLog?.meals?.find(meal => meal.id === mealId)?.label)
                    return;

                const time = new Date().getTime();
                showSpinner();
                try {
                    const result = await APIService.nutrition.meals.updateLabel({ mealId, newLabel });

                    if (result.success) {
                        const updatedMeal = result.data.meal;
                        const currentMeals = currentDayLog.meals || [];
                        const updatedMeals = currentMeals.map(meal => meal.id === mealId ? { ...updatedMeal } : meal);

                        setUser(prev => ({
                            ...prev,
                            nutritionLogs: {
                                ...prev.nutritionLogs,
                                [pageDateKey]: {
                                    ...prev.nutritionLogs[pageDateKey],
                                    meals: updatedMeals
                                }
                            }
                        }));
                    } else {
                        createToast({ message: result.message || "Failed to relabel meal" });
                    }
                } catch (err) {
                    console.error("Failed to relabel meal:", err);
                    createToast({ message: "Server error" });
                } finally {
                    hideSpinner();
                }
            },
        });
    }

    async function handleFoodAddition(meal) {
        const selectedMeal = JSON.stringify(meal);
        const day = JSON.stringify(currentDayLog);

        router.push({
            pathname: routes.FOOD_SELECTION,
            params: {
                selectedMeal,
                day,
                foodProfileIntent: 'meal/add'
            }
        });
    }

    async function handleMealFoodPress(meal, food) {
        router.push({
            pathname: routes.FOOD_PROFILE,
            params: {
                selectedMeal: JSON.stringify(meal),
                selectedFood: JSON.stringify(food),
                day: JSON.stringify(currentDayLog),
                foodProfileIntent: 'meal/update'
            }
        });
    }

    async function handleMealsImport() {
        router.push({
            pathname: routes.MEAL_PLANS,
            params: {
                day: JSON.stringify(currentDayLog),
                mealPlansIntent: 'import'
            }
        });
    }

    return (
        <>
            {datePickerOpen &&
                <DateTimePicker
                    value={pageDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setDatePickerOpen(Platform.OS === 'ios');

                        if (selectedDate) {
                            handleDate(selectedDate, 'picker')
                        }
                    }}
                />
            }
            <FloatingActionMenu
                overlayColor="rgba(0, 0, 0, 0.8)"
                actions={[
                    { icon: Images.list3, title: 'Import Plan', onPress: () => handleMealsImport(), closeOnAction: true, delayClosure: true },
                    { icon: Images.meals, title: 'Add Meal', onPress: () => handleMealAddition(), closeOnAction: true },
                ]}
                onPress={handleMealAddition}
                visible={fabVisible && !dateComparisons.isPast}
                position={{ bottom: insets.bottom + 50, right: 20 }}
                icon={Images.plus}
            />

            <FloatingActionButton
                onPress={() => setScrollToTop(true)}
                visible={!fabVisible}
                position={{ bottom: insets.bottom + 50, left: 20 }}
                icon={Images.arrow}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
                iconSize={20}
                size={40}
            />

            <AppScroll extraBottom={250} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} scrollToTop={scrollToTop}>
                {/* Header */}
                <View style={{ padding: 20, paddingBottom: 30, backgroundColor: colors.cardBackground, borderBottomEndRadius: 30, borderBottomStartRadius: 30, }}>
                    <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => handleDate(-1, 'prev')} style={{ justifyContent: 'center', width: '25%', alignItems: 'center' }}>
                            <Image source={Images.arrow} style={{ width: 22, height: 22, tintColor: 'white', transform: [{ scaleX: -1 }] }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setDatePickerOpen(true)} style={{ height: 30, width: '50%', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                            <AppText style={{ color: 'white', fontSize: scaleFont(14), fontWeight: 'bold' }}>
                                {dateComparisons.isToday ? 'Today' : dateComparisons.isYesterday ? 'Yesterday' : 'Tomorrow'}
                            </AppText>
                            <SlideInOut removeWhenHidden distance={3} visible={!dateComparisons.isToday && !dateComparisons.isYesterday && !dateComparisons.isTomorrow}>
                                <FadeInOut removeWhenHidden visible={!dateComparisons.isToday && !dateComparisons.isYesterday && !dateComparisons.isTomorrow}>
                                    <DateDisplay
                                        styles={{ textAlign: 'center', marginBottom: 0, marginTop: 0 }} dateStyle={{ color: 'white', fontSize: scaleFont(16) }}
                                        dayStyle={{ color: 'white' }}
                                        centered={true}
                                        uppercaseDate={false}
                                        uppercaseDay={false}
                                        date={pageDate}
                                        showDay={false}
                                        hideDateOnMount={true}
                                    />
                                </FadeInOut>
                            </SlideInOut>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDate(1, 'next')} style={{ justifyContent: 'center', width: '25%', alignItems: 'center' }}>
                            <Image source={Images.arrow} style={{ width: 22, height: 22, tintColor: 'white' }} />
                        </TouchableOpacity>
                    </View>

                    <Divider orientation="horizontal" style={{ marginVertical: 20 }} />

                    <View style={{ marginBottom: 20 }}>
                        <ProgressBar
                            title="Energy"
                            current={convertEnergy(currentDayLog?.consumedEnergyKcal ?? 0, 'kcal', user.preferences.energyUnit.key)}
                            max={convertEnergy(currentDayLog?.targetEnergyKcal ?? user.nutrition.setEnergyKcal, 'kcal', user.preferences.energyUnit.key)}
                            unit={user.preferences.energyUnit.field}
                            color={currentDayLog?.consumedEnergyKcal > currentDayLog?.targetEnergyKcal ? 'red' : nutritionColors.energy1}
                            styleType="header"
                            height={10}
                            borderRadius={5}
                            showWarningText={true}
                            warningText="(Excess Energy Consumed)"

                        />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {[
                            { label: 'Carbs', consumed: currentDayLog?.consumedCarbGrams ?? 0, target: currentDayLog?.targetCarbGrams ?? user.nutrition.carbGrams, color: nutritionColors.carbs1 },
                            { label: 'Protein', consumed: currentDayLog?.consumedProteinGrams ?? 0, target: currentDayLog?.targetProteinGrams ?? user.nutrition.proteinGrams, color: nutritionColors.protein1 },
                            { label: 'Fat', consumed: currentDayLog?.consumedFatGrams ?? 0, target: currentDayLog?.targetFatGrams ?? user.nutrition.fatGrams, color: nutritionColors.fat1 },
                        ].map((macro, i) => {
                            return (
                                <ProgressBar
                                    key={i}
                                    title={macro.label}
                                    current={macro.consumed}
                                    max={macro.target}
                                    unit={'g'}
                                    color={macro.color}
                                    styleType="inline"
                                    height={10}
                                    width={"30%"}
                                    borderRadius={5}
                                    valueStyle={{ fontSize: scaleFont(12) }}
                                />
                            );
                        })}
                    </View>
                </View>

                {/* Meals Log*/}
                <View style={{ backgroundColor: colors.background }}>
                    <View>
                        <View style={[styles.card, { padding: 0 }]} >
                            <View style={{ padding: 20 }}>
                                <ProgressBar
                                    title="Water"
                                    current={convertFluid(currentDayLog.consumedWaterMl ?? 0, 'ml', user.preferences.fluidUnit.key)}
                                    max={convertFluid(currentDayLog.targetWaterMl ?? user.nutrition.waterMl, 'ml', user.preferences.fluidUnit.key)}
                                    unit={user.preferences.fluidUnit.field}
                                    color={nutritionColors.water1}
                                    styleType="header"
                                    height={10}
                                    borderRadius={5}

                                />
                            </View>
                            {!dateComparisons.isPast && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                                    <TouchableOpacity onPress={() => handleWater(-waterAmount)} style={{ backgroundColor: colors.accentPink, borderBottomLeftRadius: 20, paddingVertical: 12, flex: 1, alignItems: 'center', }}>
                                        <Image source={Images.minus} style={{ width: 20, height: 20, tintColor: 'white' }} />
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ paddingHorizontal: 15, alignItems: 'center' }} onPress={handleWaterAmountChange}>
                                        <AppText style={{ fontSize: scaleFont(16), color: nutritionColors.water1 }}>
                                            {waterAmount} {user.preferences.fluidUnit.field}
                                        </AppText>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => handleWater(waterAmount)} style={{ backgroundColor: colors.main, borderBottomRightRadius: 20, paddingVertical: 12, flex: 1, alignItems: 'center', }}  >
                                        <Image source={Images.plus} style={{ width: 20, height: 20, tintColor: 'white' }} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {currentDayLog?.meals?.length > 0 ?
                        currentDayLog.meals.map((meal, i) => {
                            return (
                                <Meal
                                    key={meal.id}
                                    label={meal.label}
                                    foods={meal.foods}
                                    time={meal.time}
                                    num={i + 1}
                                    onRenamePress={() => handleMealRelabel(meal.id)}
                                    onDeletePress={() => handleMealRemoval(meal.id, meal.label)}
                                    onAddPress={() => handleFoodAddition(meal)}
                                    onFoodPress={(food) => handleMealFoodPress(meal, food)}
                                    onFoodPressDisabled={dateComparisons.isPast}
                                    onAddPressVisible={!dateComparisons.isPast}
                                    onDeletePressVisible={!dateComparisons.isPast}
                                    onRenamePressVisible={!dateComparisons.isPast}
                                    expandedOnStart={openMeals.includes(meal.id) || currentDayLog.meals.length === 1}
                                    onExpand={() => { setOpenMeals(prev => prev.includes(meal.id) ? prev.filter(id => id !== meal.id) : [...prev, meal.id]) }}
                                />
                            )
                        })
                        : (
                            <View style={{ justifyContent: 'center', alignItems: 'center', padding: 30, marginTop: 25 }}>
                                <Image
                                    source={Images.mealTwoOutline}
                                    style={{ width: 120, height: 120, marginBottom: 15, tintColor: colors.mutedText + '60' }}
                                />
                                <AppText style={{ fontSize: scaleFont(16), color: colors.mutedText + '80', textAlign: 'center', fontWeight: 'bold' }}>
                                    No meals were logged on this date
                                </AppText>
                                <AppText style={{ fontSize: scaleFont(14), color: 'white', textAlign: 'center', marginTop: 5 }}>
                                    Tap on plus the "+" to add new meals
                                </AppText>
                            </View>
                        )}
                </View>
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
        padding: 20,
        borderRadius: 20,
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