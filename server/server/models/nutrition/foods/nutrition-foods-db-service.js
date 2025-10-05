import sql from 'mssql/msnodesqlv8.js';
import Database from '../../database/database.js';
import ObjectMapper from '../../../utils/object-mapper.js';

export default class NutritionFoodsDBService {

    static async fetchCommunityFoods(userId) {
        if (!userId) return [];

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'UserId', sql.UniqueIdentifier, userId);

            const query = `
            SELECT *
            FROM dbo.Foods
            WHERE OwnerId != @UserId AND CreatorId != @UserId AND IsPublic = 1 AND IsUSDA = 0
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
            Database.addInput(request, 'OwnerId', sql.UniqueIdentifier, userId);

            const query = `
            SELECT *
            FROM dbo.Foods
            WHERE OwnerId = @OwnerId
            ORDER BY Id ASC;`;

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

    static async createFood(userId, food) {
        if (!userId || !food) return null;

        try {
            const request = Database.getRequest();

            Database.addInput(request, 'OwnerId', sql.UniqueIdentifier, userId);
            Database.addInput(request, 'CreatorId', sql.UniqueIdentifier, food.creatorId);
            Database.addInput(request, 'CreatorName', sql.VarChar(100), food.creatorName);
            Database.addInput(request, 'IsUSDA', sql.VarChar(100), food.isUSDA ? 1 : 0);
            Database.addInput(request, 'USDAId', sql.VarChar(100), food.USDAId ?? -1);
            Database.addInput(request, 'IsPublic', sql.Bit, food.isPublic ? 1 : 0);

            Database.addInput(request, 'Label', sql.VarChar(50), food.label);
            Database.addInput(request, 'Category', sql.VarChar(50), food.category);
            Database.addInput(request, 'ServingUnit', sql.VarChar(20), food.servingUnit);
            Database.addInput(request, 'ServingSize', sql.Decimal(7, 2), food.servingSize);

            Database.addInput(request, 'EnergyKcal', sql.Decimal(7, 2), food.energyKcal);
            Database.addInput(request, 'Carbs', sql.Decimal(7, 2), food.carbs);
            Database.addInput(request, 'Protein', sql.Decimal(7, 2), food.protein);
            Database.addInput(request, 'Fat', sql.Decimal(7, 2), food.fat);
            Database.addInput(request, 'DominantMacro', sql.VarChar(20), food.dominantMacro);

            Database.addInput(request, 'AdditionalProps', sql.NVarChar(sql.MAX), JSON.stringify(food.additionalProps || []));

            const query = `
                INSERT INTO dbo.Foods
                (OwnerId, CreatorId, CreatorName, IsUSDA, USDAId, IsPublic, Label, Category, ServingUnit, ServingSize,
                 EnergyKcal, Carbs, Protein, Fat, DominantMacro, AdditionalProps)
                OUTPUT INSERTED.*
                VALUES
                (@OwnerId, @CreatorId, @CreatorName, @IsUSDA, @USDAId, @IsPublic, @Label, @Category, @ServingUnit, @ServingSize,
                 @EnergyKcal, @Carbs, @Protein, @Fat, @DominantMacro, @AdditionalProps);
            `;

            const result = await request.query(query);
            if (!result.recordset[0]) return null;

            const newFood = {};
            for (const key in result.recordset[0]) {
                newFood[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            if (newFood.additionalProps) {
                try {
                    newFood.additionalProps = JSON.parse(newFood.additionalProps);
                } catch { }
            }

            return newFood;
        } catch (err) {
            console.error('createFood error:', err);
            return null;
        }
    }

    static async updateFood(food) {
        if (!food) return null;

        try {
            const request = Database.getRequest();

            Database.addInput(request, 'Id', sql.Int, food.id);
            Database.addInput(request, 'IsPublic', sql.Bit, food.isPublic ? 1 : 0);

            Database.addInput(request, 'Label', sql.VarChar(50), food.label);
            Database.addInput(request, 'Category', sql.VarChar(50), food.category);
            Database.addInput(request, 'ServingUnit', sql.VarChar(20), food.servingUnit);
            Database.addInput(request, 'ServingSize', sql.Decimal(7, 2), food.servingSize);

            Database.addInput(request, 'EnergyKcal', sql.Decimal(7, 2), food.energyKcal);
            Database.addInput(request, 'Carbs', sql.Decimal(7, 2), food.carbs);
            Database.addInput(request, 'Protein', sql.Decimal(7, 2), food.protein);
            Database.addInput(request, 'Fat', sql.Decimal(7, 2), food.fat);
            Database.addInput(request, 'DominantMacro', sql.VarChar(20), food.dominantMacro);

            Database.addInput(request, 'AdditionalProps', sql.NVarChar(sql.MAX), JSON.stringify(food.additionalProps || []));

            const query = `
                UPDATE dbo.Foods
                SET IsPublic = @IsPublic,
                    Label = @Label,
                    Category = @Category,
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

            const updatedFood = {};
            for (const key in result.recordset[0]) {
                updatedFood[ObjectMapper.toCamelCase(key)] = result.recordset[0][key];
            }

            if (updatedFood.additionalProps) {
                try {
                    updatedFood.additionalProps = JSON.parse(updatedFood.additionalProps);
                } catch { }
            }

            return updatedFood;
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
                DELETE FROM dbo.Foods
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