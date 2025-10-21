import { StyleSheet, TouchableOpacity, View, } from "react-native";
import { useEffect, useContext, useState } from "react";
import { router } from "expo-router";
import { routes, } from "../../common/settings/constants";
import { colors, nutritionColors } from "../../common/settings/styling";
import AppText from "../../components/screen-comps/app-text";
import { scaleFont } from "../../common/utils/scale-fonts";
import { UserContext } from "../../common/contexts/user-context";
import { Image } from "expo-image";
import { Images } from "../../common/settings/assets";
import { convertEnergy, convertFluid, convertWeight } from "../../common/utils/unit-converter";
import { formatDate, getDayComparisons } from "../../common/utils/date-time";
import usePopups from "../../common/hooks/use-popups";
import { totalDayConsumption } from "../../common/utils/metrics-calculator";
import APIService from "../../common/services/api-service";
import FloatingActionMenu from "../../components/screen-comps/floating-action-menu";
import ProgressBar from "../../components/screen-comps/progress-bar";
import DateDisplay from "../../components/screen-comps/date-display";
import AppScroll from "../../components/screen-comps/app-scroll";
import Divider from "../../components/screen-comps/divider";
import FloatingActionButton from "../../components/screen-comps/floating-action-button";
import AnimatedButton from "../../components/screen-comps/animated-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExpandInOut from "../../components/effects/expand-in-out";
import Exercise from "../../components/screen-comps/exercise";

