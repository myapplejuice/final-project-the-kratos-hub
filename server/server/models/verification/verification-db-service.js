import sql from 'mssql/msnodesqlv8.js';
import Database from '../database/database.js';

export default class VerificationDBService {
    static async createApplication(details) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'UserId', sql.UniqueIdentifier, details.userId);
            Database.addInput(request, 'TrainerStatus', sql.VarChar(20), details.trainerProfile?.trainerStatus || 'inactive');
            Database.addInput(request, 'Summary', sql.VarChar(1000), details.application?.summary || '');
            Database.addInput(request, 'Education', sql.VarChar(1000), details.application?.education || '');
            Database.addInput(request, 'Images', sql.VarChar(sql.MAX), JSON.stringify(details.application?.images || []));
            Database.addInput(request, 'Links', sql.VarChar(sql.MAX), JSON.stringify(details.application?.links || []));
            Database.addInput(request, 'Status', sql.VarChar(20), details.application?.status || 'pending');

            const insertQuery = `
                INSERT INTO VerificationApplications (UserId, Status, Summary, Education, Images, Links)
                OUTPUT inserted.Id
                VALUES (@UserId, @Status, @Summary, @Education, @Images, @Links)
            `;

            const result = await request.query(insertQuery);
            const applicationId = result.recordset[0]?.Id;

            return { success: true, message: 'Application created successfully', applicationId };
        } catch (err) {
            console.error('createApplication error:', err);
            return { success: false, message: 'Failed to create application' };
        }
    }

    static async updateApplication(details) {
        try {
            const request = Database.getRequest();

            Database.addInput(request, 'Id', sql.Int, details.applicationId);
            Database.addInput(request, 'TrainerStatus', sql.VarChar(20), details.trainerProfile?.trainerStatus || 'inactive');
            Database.addInput(request, 'Summary', sql.VarChar(1000), details.application?.summary || '');
            Database.addInput(request, 'Education', sql.VarChar(1000), details.application?.education || '');
            Database.addInput(request, 'Images', sql.VarChar(sql.MAX), JSON.stringify(details.application?.images || []));
            Database.addInput(request, 'Links', sql.VarChar(sql.MAX), JSON.stringify(details.application?.links || []));
            Database.addInput(request, 'Status', sql.VarChar(20), details.application?.status || 'pending');

            const updateQuery = `
                UPDATE VerificationApplications
                SET Status = @Status,
                    Summary = @Summary,
                    Education = @Education,
                    Images = @Images,
                    Links = @Links
                WHERE Id = @Id
            `;

            await request.query(updateQuery);
            return { success: true, message: 'Application updated successfully', applicationId: details.applicationId };
        } catch (err) {
            console.error('updateApplication error:', err);
            return { success: false, message: 'Failed to update application' };
        }
    }

    static async deleteApplication(applicationId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, applicationId);

            const deleteQuery = `DELETE FROM VerificationApplications WHERE Id = @Id`;
            const result = await request.query(deleteQuery);

            if (!result.rowsAffected[0]) return { success: false, message: 'Application not found or already deleted' };
            return { success: true, message: 'Application deleted successfully' };
        } catch (err) {
            console.error('deleteApplication error:', err);
            return { success: false, message: 'Failed to delete application' };
        }
    }

    static async fetchApplication(applicationId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, applicationId);

            const query = `SELECT * FROM VerificationApplications WHERE Id = @Id`;
            const result = await request.query(query);

            if (!result.recordset.length) return null;
            const row = result.recordset[0];
            row.Images = JSON.parse(row.Images || '[]');
            row.Links = JSON.parse(row.Links || '[]');

            return row;
        } catch (err) {
            console.error('fetchApplication error:', err);
            return null;
        }
    }
}
