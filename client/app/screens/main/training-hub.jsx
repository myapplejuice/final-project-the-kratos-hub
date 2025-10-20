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
    const { user, setUser } = useContext(UserContext);
    const insets = useSafeAreaInsets();

    const [fabVisible, setFabVisible] = useState(true);
    const [totalEnergy, setTotalEnergy] = useState(0);
    const [totalExercises, setTotalExercises] = useState(0);
    const [date, setDate] = useState(new Date());
    const [exercises, setExercises] = useState([]);
    const [dateExercises, setDateExercises] = useState([]);

    useEffect(() => {
        async function fetchExercises() {
            const result = await APIService.training.exercises();

            if (result.success) {
                const exercises = result.data.exercises;
                setExercises(result.data.exercises);
                setDateExercises(exercises.filter(exercise => formatDate(exercise.date, { format: 'YYYY-MM-DD' }) === formatDate(date, { format: 'YYYY-MM-DD' })));
            }
        }

        fetchExercises();
    }, []);

    useEffect(() => {
        setDateExercises(exercises.filter(exercise => formatDate(exercise.date, { format: 'YYYY-MM-DD' }) === formatDate(date, { format: 'YYYY-MM-DD' })));
    }, [date]);

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
        createInput({
            title: "Add Exercise",
            confirmText: "Add",
            text: `Enter label, description and body part of the exercise`,
            placeholders: [`Label`, `Description`, `Body Part`],
            initialValues: [``, ``, ``],
            onSubmit: async (vals) => {
                try {
                    const [label, description, bodyPart] = vals;

                    if (!label)
                        return createToast({ message: "Label is required" });

                    const payload = {
                        userId: user.id,
                        date: new Date(),
                        label,
                        description: description || "No description",
                        bodyPart: bodyPart || "Unknown Body Part",
                        image: "",
                        sets: [],
                    }

                    const result = await APIService.training.create(payload);

                    if (result.success) {
                        const exercise = result.data.exercise;

                        setExercises(prev => [...prev, exercise]);
                        setDateExercises(prev => [...prev, exercise]);
                    }
                } catch (e) {
                    console.log(e)
                } finally {
                    hideSpinner();
                }
            }
        });
    }

    async function handleEditExercise() {

    }

    async function handleDeleteExercise() {

    }

    async function handleAddSet() {

    }

    async function handleEditSet(){
        
    }

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
                            <AppText style={{ color: nutritionColors.carbs1, fontWeight: 'bold', fontSize: scaleFont(20), textAlign: 'center' }}>{totalExercises}</AppText>
                            <AppText style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(15), textAlign: 'center' }}>Exercises</AppText>
                        </View>
                        <View style={{ width: '10%', alignItems: 'center', justifyContent: 'center', height: 50 }}>
                            <Divider />
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: '45%' }}>
                            <AppText style={{ color: nutritionColors.energy1, fontWeight: 'bold', fontSize: scaleFont(20), textAlign: 'center' }}>{convertEnergy(totalEnergy, 'kcal', user.preferences.energyUnit.key)} {user.preferences.energyUnit.field}</AppText>
                            <AppText style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(15), textAlign: 'center' }}>Energy Burned</AppText>
                        </View>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <AppText style={{ fontSize: scaleFont(15), color: colors.white, fontWeight: 'bold', marginTop: 35, marginHorizontal: 25 }}>
                        Training Summary
                    </AppText>
                </View>

                {dateExercises.map((exercise, i) =>
                    <Exercise
                        key={i}
                        user={user}
                        exercise={exercise}
                        onAddPress={()=> handleAddSet(exercise)}
                        onSetPress={(set) => handleEditSet(set)}
                    />
                )}
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