export default function TrainingHub() {
    const { showSpinner, hideSpinner, createInput, createDialog, createAlert, createToast } = usePopups();
    const { user, setUser, additionalContexts } = useContext(UserContext);
    const insets = useSafeAreaInsets();

    const [expandedExercises, setExpandedExercises] = useState([]);
    const [fabVisible, setFabVisible] = useState(true);
    const [date, setDate] = useState(new Date());
    const [exercises, setExercises] = useState([]);
    const [dateExercises, setDateExercises] = useState([]);

    useEffect(() => {
        async function fetchExercises() {
            const result = await APIService.training.exercises();

            if (result.success) {
                const exercises = result.data.exercises;
                setExercises(exercises);

                const filtered = exercises.filter(exercise => formatDate(exercise.date, { format: 'YYYY-MM-DD' }) === formatDate(date, { format: 'YYYY-MM-DD' })).sort((a, b) => a.id - b.id);
                setDateExercises(filtered);
            }
        }

        fetchExercises();
    }, []);

    useEffect(() => {
        const filtered = exercises.filter(exercise => formatDate(exercise.date, { format: 'YYYY-MM-DD' }) === formatDate(date, { format: 'YYYY-MM-DD' })).sort((a, b) => a.id - b.id);
        setDateExercises(filtered);
        setExpandedExercises([filtered[0]?.id || null]);
    }, [date]);

    useEffect(() => {
        const exercise = additionalContexts.newExercise;
        if (exercise) {
            setExercises([...exercises, exercise]);
            setDateExercises([...dateExercises, exercise]);
        }
    }, [additionalContexts.newExercise]);

    async function handleDate(val) {
        if (val === -1) {
            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() - 1);
            setDate(newDate);
        } else if (val === 1) {
            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() + 1);
            setDate(newDate);
        }
    }

    async function handleAddExercise() {
        router.push({
            pathname: routes.EXERCISES,
            params: {
                date: encodeURIComponent(date)
            }
        })
    }
    
    async function handleDeleteExercise(exerciseId) {
        createDialog({
            title: "Delete Exercise",
            confirmText: "Delete",
            text: `Are you sure you want to delete this exercise?`,
            confirmButtonStyle: { backgroundColor: colors.negativeRed, borderColor: colors.negativeRed },
            onConfirm: async () => {
                try {
                    showSpinner();

                    const result = await APIService.training.delete({ exerciseId });
                    if (result.success) {
                        setExercises(prev => prev.filter(e => e.id !== exerciseId));
                        setDateExercises(prev => prev.filter(e => e.id !== exerciseId));
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    async function handleAddSet(exercise) {
        createInput({
            title: "New Set",
            confirmText: "Add",
            text: `Enter repetitions and weight in ${user.preferences.weightUnit.label}`,
            placeholders: [`Repetitions`, `Weight (${user.preferences.weightUnit.field})`],
            initialValues: [``, ``],
            extraConfigs: [{ keyboardType: "numeric" }, { keyboardType: "numeric" }],
            onSubmit: async (vals) => {
                try {
                    showSpinner();
                    const [reps, weight] = vals;

                    if (!reps || !weight)
                        return createToast({ message: "Both fields must be filled" });

                    const id = Math.floor(100000 + Math.random() * 900000);
                    const payload = {
                        exerciseId: exercise.id,
                        sets: [...exercise.sets, { id, reps: Number(reps), weight: Number(weight) }]
                    }

                    const result = await APIService.training.updateSets(payload);

                    if (result.success) {
                        const exercise = result.data.exercise;

                        setExercises(prev => prev.map(e => e.id === exercise.id ? exercise : e));
                        setDateExercises(prev => prev.map(e => e.id === exercise.id ? exercise : e));
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    async function handleEditSet(exercise, set) {
        createInput({
            title: "Edit Set",
            confirmText: "Confirm Edit",
            text: `Enter new repetitions and weight in ${user.preferences.weightUnit.label}`,
            placeholders: [`Repetitions`, `Weight (${user.preferences.weightUnit.field})`],
            initialValues: [set.reps, set.weight],
            extraConfigs: [{ keyboardType: "numeric" }, { keyboardType: "numeric" }],
            onSubmit: async (vals) => {
                try {
                    showSpinner();
                    const [reps, weight] = vals;

                    if (!reps || !weight)
                        return createToast({ message: "Both fields must be filled" });

                    const payload = {
                        exerciseId: exercise.id,
                        sets: exercise.sets.map(s => s.id === set.id ? { ...s, reps: Number(reps), weight: Number(weight) } : s)
                    }

                    const result = await APIService.training.updateSets(payload);

                    if (result.success) {
                        const exercise = result.data.exercise;

                        setExercises(prev => prev.map(e => e.id === exercise.id ? exercise : e));
                        setDateExercises(prev => prev.map(e => e.id === exercise.id ? exercise : e));
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    async function handleDeleteSet(exercise, set) {
        createDialog({
            title: "Drop Set",
            confirmText: "Drop",
            text: `Remove this set?`,
            confirmButtonStyle: { backgroundColor: colors.negativeRed, borderColor: colors.negativeRed },
            onConfirm: async () => {
                try {
                    showSpinner();

                    const payload = {
                        exerciseId: exercise.id,
                        sets: exercise.sets.filter(s => s.id !== set.id)
                    }

                    const result = await APIService.training.updateSets(payload);
                    if (result.success) {
                        const exercise = result.data.exercise;

                        setExercises(prev => prev.map(e => e.id === exercise.id ? exercise : e));
                        setDateExercises(prev => prev.map(e => e.id === exercise.id ? exercise : e));
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    const exercisesTotal = dateExercises.length;
    const energyTotal = 0

    return (
        <>
            <FloatingActionButton
                onPress={handleAddExercise}
                visible={fabVisible}
                position={{ bottom: insets.bottom + 80, right: 20 }}
                icon={Images.plus}
                iconStyle={{ marginTop: 2 }}
                iconSize={20}
                size={60}
            />

            <AppScroll extraBottom={150} hideNavBarOnScroll={true} onScrollSetStates={setFabVisible} >
                <View style={{ paddingBottom: 20, paddingHorizontal: 20, borderBottomEndRadius: 30, borderBottomStartRadius: 30, backgroundColor: colors.cardBackground }}>
                    <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', marginVertical: 10 }}>
                        <TouchableOpacity onPress={() => handleDate(-1)} style={{ justifyContent: 'center', width: '25%', alignItems: 'center' }}>
                            <Image source={Images.arrow} style={{ width: 22, height: 22, tintColor: 'white', transform: [{ scaleX: -1 }] }} />
                        </TouchableOpacity>
                        <View style={{ justifyContent: 'center' }}>
                            <AppText style={{ fontSize: scaleFont(18), color: colors.white, fontWeight: 'bold', margin: 15 }}>
                                {
                                    getDayComparisons(date).isToday ? 'Today' :
                                        getDayComparisons(date).isTomorrow ? 'Tomorrow' :
                                            getDayComparisons(date).isYesterday ? 'Yesterday' :
                                                formatDate(date, { format: 'MMM d' })
                                }
                            </AppText>
                        </View>
                        <TouchableOpacity onPress={() => handleDate(+1)} style={{ justifyContent: 'center', width: '25%', alignItems: 'center', transform: [{ rotate: '180deg' }] }}>
                            <Image source={Images.arrow} style={{ width: 22, height: 22, tintColor: 'white', transform: [{ scaleX: -1 }] }} />
                        </TouchableOpacity>
                    </View>

                    <Divider orientation="horizontal" />

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 25 }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '45%' }}>
                            <AppText style={{ color: nutritionColors.carbs1, fontWeight: 'bold', fontSize: scaleFont(20), textAlign: 'center' }}>{exercisesTotal}</AppText>
                            <AppText style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(15), textAlign: 'center' }}>Exercises</AppText>
                        </View>
                        <View style={{ width: '10%', alignItems: 'center', justifyContent: 'center', height: 50 }}>
                            <Divider />
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '45%' }}>
                            <AppText style={{ color: nutritionColors.energy1, fontWeight: 'bold', fontSize: scaleFont(20), textAlign: 'center' }}>{convertEnergy(energyTotal, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}</AppText>
                            <AppText style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(15), textAlign: 'center' }}>Energy Burned</AppText>
                        </View>
                    </View>
                </View>

                {dateExercises.length > 0 ?
                    (
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <AppText style={{ fontSize: scaleFont(15), color: colors.white, fontWeight: 'bold', marginTop: 35, marginHorizontal: 25 }}>
                                    Training Summary
                                </AppText>
                            </View>

                            {dateExercises.map((exercise, i) =>
                                <Exercise
                                    key={i}
                                    user={user}
                                    sets={exercise.sets}
                                    exercise={exercise.exercise}
                                    onDeletePress={() => handleDeleteExercise(exercise.id)}
                                    onAddPress={() => handleAddSet(exercise)}
                                    onSetEditPress={(set) => handleEditSet(exercise, set)}
                                    onSetDeletePress={(set) => handleDeleteSet(exercise, set)}
                                    onExpand={() => setExpandedExercises(prev => prev.includes(exercise.id) ? prev.filter(e => e !== exercise.id) : [...prev, exercise.id])}
                                    expanded={expandedExercises.includes(exercise.id)}
                                />
                            )}
                        </>
                    ) :
                    (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={Images.icon6} style={{ width: 100, height: 100, alignSelf: 'center', marginTop: 50, tintColor: colors.mutedText }} />
                            <AppText style={{ fontSize: scaleFont(16), color: colors.mutedText, fontWeight: 'bold', textAlign: 'center', marginTop: 15 }}>No Exercises</AppText>
                            <AppText style={{ fontSize: scaleFont(14), color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Tap the + button to add an exercise</AppText>
                        </View>
                    )
                }
            </AppScroll>
        </>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.cardBackground,
        padding: 20,
        borderRadius: 20,
        marginTop: 15,
        marginHorizontal: 15,
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
    },
    divider: { width: 1, backgroundColor: "rgba(102,102,102,0.2)", alignSelf: "center", height: "60%" },
    button: {
        marginTop: 18,
        height: 50,
        borderRadius: 20,
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