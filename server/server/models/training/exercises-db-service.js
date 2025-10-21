import sql from 'mssql/msnodesqlv8.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

export default class ExercisesDBService {
    static async fetchExercises(userId) {
        if (!userId) return null;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            const query = `
                SELECT *
                FROM dbo.Exercises
                WHERE UserId = @UserId
                ORDER BY Date DESC
            `;

            const result = await request.query(query);
            if (!result.recordset || result.recordset.length === 0) return [];

            // Map and parse Sets
            const exercises = result.recordset.map((row) => {
                const exercise = {};
                for (const key in row) {
                    if (key === 'Sets' || key === 'Exercise') {
                        exercise[ObjectMapper.toCamelCase(key)] = JSON.parse(row[key]);
                    } else {
                        exercise[ObjectMapper.toCamelCase(key)] = row[key];
                    }
                }
                return exercise;
            });

            return exercises;
        } catch (err) {
            console.error('fetchExercises error:', err);
            return null;
        }
    }

    static async createExercise(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, details.userId);
            Database.addInput(request, 'Date', sql.DateTime2, details.date);
            Database.addInput(request, 'Exercise', sql.NVarChar(sql.MAX), JSON.stringify(details.exercise));
            Database.addInput(request, 'Sets', sql.NVarChar(sql.MAX), JSON.stringify(details.sets));

            const query = `
                INSERT INTO dbo.Exercises (UserId, Exercise, Sets)
                OUTPUT INSERTED.*
                VALUES (@UserId, @Exercise, @Sets)
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const exercise = {};
            for (const key in result.recordset[0]) {
                if (key === 'Sets' || key === 'Exercise')
                    exercise[ObjectMapper.toCamelCase(key)] = JSON.parse(result.recordset[0][key]);
                else
                    exercise[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            return exercise;
        } catch (err) {
            console.error('createExercise error:', err);
            return null;
        }
    }

    static async updateExercise(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, details.id);
            Database.addInput(request, 'Exercise', sql.NVarChar(sql.MAX), JSON.stringify(details.exercise));

            const query = `
                UPDATE dbo.Exercises
                SET Exercise = @Exercise
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const exercise = {};
            for (const key in result.recordset[0]) {
                if (key === 'Sets' || key === 'Exercise')
                    exercise[ObjectMapper.toCamelCase(key)] = JSON.parse(result.recordset[0][key]);
                else
                    exercise[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            return exercise;
        } catch (err) {
            console.error('updateExercise error:', err);
            return null;
        }
    }

    static async updateExerciseSets(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, details.exerciseId);
            Database.addInput(request, 'Sets', sql.NVarChar(sql.MAX), JSON.stringify(details.sets));

            const query = `
                UPDATE dbo.Exercises
                SET Sets = @Sets
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const exercise = {};
            for (const key in result.recordset[0]) {
                if (key === 'Sets' || key === 'Exercise')
                    exercise[ObjectMapper.toCamelCase(key)] = JSON.parse(result.recordset[0][key]);
                else
                    exercise[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            return exercise;
        } catch (err) {
            console.error('updateExercise error:', err);
            return null;
        }
    }

    static async deleteExercise(id) {
        if (!id) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, id);

            const query = `
                DELETE FROM dbo.Exercises
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('deleteExercise error:', err);
            return false;
        }
    }

    static async createBulkExercises(details) {
        const { userId, date, exercises } = details;

        try {
            const insertedExercises = await Promise.all(
                exercises.map(async (exercise) => {
                    const request = Database.getRequest();
                    Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
                    Database.addInput(request, 'Date', sql.DateTime2, date);
                    Database.addInput(request, 'Exercise', sql.NVarChar(sql.MAX), JSON.stringify(exercise.exercise));
                    Database.addInput(request, 'Sets', sql.NVarChar(sql.MAX), JSON.stringify(exercise.sets));

                    const query = `
                    INSERT INTO dbo.Exercises (UserId, Exercise, Sets)
                    OUTPUT INSERTED.*
                    VALUES (@UserId, @Exercise, @Sets)
                `;

                    const result = await request.query(query);
                    if (!result.recordset[0]) return null;

                    const inserted = {};
                    for (const key in result.recordset[0]) {
                        if (key === 'Sets' || key === 'Exercise') {
                            inserted[ObjectMapper.toCamelCase(key)] = JSON.parse(result.recordset[0][key]);
                        } else {
                            inserted[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
                        }
                    }

                    return inserted;
                })
            );

            return insertedExercises;
        } catch (err) {
            console.error('createBulkExercises error:', err);
            return null;
        }
    }
}
