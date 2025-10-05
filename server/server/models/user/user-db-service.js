import sql from 'mssql/msnodesqlv8.js';
import UserEncryption from "../../utils/password-hasher.js";
import HistoryDBService from '../history/history-db-service.js';
import Database from '../database/database.js';
import ObjectMapper from '../../utils/object-mapper.js';

export default class UserDBService {
    static async insertUser(user) {
        try {
            const result = await Database.runTransaction(async (transaction) => {
                const duplicatesRequest = Database.getRequest(transaction);
                Database.addInput(duplicatesRequest, "Email", sql.VarChar(50), user.email);
                Database.addInput(duplicatesRequest, "Phone", sql.VarChar(50), user.phone);

                const dupCheck = await duplicatesRequest.query(`
                SELECT Email, Phone FROM Users
                WHERE Email = @Email OR Phone = @Phone
            `);

                if (dupCheck.recordset.length > 0) {
                    const existing = dupCheck.recordset[0];
                    let message = "";
                    if (existing.Email === user.email) message += "Email already exists!\n";
                    if (existing.Phone === user.phone) message += "Phone number already exists!";
                    return { success: false, message: message.trim() };
                }

                const profileRequest = Database.getRequest(transaction);
                const { metrics, nutrition, ...profile } = user;

                Database.addInput(profileRequest, "Firstname", sql.VarChar(50), user.firstname);
                Database.addInput(profileRequest, "Lastname", sql.VarChar(50), user.lastname);
                Database.addInput(profileRequest, "Age", sql.Int, user.age);
                Database.addInput(profileRequest, "Gender", sql.VarChar(20), user.gender);
                Database.addInput(profileRequest, "Email", sql.VarChar(50), user.email);
                Database.addInput(profileRequest, "Phone", sql.VarChar(50), user.phone);
                const hashedPassword = await UserEncryption.hashPassword(user.password);
                Database.addInput(profileRequest, "Password", sql.VarChar(512), hashedPassword);
                Database.addInput(profileRequest, "ImageBase64", sql.VarChar(sql.MAX), user.imageBase64 || null);
                Database.addInput(profileRequest, "DateOfCreation", sql.DateTime2, new Date());

                const userResult = await profileRequest.query(`
                       INSERT INTO Users
                       (Firstname, Lastname, Age, Gender, Email, Phone, Password, ImageBase64, DateOfCreation)
                       OUTPUT INSERTED.Id
                       VALUES
                       (@Firstname, @Lastname, @Age, @Gender, @Email, @Phone, @Password, @ImageBase64, @DateOfCreation)
                   `);

                if (userResult.rowsAffected[0] === 0)
                    throw new Error("Failed to insert user");
                const newId = userResult.recordset[0].Id;

                // Handling Metrics 
                const metricsRequest = Database.getRequest(transaction);

                Database.addInput(metricsRequest, "UserId", ObjectMapper.getSQLType("UserId"), newId);
                for (const key in metrics) {
                    const pascalKey = ObjectMapper.toPascalCase(key);
                    const sqlType = ObjectMapper.getSQLType(pascalKey);
                    console.log(sqlType)
                    Database.addInput(metricsRequest, pascalKey, sqlType, metrics[key]);
                }
                const metricsResult = await metricsRequest.query(`
                INSERT INTO UserMetrics
                (UserId, HeightCm, WeightKg, BMI, BMR, TDEE, BodyFat, LeanBodyMass, ActivityLevel)
                VALUES
                (@UserId, @HeightCm, @WeightKg, @BMI, @BMR, @TDEE, @BodyFat, @LeanBodyMass, @ActivityLevel)`);
                if (metricsResult.rowsAffected[0] === 0) throw new Error("Failed to insert metrics");

                // ---- UserNutrition ----
                const nutritionRequest = Database.getRequest(transaction);

                Database.addInput(nutritionRequest, "UserId", ObjectMapper.getSQLType("UserId"), newId);

                for (const key in nutrition) {
                    const pascalKey = ObjectMapper.toPascalCase(key);
                    const sqlType = ObjectMapper.getSQLType(pascalKey);
                    Database.addInput(nutritionRequest, pascalKey, sqlType, nutrition[key]);
                }

                const nutritionResult = await nutritionRequest.query(`
                INSERT INTO UserNutrition
                (UserId, Goal, RecommendedEnergyKcal, SetEnergyKcal, WaterMl, Diet, CarbRate, ProteinRate, ProteinRequirement, FatRate, CarbGrams, ProteinGrams, FatGrams)
                VALUES
                (@UserId, @Goal, @RecommendedEnergyKcal, @SetEnergyKcal, @WaterMl, @Diet, @CarbRate, @ProteinRate, @ProteinRequirement, @FatRate, @CarbGrams, @ProteinGrams, @FatGrams)`);
                if (nutritionResult.rowsAffected[0] === 0) throw new Error("Failed to insert nutrition");

                // Handling History
                await HistoryDBService.insertProfileHistory(transaction, newId, user, "all");
                await HistoryDBService.insertMetricsHistory(transaction, newId, metrics, "all");
                await HistoryDBService.insertNutritionHistory(transaction, newId, nutrition, "all");

                return { success: true, id: newId };
            });

            return result;
        } catch (err) {
            console.error("InsertUser transaction error:", err);
            return { success: false, message: "Database error during insert" };
        }
    }

