import sql from 'mssql/msnodesqlv8.js';
import PasswordHasher from '../../utils/password-hasher.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

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

            return result.recordset.map(row => ObjectMapper.mapUser(row));
        } catch (err) {
            console.error('fetchUserProfile error:', err);
            return null;
        }
    }
}
