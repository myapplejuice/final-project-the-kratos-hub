import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "../../components/screen-comps/app-text";
import AppTextInput from "../../components/screen-comps/app-text-input";
import usePopups from "../../common/hooks/use-popups";
import AppScroll from "../../components/screen-comps/app-scroll";
import APIService from "../../common/services/api-service";

export default function TrainingHub() {
    const { showSpinner, hideSpinner, createAlert, createToast,
        createPicker, createInput, createOptions, createSelector,
        hideInput, hideSelector, createDialog } = usePopups();

    const [sessionId, setSessionId] = useState(null);
    const [masterExercises, setMasterExercises] = useState([]);
    const [showExerciseList, setShowExerciseList] = useState(false);
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);

    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        async function fetchMasterExercises() {
            try {
                showSpinner();
                const result = await APIService.training.fetch.masterExercises();

                if (result.success) {
                    const exercises = result.data.exercises;
                    setMasterExercises(exercises);
                }
                else {
                    createAlert({ title: "Network Error", text: result.message });
                }
            } catch (err) {
                console.error("Error fetching exercises:", err);
            } finally {
                hideSpinner();
            }
        };

        fetchMasterExercises();
    }, []);

    async function startTraining() {
        try {
            showSpinner();
            const result = await APIService.training.post.startSession();

            if (result.success) {
                const sessionId = result.data.sessionId;
                setSessionId(sessionId);
            }
            else {
                createAlert({ title: "Network Error", text: result.message });
            }
        } catch (err) {
            console.error("Error starting session:", err);
            createAlert({ title: "Network Error", text: 'Could not start the training session. Please try again later' });
        } finally {
            hideSpinner();
        }
    }

    async function addExercise(exerciseObj) {
        try {
            const payload = { sessionId, exerciseName: exerciseObj.Name };
            const result = await APIService.training.post.addExercise(payload);

            if (result.success) {
                const exerceiseId = result.data.exerciseId;

                const newExercise = {
                    id: exerceiseId,
                    name: exerciseObj.Name,
                    isTimerOnly: exerciseObj.IsTimerOnly,
                    sets: [],
                };

                setExercises((prev) => [...prev, newExercise]);
                setSelectedExercise(newExercise);
                setShowExerciseList(false);
            } else {
                createAlert({ title: "Network Error", text: result.message });
            }
        } catch (err) {
            console.error("Error adding exercise:", err.message);
            createAlert({ title: "Network Error", text: err.message });
        }
    }

    async function addSet() {
        if (!selectedExercise) return;
        if (!weight && !selectedExercise.isTimerOnly) {
            createToast({ message: "Please fill weight and reps" });
            return;
        }

        try {
            const payload = { exerciseId: selectedExercise.id, weight, reps, note };
            const result = await APIService.training.post.addSet(payload);

            if (result.success) {
                setExercises((prev) =>
                    prev.map((ex) =>
                        ex.id === selectedExercise.id
                            ? { ...ex, sets: [...ex.sets, { weight, reps, note }] }
                            : ex
                    )
                );

                setWeight("");
                setReps("");
                setNote("");
            } else {
                createAlert({ title: "Network Error", text: result.message });

            }
        } catch (err) {
            console.error("Error adding set:", err);
        }
    }

    return (
        <AppScroll extraBottom={150}>
            <View style={{ margin: 15 }}>
                {!sessionId ? (
                    <TouchableOpacity style={styles.button} onPress={startTraining}>
                        <AppText style={styles.buttonText}>Start Training</AppText>
                    </TouchableOpacity>
                ) : (
                    <>
                        <AppText style={styles.header}>Training Session</AppText>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setShowExerciseList(true)}
                        >
                            <AppText style={styles.buttonText}>Add Exercise</AppText>
                        </TouchableOpacity>

                        {showExerciseList && !selectedExercise && (
                            <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                                {masterExercises.map((item) => (
                                    <TouchableOpacity
                                        key={item.Id}
                                        style={styles.exerciseButton}
                                        onPress={() => addExercise(item)}
                                    >
                                        <AppText style={styles.exerciseText}>{item.Name}</AppText>
                                    </TouchableOpacity>
                                ))}
                            </KeyboardAwareScrollView>
                        )}

                        {selectedExercise && !selectedExercise.isTimerOnly && (
                            <View style={styles.setBox}>
                                <AppText style={styles.subtitle}>Add Set for {selectedExercise.name}</AppText>
                                <AppTextInput
                                    style={styles.input}
                                    placeholder="Weight (kg)"
                                    placeholderTextColor="#aaa"
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                />
                                <AppTextInput
                                    style={styles.input}
                                    placeholder="Reps"
                                    placeholderTextColor="#aaa"
                                    value={reps}
                                    onChangeText={setReps}
                                    keyboardType="numeric"
                                />
                                <AppTextInput
                                    style={styles.input}
                                    placeholder="Note (optional)"
                                    placeholderTextColor="#aaa"
                                    value={note}
                                    onChangeText={setNote}
                                />
                                <TouchableOpacity style={styles.buttonSmall} onPress={addSet}>
                                    <AppText style={styles.buttonText}>Add Set</AppText>
                                </TouchableOpacity>
                            </View>
                        )}

                        {exercises.map((ex) => (
                            <View key={ex.id} style={styles.exerciseBlock}>
                                <AppText style={styles.exerciseTitle}>{ex.name}</AppText>
                                {ex.sets.map((s, idx) => (
                                    <AppText key={idx} style={styles.setText}>
                                        Set {idx + 1}: {s.weight}kg x {s.reps || ""} reps{" "}
                                        {s.note ? `(${s.note})` : ""}
                                    </AppText>
                                ))}
                            </View>
                        ))}
                    </>
                )}
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#4ECDC4",
        padding: 12,
        borderRadius: 8,
        marginVertical: 10
    },
    buttonSmall: {
        backgroundColor: "#FF6B6B",
        padding: 10,
        borderRadius: 8,
        marginVertical: 5
    },
    buttonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
    header: { color: "white", fontSize: 24, fontWeight: "700", marginBottom: 15 },
    exerciseButton: {
        padding: 15,
        backgroundColor: "#333",
        marginVertical: 5,
        borderRadius: 10
    },
    exerciseText: { color: "#fff", fontSize: 18 },
    setBox: { marginTop: 15 },
    input: {
        borderWidth: 1,
        borderColor: "#666",
        backgroundColor: "#222",
        color: "#fff",
        padding: 8,
        marginVertical: 5,
        borderRadius: 8
    },
    exerciseBlock: {
        padding: 10,
        backgroundColor: "#333",
        marginVertical: 10,
        borderRadius: 10
    },
    exerciseTitle: { color: "#4CAF50", fontSize: 20, fontWeight: "700" },
    setText: { color: "#fff", marginLeft: 10, marginTop: 5 },
    subtitle: { color: "#fff", fontSize: 16, marginBottom: 5 }
});
