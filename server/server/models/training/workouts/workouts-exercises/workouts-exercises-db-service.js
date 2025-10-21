import sql from 'mssql/msnodesqlv8.js';
import Database from '../../../database/database.js';
import ObjectMapper from '../../../../utils/object-mapper.js';

export default class WorkoutsExercisesDBService {
    static async fetchWorkoutExercises(workoutId, userId) {
        if (!workoutId || !userId) return [];

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'WorkoutId', sql.Int, workoutId);
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            const query = `
        SELECT *
        FROM dbo.WorkoutsExercises
        WHERE WorkoutId = @WorkoutId AND UserId = @UserId
        ORDER BY Id ASC
      `;

            const result = await request.query(query);
            if (!result.recordset || result.recordset.length === 0) return [];

            return result.recordset.map(row => {
                const exercise = {};
                for (const key in row) {
                    if (['Sets', 'Exercise'].includes(key)) {
                        exercise[ObjectMapper.toCamelCase(key)] = JSON.parse(row[key] || '[]');
                    } else {
                        exercise[ObjectMapper.toCamelCase(key)] = row[key];
                    }
                }
                return exercise;
            });
        } catch (err) {
            console.error('fetchWorkoutExercises error:', err);
            return [];
        }
    }

    static async createWorkoutExercise(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, details.userId);
            Database.addInput(request, 'WorkoutId', sql.Int, details.workoutId);
            Database.addInput(request, 'Exercise', sql.NVarChar(sql.MAX), JSON.stringify(details.exercise || []));
            Database.addInput(request, 'Sets', sql.NVarChar(sql.MAX), JSON.stringify(details.sets || []));

            const query = `
            INSERT INTO dbo.WorkoutsExercises (UserId, WorkoutId, Exercise, Sets)
            OUTPUT INSERTED.*
            VALUES (@UserId, @WorkoutId, @Exercise, @Sets)
          `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const we = {};
            for (const key in result.recordset[0]) {
                if (['Sets', 'Exercise'].includes(key)) {
                    we[ObjectMapper.toCamelCase(key)] = JSON.parse(result.recordset[0][key] || '[]');
                } else {
                    we[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
                }
            }
            return we;
        } catch (err) {
            console.error('createWorkoutExercise error:', err);
            return null;
        }
    }

    static async updateWorkoutExercise(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, details.exerciseId);
            Database.addInput(request, 'Sets', sql.NVarChar(sql.MAX), JSON.stringify(details.sets || []));

            const query = `
               UPDATE dbo.WorkoutsExercises
               SET Sets = @Sets
               OUTPUT INSERTED.*
               WHERE Id = @Id
             `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const we = {};
            for (const key in result.recordset[0]) {
                if (['Sets', 'Exercise'].includes(key)) {
                    we[ObjectMapper.toCamelCase(key)] = JSON.parse(result.recordset[0][key] || '[]');
                } else {
                    we[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
                }
            }
            return we;
        } catch (err) {
            console.error('updateWorkoutExercise error:', err);
            return null;
        }
    }

    static async deleteWorkoutExercise(id) {
        if (!id) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, id);

            const query = `
        DELETE FROM dbo.WorkoutsExercises
        WHERE Id = @Id
      `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('deleteWorkoutExercise error:', err);
            return false;
        }
    }
}
