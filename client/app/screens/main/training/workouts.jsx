import { Image } from "expo-image";
import { useContext, useState } from "react";
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

export default function Workouts() {
    const context = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const { createInput, showSpinner, hideSpinner, createToast, createDialog, createAlert } = usePopups();
    const { user, setUser } = useContext(UserContext);
    const [scrollToTop, setScrollToTop] = useState(false);
    const [fabVisible, setFabVisible] = useState(true);

    async function handleWorkoutAddition() {

    }

    async function handleWorkoutDeletion(workout) {

    }

    async function handleWorkoutUpdate(workout) {

    }

    async function handleWorkoutImport(workout) {
    }

    async function handleWorkoutPress(selectedWorkoutId) {

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
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
            />

            <AppScroll avoidKeyboard={false} extraBottom={250} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} scrollToTop={scrollToTop}>
                <Workout
                    workout={{
                        id: 1,
                        userId: "550e8400-e29b-41d4-a716-446655440000",
                        date: "2025-10-21T10:00:00Z",
                        label: "Upper Body Strength",
                        description: "Focus on chest, shoulders, and triceps",
                        intensity: "Moderate",
                        duration: "60 min",
                        totalExercises: 0, // placeholder for now
                        totalSets: 0,      // placeholder for now
                        totalVolume: 0,    // placeholder for now (sum of reps*weight)
                    }}
                    expanded={true}
                />
            </AppScroll >
        </>
    );
}