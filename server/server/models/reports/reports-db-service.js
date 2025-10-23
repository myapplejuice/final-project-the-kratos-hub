import sql from 'mssql/msnodesqlv8.js';
import ObjectMapper from "../../utils/object-mapper.js";
import Database from "../database/database.js";

export default class ReportsDBService {
    static async insertReport(details) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, details.userId);
            Database.addInput(request, 'ReportedUserId', sql.UniqueIdentifier, details.reportedUserId);
            Database.addInput(request, 'DateOfCreation', sql.DateTime2, new Date());
            Database.addInput(request, 'Type', sql.VarChar(20), details.type);
            Database.addInput(request, 'Offense', sql.VarChar(50), details.offense);
            Database.addInput(request, 'Summary', sql.VarChar(500), details.summary);
            Database.addInput(request, 'ImagesURLS', sql.VarChar(sql.MAX), JSON.stringify(details.imagesURLS || []));
            Database.addInput(request, 'Resolved', sql.VarChar(50), false);
            Database.addInput(request, 'AdminNote', sql.VarChar(50), 'Not reviewed yet');

            const insertQuery = `
                INSERT INTO UserReports (UserId, ReportedUserId, DateOfCreation, Type, Offense, Summary, ImagesURLS, Resolved, AdminNote)
                VALUES (@UserId, @ReportedUserId, @DateOfCreation, @Type, @Offense, @Summary, @ImagesURLS, @Resolved, @AdminNote)
            `;

            const result = await request.query(insertQuery);

            if (result.rowsAffected[0] === 0) {
                return { success: false, message: 'Failed to create report' };
            }

            return { success: true, message: 'Report created successfully' };
        } catch (err) {
            console.error('fetchUserId error:', err);
            return { success: false, message: 'Database error during login' };
        }
    } catch(error) {
        console.log(error);
        return null;
    }
}