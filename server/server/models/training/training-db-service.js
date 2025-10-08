import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const DATA_FILE = path.join(process.cwd(), 'trainingData.json');

function loadData() {
    if (!fs.existsSync(DATA_FILE)) return { sessions: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const masterExercises = [
    { Id: 1, Name: "Bench Press", IsTimerOnly: false },
    { Id: 2, Name: "Pull Up", IsTimerOnly: false },
    { Id: 3, Name: "Plank", IsTimerOnly: true },
];

export default class TrainingDBService {
    static async fetchMasterExercises() {
        return masterExercises;
    }

    static async fetchSession(sessionId) {
        const data = loadData();
        const session = data.sessions.find(s => s.sessionId === sessionId);
        return session || null;
    }

    static async fetchAllSessions(userId) {
        const data = loadData();
        return data.sessions.filter(s => s.userId === userId) || [];
    }

    static async startSession(userId) {
        const data = loadData();

        const sessionId = uuidv4();
        data.sessions.push({ sessionId, userId, exercises: [] });
        saveData(data);

        return { sessionId };
    }

    static async addExercise(sessionId, exerciseName, isTimerOnly = false) {
        const data = loadData();

        console.log(sessionId, exerciseName);
        const session = data.sessions.find(s => s.sessionId === sessionId);
        if (!session) throw new Error("Session not found");

        const exercise = masterExercises.find(e => e.Name === exerciseName);
        if (!exercise) throw new Error("Exercise not found");

        const exerciseId = uuidv4();
        const exObj = { exerciseId, name: exercise.Name, isTimerOnly: exercise.IsTimerOnly, sets: [] };
        session.exercises.push(exObj);
        saveData(data);

        return { exerciseId };
    }

    static async addSet(exerciseId, weight, reps, note) {
        const data = loadData();

        for (const session of data.sessions) {
            const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
            if (exercise) {
                exercise.sets.push({ weight, reps, note });
                saveData(data);
                return true;
            }
        }

        return false;
    }
}
