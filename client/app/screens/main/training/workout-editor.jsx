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
import ExerciseProfileCard from "../../../components/screen-comps/exercise-profile-card";

export default function WorkoutEditor() {
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const { createInput, showSpinner, hideSpinner, createToast, createDialog, createAlert, createOptions } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [scrollToTop, setScrollToTop] = useState(false);
    const [fabVisible, setFabVisible] = useState(true);

    const [expandedExercise, setExpandedExercise] = useState(null);
    const [workout, setWorkout] = useState(JSON.parse(params.workout));

    console.log(workout);
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
                onPress={() => {}}
                visible={fabVisible}
                position={{ bottom: insets.bottom + 50, right: 20, left: 20 }}
                style={{ width: '100%', height: 50, backgroundColor: colors.accentGreen }}
                label="Create New Workout"
                icon={Images.plus}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
            />

            {workout.exercises.length > 0 ?
                (
                    <AppScroll avoidKeyboard={false} extraBottom={250} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} scrollToTop={scrollToTop}>
                        <View style={{ margin: 15 }}>
                            {workout.exercises.map((exercise, index) => (
                                <ExerciseProfileCard
                                    key={index}
                                    exercise={exercise}
                                    onAddPress={() => { }}
                                    onExpandPress={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                                    expanded={expandedExercise === exercise.id}
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
                )}
        </>
    );
}