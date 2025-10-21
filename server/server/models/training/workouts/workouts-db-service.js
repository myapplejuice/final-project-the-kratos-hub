import sql from 'mssql/msnodesqlv8.js';
import Database from '../../database/database.js';
import ObjectMapper from '../../../utils/object-mapper.js';
import WorkoutsExercisesDBService from './workouts-exercises/workouts-exercises-db-service.js';

export default class WorkoutsDBService {
    static async fetchWorkouts(userId) {
        if (!userId) return null;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            const query = `
                SELECT *
                FROM dbo.Workouts
                WHERE UserId = @UserId
                ORDER BY Date DESC
              `;
        
            const result = await request.query(query);
            if (!result.recordset) return [];

            const workouts = [];

            for (const row of result.recordset) {
                const workout = {};
                for (const key in row) {
                    workout[ObjectMapper.toCamelCase(key)] = row[key];
                }
                workout.exercises = await WorkoutsExercisesDBService.fetchWorkoutExercises(workout.id, userId) || [];

                workouts.push(workout);
            }

            return workouts;
        } catch (err) {
            console.error('fetchWorkouts error:', err);
            return null;
        }
    }

    static async createWorkout(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, details.userId);
            Database.addInput(request, 'Date', sql.DateTime2, details.date);
            Database.addInput(request, 'Label', sql.NVarChar(sql.MAX), details.label || null);
            Database.addInput(request, 'Description', sql.NVarChar(sql.MAX), details.description || null);
            Database.addInput(request, 'Intensity', sql.NVarChar(sql.MAX), details.intensity || null);
            Database.addInput(request, 'Duration', sql.NVarChar(sql.MAX), details.duration || null);

            const query = `
               INSERT INTO dbo.Workouts (UserId, Date, Label, Description, Intensity, Duration)
               OUTPUT INSERTED.*
               VALUES (@UserId, @Date, @Label, @Description, @Intensity, @Duration)
             `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const workout = {};
            for (const key in result.recordset[0]) {
                workout[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }
            return workout;
        } catch (err) {
            console.error('createWorkout error:', err);
            return null;
        }
    }

    static async updateWorkout(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, details.id);
            Database.addInput(request, 'Label', sql.NVarChar(sql.MAX), details.label || null);
            Database.addInput(request, 'Description', sql.NVarChar(sql.MAX), details.description || null);
            Database.addInput(request, 'Intensity', sql.NVarChar(sql.MAX), details.intensity || null);
            Database.addInput(request, 'Duration', sql.NVarChar(sql.MAX), details.duration || null);

            const query = `
        UPDATE dbo.Workouts
        SET Label = @Label,
            Description = @Description,
            Intensity = @Intensity,
            Duration = @Duration
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const workout = {};
            for (const key in result.recordset[0]) {
                workout[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }
            return workout;
        } catch (err) {
            console.error('updateWorkout error:', err);
            return null;
        }
    }

    static async deleteWorkout(id) {
        if (!id) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, id);

            const query = `
        DELETE FROM dbo.Workouts
        WHERE Id = @Id
      `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('deleteWorkout error:', err);
            return false;
        }
    }
}