    static async fetchUserId({ email, password }) {
        try {
            const request = Database.getRequest();
            const key = 'Email';
            const sqlType = ObjectMapper.getSQLType(key);
            Database.addInput(request, key, sqlType, email);

            const query = `
                      SELECT Id, Password
                      FROM Users
                      WHERE Email COLLATE Latin1_General_CS_AS = @Email
                      `;

            const result = await request.query(query);

            if (!result.recordset.length) {
                return { success: false, message: 'One or both credentials are incorrect!' };
            }

            const userRow = result.recordset[0];
            const passwordMatches = await UserEncryption.comparePassword(password, userRow.Password);

            if (!passwordMatches)
                return { success: false, message: 'Invalid password!' };

            return { success: true, id: userRow.Id };
        } catch (err) {
            console.error('fetchUserId error:', err);
            return { success: false, message: 'Database error during login' };
        }
    }

    static async fetchUserProfile(id) {
        try {
            const request = Database.getRequest();
            const key = 'Id';
            const sqlType = ObjectMapper.getSQLType(key);
            Database.addInput(request, key, sqlType, id);

            const query = `
                SELECT u.*, m.*, n.*
                FROM Users u
                LEFT JOIN UserMetrics m ON u.Id = m.UserId
                LEFT JOIN UserNutrition n ON u.Id = n.UserId
                WHERE u.Id = @Id
            `;

            const result = await request.query(query);
            if (!result.recordset.length) return null;

            const row = result.recordset[0];
            return {
                ...ObjectMapper.mapUser(row),
                metrics: ObjectMapper.mapMetrics(row),
                nutrition: ObjectMapper.mapNutrition(row)
            };
        } catch (err) {
            console.error('fetchUserProfile error:', err);
            return null;
        }
    }

    static async checkEmailExistence(email) {
        try {
            const request = Database.getRequest();
            const key = 'Email';
            const sqlType = ObjectMapper.getSQLType(key);
            Database.addInput(request, key, sqlType, email);

            const query = `
                SELECT COUNT(1) AS Count FROM Users
                WHERE Email COLLATE Latin1_General_CS_AS = @Email
            `;
            const result = await request.query(query);

            return result.recordset[0].Count > 0;
        } catch (err) {
            console.error('checkEmailExistence error:', err);
            return false;
        }
    }

    static async updatePasswordByEmail(email, password) {
        try {
            const request = Database.getRequest();
            const hashedPassword = await UserEncryption.hashPassword(password);

            const passKey = 'Password';
            const emailKey = 'Email';
            const passSqlType = ObjectMapper.getSQLType(passKey);
            const emailSqlType = ObjectMapper.getSQLType(emailKey);
            Database.addInput(request, passKey, passSqlType, hashedPassword);
            Database.addInput(request, emailKey, emailSqlType, email);

            const query = `
                UPDATE Users SET Password = @Password
                WHERE Email COLLATE Latin1_General_CS_AS = @Email
            `;
            await request.query(query);
            return true;
        } catch (err) {
            console.error('updatePasswordByEmail error:', err);
            return false;
        }
    }

