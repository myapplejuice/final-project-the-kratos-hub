import sql from 'mssql/msnodesqlv8.js';
import Database from '../../database/database.js';
import ObjectMapper from '../../../utils/object-mapper.js';

export default class NutritionFoodsDBService {
    static async

    static async fetchCommunityFoods(userId) {
        if (!userId) return [];

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'CreatorId', sql.UniqueIdentifier, userId);

            const query = `
            SELECT *
            FROM dbo.UserFoods
            WHERE CreatorId != @CreatorId AND IsPublic = 1
            ORDER BY Id DESC;`;

            const result = await request.query(query);
            if (!result.recordset || result.recordset.length === 0) return [];

            return result.recordset.map(row => {
                const food = {};
                for (const key in row) {
                    food[ObjectMapper.toCamelCase(key)] = row[key];
                }

                if (food.additionalProps) {
                    try {
                        food.additionalProps = JSON.parse(food.additionalProps);
                    } catch { }
                }

                return food;
            });
        } catch (err) {
            console.error('fetchCommunityFoods error:', err);
            return [];
        }
    }

    static async fetchFoods(userId) {
        if (!userId) return [];

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'CreatorId', sql.UniqueIdentifier, userId);

            const query = `
            SELECT *
            FROM dbo.UserFoods
            WHERE CreatorId = @CreatorId
            ORDER BY Id DESC;`;

            const result = await request.query(query);
            if (!result.recordset || result.recordset.length === 0) return [];

            return result.recordset.map(row => {
                const food = {};
                for (const key in row) {
                    food[ObjectMapper.toCamelCase(key)] = row[key];
                }

                if (food.additionalProps) {
                    try {
                        food.additionalProps = JSON.parse(food.additionalProps);
                    } catch { }
                }

                return food;
            });
        } catch (err) {
            console.error('fetchFoods error:', err);
            return [];
        }
    }

    static async createFood(userId, payload) {
        if (!userId || !payload) return null;

        const {
            label, type, servingUnit, servingSize,
            energyKcal, carbs, protein, fat,
            dominantMacro, creatorName, isPublic, additionalProps
        } = payload;

        try {
            const request = Database.getRequest();

            Database.addInput(request, 'CreatorId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'CreatorName', sql.VarChar(100), creatorName);
            Database.addInput(request, 'IsPublic', sql.Bit, isPublic ? 1 : 0);

            Database.addInput(request, 'Label', sql.VarChar(50), label);
            Database.addInput(request, 'Type', sql.VarChar(50), type);
            Database.addInput(request, 'ServingUnit', sql.VarChar(20), servingUnit);
            Database.addInput(request, 'ServingSize', sql.Decimal(7, 2), servingSize);

            Database.addInput(request, 'EnergyKcal', sql.Decimal(7, 2), energyKcal);
            Database.addInput(request, 'Carbs', sql.Decimal(7, 2), carbs);
            Database.addInput(request, 'Protein', sql.Decimal(7, 2), protein);
            Database.addInput(request, 'Fat', sql.Decimal(7, 2), fat);
            Database.addInput(request, 'DominantMacro', sql.VarChar(20), dominantMacro);

            Database.addInput(request, 'AdditionalProps', sql.NVarChar(sql.MAX), JSON.stringify(additionalProps));

            const query = `
                INSERT INTO dbo.UserFoods
                (CreatorId, CreatorName, IsPublic, Label, Type, ServingUnit, ServingSize,
                 EnergyKcal, Carbs, Protein, Fat, DominantMacro, AdditionalProps)
                OUTPUT INSERTED.*
                VALUES
                (@CreatorId, @CreatorName, @IsPublic, @Label, @Type, @ServingUnit, @ServingSize,
                 @EnergyKcal, @Carbs, @Protein, @Fat, @DominantMacro, @AdditionalProps);
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const food = {};
            for (const key in result.recordset[0]) {
                food[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            if (food.additionalProps) {
                try {
                    food.additionalProps = JSON.parse(food.additionalProps);
                } catch { }
            }

            return food;
        } catch (err) {
            console.error('createFood error:', err);
            return null;
        }
    }

    static async updateFood(payload) {
        if (!payload) return null;

        const {
            id, creatorId, creatorName, label, type, servingUnit, servingSize,
            energyKcal, carbs, protein, fat,
            dominantMacro, isPublic, additionalProps
        } = payload;

        try {
            const request = Database.getRequest();

            Database.addInput(request, 'Id', sql.Int, id);

            Database.addInput(request, 'CreatorId', sql.VarChar(100), creatorId);
            Database.addInput(request, 'CreatorName', sql.VarChar(100), creatorName);
            Database.addInput(request, 'IsPublic', sql.Bit, isPublic ? 1 : 0);

            Database.addInput(request, 'Label', sql.VarChar(50), label);
            Database.addInput(request, 'Type', sql.VarChar(50), type);
            Database.addInput(request, 'ServingUnit', sql.VarChar(20), servingUnit);
            Database.addInput(request, 'ServingSize', sql.Decimal(7, 2), servingSize);

            Database.addInput(request, 'EnergyKcal', sql.Decimal(7, 2), energyKcal);
            Database.addInput(request, 'Carbs', sql.Decimal(7, 2), carbs);
            Database.addInput(request, 'Protein', sql.Decimal(7, 2), protein);
            Database.addInput(request, 'Fat', sql.Decimal(7, 2), fat);
            Database.addInput(request, 'DominantMacro', sql.VarChar(20), dominantMacro);

            Database.addInput(request, 'AdditionalProps', sql.NVarChar(sql.MAX), JSON.stringify(additionalProps));

            const query = `
                UPDATE dbo.UserFoods
                SET CreatorName = @CreatorName,
                    IsPublic = @IsPublic,
                    Label = @Label,
                    Type = @Type,
                    ServingUnit = @ServingUnit,
                    ServingSize = @ServingSize,
                    EnergyKcal = @EnergyKcal,
                    Carbs = @Carbs,
                    Protein = @Protein,
                    Fat = @Fat,
                    DominantMacro = @DominantMacro,
                    AdditionalProps = @AdditionalProps
                OUTPUT INSERTED.*
                WHERE Id = @Id;
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const food = {};
            for (const key in result.recordset[0]) {
                food[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            if (food.additionalProps) {
                try {
                    food.additionalProps = JSON.parse(food.additionalProps);
                } catch { }
            }

            return food;
        } catch (err) {
            console.error('updateFood error:', err);
            return null;
        }
    }

    static async deleteFood(foodId) {
        if (!foodId) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, foodId);

            const query = `
                DELETE FROM dbo.UserFoods
                WHERE Id = @Id;
            `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;

        } catch (err) {
            console.error('deleteFood error:', err);
            return false;
        }
    }
}