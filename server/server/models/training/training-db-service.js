import sql from 'mssql/msnodesqlv8.js';
import Database from '../database/database';
import ObjectMapper from '../../utils/object-mapper';

export default class TrainingDBService {
    static async createExercise(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, details.userId);
            Database.addInput(request, 'Label', sql.VarChar(100), details.label);
            Database.addInput(request, 'Description', sql.VarChar(1000), details.description);
            Database.addInput(request, 'BodyPart', sql.VarChar(100), details.bodyPart);
            Database.addInput(request, 'Image', sql.NVarChar(sql.MAX), details.image);
            Database.addInput(request, 'Sets', sql.NVarChar(sql.MAX), JSON.stringify(details.sets));

            const query = `
                INSERT INTO dbo.VerificationApplications (UserId, Label, Description, BodyPart, Image, Sets)
                OUTPUT INSERTED.*
                VALUES (@UserId, @Label, @Description, @BodyPart, @Image, @Sets)
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const exercise = {};
            for (const key in result.recordset[0]) {
                if (key === 'Sets')
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
            Database.addInput(request, 'Label', sql.VarChar(100), details.label);
            Database.addInput(request, 'Description', sql.VarChar(1000), details.description);
            Database.addInput(request, 'BodyPart', sql.VarChar(100), details.bodyPart);
            Database.addInput(request, 'Image', sql.NVarChar(sql.MAX), details.image);
            Database.addInput(request, 'Sets', sql.NVarChar(sql.MAX), JSON.stringify(details.sets));

            const query = `
                UPDATE dbo.VerificationApplications
                SET Label = @Label,
                    Description = @Description,
                    BodyPart = @BodyPart,
                    Image = @Image,
                    Sets = @Sets
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const exercise = {};
            for (const key in result.recordset[0]) {
                if (key === 'Sets')
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
                DELETE FROM dbo.VerificationApplications
                WHERE Id = @Id
            `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('deleteExercise error:', err);
            return false;
        }
    }
}