    static async destroyAccount(id, password) {
        return Database.runTransaction(async transaction => {
            const request = Database.getRequest(transaction);
            const key = 'Id';
            const sqlType = ObjectMapper.getSQLType(key);
            Database.addInput(request, key, sqlType, id);

            const userResult = await request.query('SELECT Password FROM Users WHERE Id = @Id');
            if (!userResult.recordset.length) throw new Error('User not found!');

            const hashedPassword = userResult.recordset[0].Password;
            if (!(await UserEncryption.comparePassword(password, hashedPassword))) throw new Error('Incorrect password!');

            await request.query('DELETE FROM Users WHERE Id = @Id');
            return { success: true, message: 'Account deleted successfully!' };
        }).catch(err => {
            console.error('destroyAccount error:', err);
            return { success: false, message: err.message || 'Database error during deletion' };
        });
    }

    static async updateUser(id, payload) {
        try {
            const result = await Database.runTransaction(async (transaction) => {
                const results = [];
                const { profile, metrics, nutrition } = payload;
                const currentUserProfile = await UserDBService.fetchUserProfile(id);

                if (profile) {
                    if (profile.password) {
                        results.push(await UserDBService.updatePassword(id, profile.currentPassword, profile.password, transaction));
                        delete profile.password;
                        delete profile.currentPassword;
                    }

                    if (Object.keys(profile).length > 0) {
                        results.push(await UserDBService.updateProfile(id, profile, transaction, currentUserProfile));
                    }
                }
                if (metrics) {
                    results.push(await UserDBService.updateMetrics(id, metrics, transaction, currentUserProfile.metrics));
                }
                if (nutrition) {
                    results.push(await UserDBService.updateNutrition(id, nutrition, transaction, currentUserProfile.nutrition));
                }

                const failures = results.filter(result => !result.success).map(result => result.message);
                if (failures.length > 0) {
                    throw new Error(failures.join('\n'));
                }

                return { success: true, message: 'User updated successfully!' };
            });

            return result;
        } catch (err) {
            console.error('updateUser transaction error:', err);
            return { success: false, message: err.message || 'Database transaction failed!' };
        }
    }

    static async updatePassword(id, currentPassword, newPassword, transaction) {
        try {
            if (!currentPassword || !newPassword) {
                return { success: false, message: 'Both current and new password are required!' };
            }
            const idKey = 'Id';
            const idSqlType = ObjectMapper.getSQLType(idKey);
            const passKey = 'Password';
            const passSqlType = ObjectMapper.getSQLType(passKey);


            const passRequest = Database.getRequest(transaction);
            Database.addInput(passRequest, idKey, idSqlType, id);
            const row = await passRequest.query('SELECT Password FROM Users WHERE Id = @Id');
            const currentPass = row.recordset[0].Password;
            const isMatch = await UserEncryption.comparePassword(currentPassword, currentPass);

            if (!isMatch) {
                return { success: false, message: 'Current password is incorrect!' };
            }

            // Encrypt and update
            const hashedPassword = await UserEncryption.hashPassword(newPassword);
            const updateRequest = Database.getRequest(transaction);
            Database.addInput(updateRequest, idKey, idSqlType, id);
            Database.addInput(updateRequest, passKey, passSqlType, hashedPassword);

            await updateRequest.query('UPDATE Users SET Password = @Password WHERE Id = @Id');

            return { success: true };
        } catch (err) {
            console.error('updatePassword error:', err);
            return { success: false, message: 'Error updating password' };
        }
    }

