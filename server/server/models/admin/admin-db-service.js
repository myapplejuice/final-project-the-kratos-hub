import sql from 'mssql/msnodesqlv8.js';
import PasswordHasher from '../../utils/password-hasher.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';
import UserTrainerProfileDBService from '../user/user-trainer-profile/user-trainer-profile-db-service.js';

export default class AdminDBService {
    static async access(id, pass) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'AccessId', sql.NVarChar(20), id);

            const query = `
                    SELECT * From Admins
                    WHERE AccessId = @AccessId COLLATE SQL_Latin1_General_CP1_CS_AS
                    `;

            const result = await request.query(query);

            if (!result.recordset.length) {
                return { success: false, message: 'One or both credentials are incorrect!' };
            }

            const row = result.recordset[0];
            const isMatch = await PasswordHasher.comparePassword(pass, row.AccessPassword);
            if (!isMatch) {
                return { success: false, message: 'One or both credentials are incorrect!' }
            }

            const admin = {}
            for (const key in row) {
                if (key !== 'AccessPassword')
                    admin[ObjectMapper.toCamelCase(key)] = row[key];
            }

            return { success: true, message: 'Access granted!', admin };
        } catch (err) {
            console.error('fetchUserId error:', err);
            return { success: false, message: 'Database error during login' };
        }
    }

    static async fetchUsers() {
        try {
            const request = Database.getRequest();
            const query = `SELECT * FROM Users`;
            const result = await request.query(query);

            if (!result.recordset.length) return [];

            const users = await Promise.all(
                result.recordset.map(async row => {
                    const profile = ObjectMapper.mapUser(row);
                    profile.trainerProfile = await UserTrainerProfileDBService.fetchTrainerProfile(profile.id);
                    return profile;
                })
            );

            return users;
        } catch (err) {
            console.error('fetchUserProfile error:', err);
            return null;
        }
    }

    static async fetchAdmins() {
        try {
            const request = Database.getRequest();
            const query = `SELECT * FROM Admins`;
            const result = await request.query(query);

            if (!result.recordset.length) return [];

            const admins = result.recordset.map(row => {
                const admin = {};
                for (const key in row) {
                    if (key !== 'AccessPassword')
                        admin[ObjectMapper.toCamelCase(key)] = row[key];
                }
                return admin;
            });

            return admins;
        } catch (err) {
            console.error('fetchAdmins error:', err);
            return null;
        }
    }

    static async fetchUserReputationProfile(id) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, id);

            const query = `
            IF NOT EXISTS (SELECT 1 FROM UserReputationProfile WHERE UserId = @UserId)
            BEGIN
                INSERT INTO UserReputationProfile (UserId) VALUES (@UserId)
            END

            SELECT * FROM UserReputationProfile WHERE UserId = @UserId
        `;

            const result = await request.query(query);
            const row = result.recordset[0];

            const reputationProfile = {};
            for (const key in row) {
                reputationProfile[ObjectMapper.toCamelCase(key)] = row[key];
            }

            reputationProfile.warningsHistory = await AdminDBService.fetchUserWarningsHistory(id);
            return reputationProfile;
        } catch (err) {
            console.error('fetchUserReputationProfile error:', err);
            return null;
        }
    }

    static async setTerminated(id, IsTerminated) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.UniqueIdentifier, id);

            const query = `
            -- Update Users table
            UPDATE Users
            SET IsTerminated = ${IsTerminated ? 1 : 0}
            WHERE Id = @Id;

            -- Update UserReputationProfile
            UPDATE UserReputationProfile
            SET
                TerminationCount = TerminationCount + CASE WHEN ${IsTerminated ? 1 : 0} = 1 THEN 1 ELSE 0 END,
                ReinstatementCount = ReinstatementCount + CASE WHEN ${IsTerminated ? 1 : 0} = 0 THEN 1 ELSE 0 END,
                CurrentWarningCount = CASE WHEN ${IsTerminated ? 1 : 0} = 0 THEN 0 ELSE CurrentWarningCount END
            WHERE UserId = @Id;
        `;

            const result = await request.query(query);
            return { success: result.rowsAffected[0] > 0 };
        } catch (err) {
            console.error('setTerminated error:', err);
            return null;
        }
    }

    static async createUserWarning(id, adminId, summary) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, id);
            Database.addInput(request, 'AdminId', sql.UniqueIdentifier, adminId);
            Database.addInput(request, 'DateOfCreation', sql.DateTime2, new Date());
            Database.addInput(request, 'Summary', sql.NVarChar(sql.MAX), summary);

            const query = `
            -- Insert the warning and return the inserted row
            INSERT INTO AdminUserWarnings (UserId, AdminId, DateOfCreation, Summary)
            OUTPUT INSERTED.*
            VALUES (@UserId, @AdminId, @DateOfCreation, @Summary);

            -- Increment offense and current warning counts
            UPDATE UserReputationProfile
            SET 
                OffenseCount = OffenseCount + 1,
                CurrentWarningCount = CurrentWarningCount + 1
            WHERE UserId = @UserId;
        `;

            const result = await request.query(query);

            if (result.recordset?.length > 0) {
                const insertedWarning = result.recordset[0];
                const warning = {};
                for (const key in insertedWarning) {
                    warning[ObjectMapper.toCamelCase(key)] = insertedWarning[key];
                }

                return { success: true, warning };
            }

            return { success: false };
        } catch (err) {
            console.error('createUserWarning error:', err);
            return { success: false, error: err.message };
        }
    }

    static async fetchUserWarningsHistory(id) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, id);

            const query = `
            SELECT * FROM AdminUserWarnings
            WHERE UserId = @UserId
            ORDER BY DateOfCreation DESC, Id DESC
        `;


            const result = await request.query(query);
            if (!result.recordset.length) return [];

            const warningsHistory = result.recordset.map(row => {
                const mapped = {};
                for (const key in row) {
                    mapped[ObjectMapper.toCamelCase(key)] = row[key];
                }
                return mapped;
            });

            return warningsHistory;
        } catch (err) {
            console.error('fetchUserWarningsHistory error:', err);
            return null;
        }
    }

    static async fetchApplications() {
        try {
            const request = Database.getRequest();

            const query = `SELECT * FROM VerificationApplications`;
            const result = await request.query(query);

            if (!result.recordset.length) {
                return [];
            }

            const applications = result.recordset.map(row => {
                const obj = {};
                for (const key in row) {
                    let value = row[key];
                    if (key === 'Images' || key === 'Links') {
                        value = value ? JSON.parse(value) : [];
                    }
                    obj[ObjectMapper.toCamelCase(key)] = value;
                }
                return obj;
            });

            return applications;
        } catch (err) {
            console.error('fetchApplications error:', err);
            return null;
        }
    }

    static async updateApplicationStatus(userId, applicationId, status, adminReply) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, applicationId);
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'Status', sql.VarChar(20), status);
            Database.addInput(request, 'AdminReply', sql.NVarChar(500), adminReply);

            const updateQuery = `
                UPDATE VerificationApplications
                SET Status = @Status, AdminReply = @AdminReply
                WHERE Id = @Id AND UserId = @UserId
            `;

            const result = await request.query(updateQuery);

            if (!result.rowsAffected[0]) {
                return { success: false, message: 'Application not found or status not updated' };
            }

            if (status === 'approved') {
                const request = Database.getRequest();
                Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);
                const query = `UPDATE UserTrainerProfile SET IsVerified = 1, TrainerStatus = 'active' WHERE UserId = @UserId`;
                await request.query(query);
            }

            return { success: true, message: `Status updated to "${status}"`, applicationId };
        } catch (err) {
            console.error('updateApplicationStatus error:', err);
            return { success: false, message: 'Failed to update status' };
        }
    }

    static async insertNewAdmin(id, password, permissions) {
        try {
            const request = Database.getRequest();
            const hash = await PasswordHasher.hashPassword(password);
            Database.addInput(request, 'AccessId', sql.NVarChar(20), id);
            Database.addInput(request, 'AccessPassword', sql.NVarChar(512), hash);
            Database.addInput(request, 'Permissions', sql.NVarChar(sql.MAX), permissions);
            Database.addInput(request, 'DateOfCreation', sql.DateTime2, new Date());
            Database.addInput(request, 'IsActive', sql.Bit, true);
            Database.addInput(request, 'IsSeed', sql.Bit, false);

            const query = `
                INSERT INTO Admins (AccessId, AccessPassword, Permissions, DateOfCreation, IsActive, IsSeed)
                OUTPUT INSERTED.*
                VALUES (@AccessId, @AccessPassword, @Permissions, @DateOfCreation, @IsActive, @IsSeed)
            `;

            const result = await request.query(query);
            const admin = {}

            for (const key in result.recordset[0]) {
                admin[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }
            return { success: true, message: 'Admin created successfully', admin };

        } catch (err) {
            console.error('insertNewAdmin error:', err);
            return { success: false, message: 'Failed to create admin' };
        }
    }

    static async updateAdmin(id, accessId, accessPassword, permissions) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.UniqueIdentifier, id);
            Database.addInput(request, 'AccessId', sql.NVarChar(20), accessId);
            Database.addInput(request, 'Permissions', sql.NVarChar(sql.MAX), permissions);

            let query;
            if (accessPassword) {
                const hash = await PasswordHasher.hashPassword(accessPassword);
                Database.addInput(request, 'AccessPassword', sql.NVarChar(512), hash);
                query = `
                   UPDATE Admins
                   SET AccessId = @AccessId, AccessPassword = @AccessPassword, Permissions = @Permissions
                   OUTPUT INSERTED.*
                   WHERE Id = @Id
               `;
            } else {
                query = `
                    UPDATE Admins
                    SET AccessId = @AccessId, Permissions = @Permissions
                   OUTPUT INSERTED.*
                    WHERE Id = @Id
                `;
            }

            const result = await request.query(query);

            if (!result.recordset.length) {
                return { success: false, message: 'Admin not found' };
            }

            const admin = {}

            for (const key in result.recordset[0]) {
                admin[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            return { success: true, message: 'Admin updated successfully', admin };
        } catch (err) {
            console.error('updateAdmin error:', err);
            return { success: false, message: 'Failed to update admin' };
        }
    }
}
