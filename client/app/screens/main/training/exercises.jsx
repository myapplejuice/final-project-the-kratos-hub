import { router, useLocalSearchParams, } from 'expo-router';
import { useContext, useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppScroll from "../../../components/screen-comps/app-scroll";
import AppText from "../../../components/screen-comps/app-text";
import AppTextInput from "../../../components/screen-comps/app-text-input";
import AppView from "../../../components/screen-comps/app-view";
import Divider from "../../../components/screen-comps/divider";
import FloatingActionButton from "../../../components/screen-comps/floating-action-button";
import { Images } from "../../../common/settings/assets";
import { UserContext } from "../../../common/contexts/user-context";
import { convertEnergy } from "../../../common/utils/unit-converter";
import { scaleFont } from "../../../common/utils/scale-fonts";
import { routes } from "../../../common/settings/constants";
import { colors, nutritionColors } from "../../../common/settings/styling";
import FadeInOut from "../../../components/effects/fade-in-out";
import { CameraContext } from '../../../common/contexts/camera-context';
import BarcodeScanner from '../../../components/screen-comps/barcode-scanner';
import { exercises, muscleGroups } from '../../../common/utils/global-options';
import ExerciseCard from './exercise-card';
import usePopups from '../../../common/hooks/use-popups';
import { ScrollView } from 'react-native';

export default function Exercises() {
    const params = useLocalSearchParams();
    const date = params.date;
    const { createOptions } = usePopups();
    const { user } = useContext(UserContext);
    const { setCameraActive } = useContext(CameraContext);
    const insets = useSafeAreaInsets();
    const [fabVisible, setFabVisible] = useState(true);
    const [scrollToTop, setScrollToTop] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [visibleExercises, setVisibleExercises] = useState([]);
    const [filter, setFilter] = useState({ muscle: '', level: '', type: '' });

    useEffect(() => {
        const level = filter.level.toLowerCase();
        const type = filter.type.toLowerCase();
        const query = searchQuery.toLowerCase();

        const filtered = exercises.filter(ex => {
            const mainMuscle = ex.muscleGroups[0];

            const matchMuscle = filter.muscle ? mainMuscle.toLowerCase() === filter.muscle.toLowerCase() : true;
            const matchLevel = filter.level ? ex.level.toLowerCase() === level : true;
            const matchType = filter.type ? ex.type.toLowerCase() === type : true;

            const matchSearch = query
                ? ex.label.toLowerCase().includes(query) ||
                ex.muscleGroups.some(m => m.toLowerCase().includes(query))
                : true;

            return matchMuscle && matchLevel && matchType && matchSearch;
        });

        const start = 0;
        const end = page * pageSize;
        setFilteredExercises(filtered);
        setVisibleExercises(filtered.slice(start, end));
    }, [page, filter, searchQuery]);

    async function handleFiltering(filterKey) {
        const options =
            filterKey === 'Muscle' ? muscleGroups :
                filterKey === 'Level' ? [
                    "Beginner",
                    "Intermediate",
                    "Advanced"
                ] :
                    ["Compound", "Isolation"];

        createOptions({
            title: `${filterKey}`,
            options,
            current: filter[filterKey] ? filter[filterKey] : null,
            onConfirm: (selected) => {
                if (!selected) return;

                setScrollToTop(true);
                setPage(1);
                setFilter({ ...filter, [filterKey.toLowerCase()]: selected });
            },
        });
    }

    async function handleAddExercise(exercise) {
        try {
            showSpinner();
            const [label, description, bodyPart] = vals;

            if (!label)
                return createToast({ message: "Label is required" });

            const payload = {
                userId: user.id,
                date,
                label,
                description: description || "",
                bodyPart: bodyPart || "",
                image: "",
                sets: [],
            }

            const result = await APIService.training.create(payload);

            if (result.success) {
                const exercise = result.data.exercise;
            }
        } catch (e) {
            console.log(e)
        } finally {
            hideSpinner();
        }
    }

    return (
        <>
            <FloatingActionButton
                onPress={() => setScrollToTop(true)}
                visible={!fabVisible}
                position={{ bottom: insets.bottom + 40, left: 20 }}
                icon={Images.arrow}
                iconStyle={{ transform: [{ rotate: '-90deg' }], marginBottom: 2 }}
                iconSize={20}
                size={40}
            />

            <FloatingActionButton
                onPress={() => { setFilter({ muscle: '', level: '', type: '' }, setScrollToTop(true)) }}
                visible={!fabVisible && JSON.stringify(filter) !== JSON.stringify({ muscle: '', level: '', type: '' })}
                style={{ width: '100%', padding: 15 }}
                position={{ bottom: insets.bottom + 40, right: 20 }}
                icon={Images.reset}
                iconSize={20}
                label='Clear Filter'
                size={40}
            />

            <AppView style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.inputBackground, alignItems: 'center', borderRadius: 15, marginVertical: 15, height: 50 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '80%' }}>
                        <Image source={Images.magnifier} style={{ tintColor: colors.mutedText, width: 20, height: 20, marginHorizontal: 15 }} />
                        <AppTextInput
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            placeholder="Search"
                            placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                            style={styles.inputStripped} />
                    </View>
                </View>

                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        {['Muscle', 'Level', 'Type'].map((filterKey, idx) => {
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => handleFiltering(filterKey)}
                                    style={{
                                        width: '30%',
                                        alignItems: 'center',
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        backgroundColor: filter[filterKey.toLowerCase()] ? colors.main : colors.cardBackground,
                                    }}
                                >
                                    <AppText style={{ color: 'white', fontSize: 14 }}>{filter[filterKey.toLowerCase()] || filterKey}</AppText>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                <Divider orientation="horizontal" thickness={2} color={colors.divider} style={{ borderRadius: 50, marginBottom: 15 }} />

                <AppScroll scrollToTop={scrollToTop} extraBottom={350} onScrollSetStates={[setFabVisible, () => setScrollToTop(false)]} extraTop={0} topPadding={false}>
                    {visibleExercises.map((exercise, index) =>
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            expanded={expandedId === exercise.id}
                            onExpandPress={() => expandedId === exercise.id ? setExpandedId(null) : setExpandedId(exercise.id)}
                            onAddPress={() => handleAddExercise(exercise)}
                        />
                    )
                    }
                    {visibleExercises.length < filteredExercises.length && (
                        <TouchableOpacity onPress={() => setPage(page + 1)} style={{ alignItems: 'center', borderWidth: 1, borderColor: colors.mutedText, borderRadius: 15, width: 100, alignSelf: 'center', marginTop: 30 }}>
                            <AppText style={{ textAlign: 'center', marginVertical: 15, color: colors.mutedText }}>Load More</AppText>
                        </TouchableOpacity>
                    )}
                </AppScroll>

            </AppView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
    },
    sectionTitle: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: 'white',
        marginHorizontal: 10,
        marginBottom: 10
    },
    inputStripped: {
        height: 50,
        color: "white",
        width: '100%',
    },
    input: {
        height: 50,
        color: "white",
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 15,
        paddingHorizontal: 15,
        marginHorizontal: 15,
        backgroundColor: colors.inputBackground
    },
    card: {
        backgroundColor: colors.cardBackground,
        padding: 15,
        borderRadius: 15,
        marginTop: 15,
        marginHorizontal: 15
    },
});