    static async updateProfile(id, profile, transaction, current) {
        try {
            const updates = [];
            const request = Database.getRequest(transaction);

            if (!current) {
                const fetchReq = Database.getRequest(transaction);
                const key = 'Id';
                const sqlType = ObjectMapper.getSQLType(key);
                Database.addInput(fetchReq, key, sqlType, id);
                const res = await fetchReq.query('SELECT * FROM Users WHERE Id = @Id');
                current = res.recordset[0] || {};
            }

            const changedData = {};
            const changedFields = [];

            for (const key in profile) {
                if (key === 'password' || key === 'currentPassword') continue;

                const pascalKey = ObjectMapper.toPascalCase(key);
                const sqlType = ObjectMapper.getSQLType(pascalKey);

                if (profile[key] !== current[pascalKey]) {
                    updates.push(`${pascalKey} = @${pascalKey}`);

                    Database.addInput(request, pascalKey, sqlType, profile[key]);

                    if (key !== 'imageBase64') {
                        changedData[key] = profile[key];
                        changedFields.push(key);
                    }
                }
            }

            if (updates.length === 0) return { success: true };

            const query = `UPDATE Users SET ${updates.join(', ')} WHERE Id = @UserId`;
            const key = 'UserId';
            const sqlType = ObjectMapper.getSQLType(key);
            Database.addInput(request, key, sqlType, id);
            await request.query(query);

            if (Object.keys(changedData).length > 0 && changedFields.length > 0) {
                await HistoryDBService.insertProfileHistory(transaction, id, changedData, changedFields.join(','));
            }

            return { success: true };
        } catch (err) {
            console.log('catches here ')
            console.error('updateProfile error:', err);
            return { success: false, message: 'Error updating profile' };
        }
    }

    static async updateMetrics(id, metrics, transaction, current) {
        try {
            const updates = [];
            const request = Database.getRequest(transaction);

            if (!current) {
                const fetchReq = Database.getRequest(transaction);
                Database.addInput(fetchReq, 'UserId', sql.UniqueIdentifier, id);
                const res = await fetchReq.query('SELECT * FROM UserMetrics WHERE UserId = @UserId');
                current = res.recordset[0] || {};
            }

            const changedData = {};
            const changedFields = [];

            for (const key in metrics) {
                const pascalKey = ObjectMapper.toPascalCase(key);
                const sqlType = ObjectMapper.getSQLType(pascalKey);

                if (metrics[key] != null && metrics[key] !== current[key]) {
                    updates.push(`${pascalKey} = @${pascalKey}`);
                    Database.addInput(request, pascalKey, sqlType, metrics[key]);
                    changedData[key] = metrics[key];
                    changedFields.push(key);
                }
            }
            if (updates.length === 0) return { success: true };

            const query = `UPDATE UserMetrics SET ${updates.join(', ')} WHERE UserId = @UserId`;
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, id);
            await request.query(query);

            await HistoryDBService.insertMetricsHistory(transaction, id, changedData, changedFields.join(','));
            return { success: true };
        } catch (err) {
            console.error('updateMetrics error:', err);
            return { success: false, message: 'Error updating metrics' };
        }
    }

    static async updateNutrition(id, nutrition, transaction, current) {
        try {
            const updates = [];
            const request = Database.getRequest(transaction);

            if (!current) {
                const fetchReq = Database.getRequest(transaction);
                Database.addInput(fetchReq, 'UserId', sql.UniqueIdentifier, id);
                const res = await fetchReq.query('SELECT * FROM UserNutrition WHERE UserId = @UserId');
                current = res.recordset[0] || {};
            }

            const changedData = {};
            const changedFields = [];

            for (const key in nutrition) {
                const pascalKey = ObjectMapper.toPascalCase(key);
                const sqlType = ObjectMapper.getSQLType(pascalKey);

                if (nutrition[key] != null && nutrition[key] !== current[key]) {
                    updates.push(`${pascalKey} = @${pascalKey}`);
                    Database.addInput(request, pascalKey, sqlType, nutrition[key]);
                    changedData[key] = nutrition[key];
                    changedFields.push(key);
                }
            }

            if (updates.length === 0) return { success: true };

            const query = `UPDATE UserNutrition SET ${updates.join(', ')} WHERE UserId = @UserId`;
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, id);
            await request.query(query);

            await HistoryDBService.insertNutritionHistory(transaction, id, changedData, changedFields.join(','));
            return { success: true };
        } catch (err) {
            console.error('updateNutrition error:', err);
            return { success: false, message: 'Error updating nutrition' };
        }
    }
}