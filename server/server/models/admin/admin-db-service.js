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
                    WHERE AccessId = @AccessId
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

    static async fetchUserReputationProfile(id) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, id);

            const query = `SELECT * FROM UserReputationProfile WHERE UserId = @UserId`;
            let result = await request.query(query);

            if (!result.recordset.length) {
                const insertQuery = `
                INSERT INTO UserReputationProfile (UserId)
                VALUES (@UserId);
            `;
                await request.query(insertQuery);

                result = await request.query(query);
            }

            const row = result.recordset[0];
            const reputationProfile = {};
            for (const key in row) {
                reputationProfile[ObjectMapper.toCamelCase(key)] = row[key];
            }

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
            UPDATE Users
            SET IsTerminated = ${IsTerminated ? 1 : 0}
            WHERE Id = @Id;

            UPDATE UserReputationProfile
            SET
                TerminationCount = TerminationCount + CASE WHEN ${IsTerminated ? 1 : 0} = 1 THEN 1 ELSE 0 END,
                ReinstatementCount = ReinstatementCount + CASE WHEN ${IsTerminated ? 1 : 0} = 0 THEN 1 ELSE 0 END
            WHERE UserId = @Id;
        `;

            const result = await request.query(query);
            return { success: result.rowsAffected[0] > 0 };
        } catch (err) {
            console.error('setTerminated error:', err);
            return null;
        }
    }
}
