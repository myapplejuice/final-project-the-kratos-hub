import { Image } from "expo-image";
import { useCallback, useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppScroll from "../../../components/screen-comps/app-scroll";
import AppText from "../../../components/screen-comps/app-text";
import FloatingActionButton from "../../../components/screen-comps/floating-action-button";
import { Images } from "../../../common/settings/assets";
import { UserContext } from '../../../common/contexts/user-context';
import usePopups from "../../../common/hooks/use-popups";
import { scaleFont } from "../../../common/utils/scale-fonts";
import APIService from "../../../common/services/api-service";
import { colors, } from "../../../common/settings/styling";
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { routes } from '../../../common/settings/constants';
import Workout from "../../../components/screen-comps/workout";

export default function Workouts() {
    const date = decodeURIComponent(useLocalSearchParams().date);
    const context = useLocalSearchParams().workoutsContext;
    const insets = useSafeAreaInsets();

    const { createInput, showSpinner, hideSpinner, createToast, createDialog, createAlert, createOptions } = usePopups();
    const { user, setUser, additionalContexts, setAdditionalContexts } = useContext(UserContext);
    const [scrollToTop, setScrollToTop] = useState(false);
    const [fabVisible, setFabVisible] = useState(true);

    const [loading, setLoading] = useState(true);
    const [expandedWorkout, setExpandedWorkout] = useState(null);
    const [workouts, setWorkouts] = useState([]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            async function fetchWorkout() {
                try {
                    setLoading(true);

                    const result = await APIService.training.workouts.workouts();
                    if (isActive && result.success) {
                        const workouts = result.data.workouts;
                        
                        setWorkouts(workouts);
                        setExpandedWorkout(workouts.length > 0 ? workouts[0].id : null);
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    setLoading(false);
                }
            }

            fetchWorkout();

            return () => {
                isActive = false; // cleanup to avoid setting state on unmounted screen
            };
        }, [])
    );

    async function handleWorkoutAddition() {
        createInput({
            title: "New Workout",
            confirmText: "Add",
            text: "Enter a label, description, duration in minutes",
            placeholders: ["Label", "Description", "Duration"],
            initialValues: ["", "", ""],
            extraConfigs: [{ keyboardType: "default" }, { keyboardType: "default" }, { keyboardType: "numeric" }],
            onSubmit: (vals) => {
                const label = vals[0] ? vals[0] : `Workout ${workouts.length + 1}`;
                const description = vals[1] ? vals[1] : `No description provided`;
                const duration = vals[2] ? Number(vals[2]) : 'N/A';

                createOptions({
                    title: "Choose intensity",
                    options: ["Low", "Moderate", "High", "Intense"],
                    onConfirm: async (selectedOption) => {
                        try {
                            showSpinner();
                            const intensity = selectedOption ? selectedOption : "Not specified";

                            const payload = {
                                userId: user.id,
                                date: new Date(),
                                label,
                                description,
                                duration,
                                intensity
                            }

                            const result = await APIService.training.workouts.create(payload);
                            if (result.success) {
                                const workout = result.data.workout;
                                console.log(workout)
                                setExpandedWorkout(workout.id);
                                setWorkouts(prev => [workout, ...prev]);
                            }
                        } catch (e) {
                            createToast({ message: e.message });
                        } finally {
                            hideSpinner();
                        }
                    }
                });
            }
        });
    }

    async function handleWorkoutUpdate(workout) {
        createInput({
            title: "New Workout",
            confirmText: "Add",
            text: "Enter new label, description, duration in minutes",
            placeholders: ["Label", "Description", "Duration"],
            initialValues: [workout.label, workout.description, workout.duration],
            extraConfigs: [{ keyboardType: "default" }, { keyboardType: "default" }, { keyboardType: "numeric" }],
            onSubmit: (vals) => {
                const label = vals[0] ? vals[0] : workout.label;
                const description = vals[1] ? vals[1] : workout.description;
                const duration = vals[2] ? Number(vals[2]) : null;

                createOptions({
                    title: "Choose intensity",
                    options: ["Low", "Moderate", "High", "Intense"],
                    current: workout.intensity,
                    onConfirm: async (selectedOption) => {
                        try {
                            showSpinner();
                            const intensity = selectedOption ? selectedOption : "Not specified";

                            const payload = {
                                id: workout.id,
                                label,
                                description,
                                duration,
                                intensity
                            }

                            const result = await APIService.training.workouts.update(payload);
                            if (result.success) {
                                const workout = result.data.workout;
                                setWorkouts(prev => prev.map(prevWorkout => prevWorkout.id === workout.id ? workout : prevWorkout));
                            }
                        } catch (e) {
                            createToast({ message: e.message });
                        } finally {
                            hideSpinner();
                        }
                    }
                });
            }
        });
    }

    async function handleWorkoutDeletion(workoutId) {
        createDialog({
            title: "Drop Workout",
            confirmText: "Drop",
            confirmButtonStyle: { backgroundColor: colors.negativeRed, borderColor: colors.negativeRed },
            text: `Remove this workout?`,
            onConfirm: async () => {
                try {
                    showSpinner();
                    const result = await APIService.training.workouts.delete({ workoutId });
                    if (result.success) {
                        setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
                    }
                } catch (e) {
                    createToast({ message: e.message });
                } finally {
                    hideSpinner();
                }
            }
        })
    }

    async function handleWorkoutPress(workout) {
        router.push({
            pathname: routes.WORKOUT_EDITOR,
            params: {
                workout: JSON.stringify(workout)
            }
        })
    }

    async function handleWorkoutImport(workout) {
        const exercises = workout.exercises.map(exercise => ({ exercise: exercise.exercise, sets: exercise.sets }));

        const payload = {
            userId: user.id,
            date: new Date(date),
            exercises
        }

        try {
            showSpinner();

            const result = await APIService.training.exercises.createBulk(payload);
            if (result.success) {
                const newExercises = result.data.exercises;

                setAdditionalContexts(prev => ({ ...prev, newExercises }));
                createToast({ message: "Workout imported" });
                router.back();
            } else {
                createToast({ message: result.message });
            }
        } catch (e) {
            createToast({ message: e.message });
        } finally {
            hideSpinner();
        }
    }

    if (loading) {
        return <View style={{ backgroundColor: colors.background, flex: 1, paddingTop: 75 }}>
            {[...Array(2)].map((_, idx) => (
                <View key={idx} style={{ margin: 15 }}>
                    <View style={{ backgroundColor: colors.cardBackground, height: 300, width: '100%', marginTop: 15, borderRadius: 10 }} >
                        <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 15 }}>
                            <View style={{ width: 90, height: 10, borderRadius: 20, backgroundColor: colors.backgroundSecond, marginStart: 15, marginVertical: 5 }} />
                            <View style={{ width: 60, height: 7, borderRadius: 20, backgroundColor: colors.backgroundSecond, marginStart: 15, marginVertical: 5 }} />
                        </View>
                    </View>
                </View>
            ))}
        </View>;
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
                onPress={handleWorkoutAddition}
                visible={fabVisible}
                position={{ bottom: insets.bottom + 50, right: 20, left: 20 }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                label="Create New Workout"
                icon={Images.plus}
                iconSize={20}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
            />

            {workouts.length > 0 ?
                (
                    <AppScroll avoidKeyboard={false} extraBottom={250} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} scrollToTop={scrollToTop}>
                        <View style={{ margin: 15 }}>
                            {workouts.map((workout, index) => (
                                <Workout
                                    key={workout.id}
                                    addButtonVisible={context === 'add'}
                                    workout={workout}
                                    expanded={expandedWorkout === workout.id}
                                    onExpandPress={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                                    onEditPress={() => handleWorkoutUpdate(workout)}
                                    onDeletePress={() => handleWorkoutDeletion(workout.id)}
                                    onWorkoutPress={() => handleWorkoutPress(workout)}
                                    onAddPress={() => handleWorkoutImport(workout)}
                                />
                            ))}
                        </View>
                    </AppScroll >
                )
                : (
                    <View style={{ backgroundColor: colors.background, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={Images.plan3} style={{ width: 100, height: 100, tintColor: colors.mutedText }} />
                        <AppText style={{ fontSize: scaleFont(16), color: colors.mutedText, fontWeight: 'bold', textAlign: 'center', marginTop: 15 }}>No Workouts</AppText>
                        <AppText style={{ fontSize: scaleFont(14), color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Tap below start adding workout plans</AppText>
                    </View>
                )
            }
        </>
    );
}