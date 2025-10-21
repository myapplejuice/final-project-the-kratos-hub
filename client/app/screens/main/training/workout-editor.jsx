import { Image } from "expo-image";
import { useContext, useEffect, useState } from "react";
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
import { router, useLocalSearchParams } from 'expo-router';
import { routes } from '../../../common/settings/constants';
import Workout from "../../../components/screen-comps/workout";
import Exercise from "../../../components/screen-comps/exercise";

export default function WorkoutEditor() {
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const { createInput, showSpinner, hideSpinner, createToast, createDialog, createAlert, createOptions } = usePopups();
    const { user, setUser, additionalContexts, setAdditionalContexts } = useContext(UserContext);
    const [scrollToTop, setScrollToTop] = useState(false);
    const [fabVisible, setFabVisible] = useState(true);

    const [expandedExercise, setExpandedExercise] = useState(null);
    const [workout, setWorkout] = useState(JSON.parse(params.workout));

    useEffect(() => {
        if (additionalContexts.newWorkoutExercise) {
            const newExercise = additionalContexts.newWorkoutExercise;
            setAdditionalContexts(prev => ({ ...prev, newWorkoutExercise: null }));
            setWorkout(prev => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
            setExpandedExercise(newExercise.id);
        }
    }, [additionalContexts.newWorkoutExercise])

    function handleAddExercise() {
        setAdditionalContexts(prev => ({ ...prev, workout, context: 'add/workout' }));
        router.push(routes.EXERCISES)
    }

    async function handleDeleteExercise(exerciseId) {
        createDialog({
            title: "Drop Exercise",
            confirmText: "Drop",
            text: `Are you sure you want to remove this exercise?`,
            confirmButtonStyle: { backgroundColor: colors.negativeRed, borderColor: colors.negativeRed },
            onConfirm: async () => {
                try {
                    showSpinner();

                    const result = await APIService.training.workouts.exercises.delete({ exerciseId });
                    if (result.success) {
                        setWorkout(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== exerciseId) }));
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    hideSpinner();
                }
            }
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
                onPress={() => handleAddExercise()}
                visible={fabVisible}
                position={{ bottom: insets.bottom + 50, right: 20, left: 20 }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                label="Add Exercise"
                icon={Images.plus}
                iconSize={20}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
            />

            {workout.exercises.length > 0 ?
                (
                    <AppScroll avoidKeyboard={false} extraBottom={250} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} scrollToTop={scrollToTop}>
                        {workout.exercises.map((exercise, index) => (
                            <Exercise
                                key={index}
                                user={user}
                                exercise={exercise.exercise}
                                sets={exercise.sets}
                                onDeletePress={() => handleDeleteExercise(exercise.id)}
                                onAddPress={() => { }}
                                onSetDeletePress={() => { }}
                                onSetEditPress={() => { }}
                                onExpandPress={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                                expanded={expandedExercise === exercise.id}
                            />
                        ))}
                    </AppScroll >
                )
                :
                (
                    <View style={{ backgroundColor: colors.background, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={Images.icon6} style={{ width: 100, height: 100, tintColor: colors.mutedText }} />
                        <AppText style={{ fontSize: scaleFont(16), color: colors.mutedText, fontWeight: 'bold', textAlign: 'center', marginTop: 15 }}>No Exercises</AppText>
                        <AppText style={{ fontSize: scaleFont(14), color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Tap below start adding exercises to the workout</AppText>
                    </View>
                )}
        </>
    );
}