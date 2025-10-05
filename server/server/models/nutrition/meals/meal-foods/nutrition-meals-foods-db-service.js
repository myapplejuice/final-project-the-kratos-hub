import sql from 'mssql/msnodesqlv8.js';
import Database from '../../../database/database.js';
import ObjectMapper from '../../../../utils/object-mapper.js';

export default class NutritionMealsFoodsDBService {
    static async addFood(food) {
        if (!food) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'MealLogId', sql.Int, food.mealId);
            Database.addInput(request, 'OwnerId', sql.UniqueIdentifier, food.ownerId || '00000000-0000-0000-0000-000000000000');
            Database.addInput(request, 'CreatorId', sql.UniqueIdentifier, food.creatorId || '00000000-0000-0000-0000-000000000000');
            Database.addInput(request, 'CreatorName', sql.VarChar(100), food.creatorName || 'Unknown');
            Database.addInput(request, 'USDAId', sql.Int, food.USDAId ?? -1);
            Database.addInput(request, 'IsPublic', sql.Bit, food.isPublic ?? 0);
            Database.addInput(request, 'IsUSDA', sql.Bit, food.isUSDA ?? 0);
            Database.addInput(request, 'Label', sql.VarChar(50), food.label);
            Database.addInput(request, 'Category', sql.VarChar(50), food.category);

            Database.addInput(request, 'ServingUnit', sql.VarChar(20), food.servingUnit);
            Database.addInput(request, 'OriginalServingSize', sql.Decimal(7, 2), food.originalServingSize);
            Database.addInput(request, 'ServingSize', sql.Decimal(7, 2), food.servingSize);
            Database.addInput(request, 'OriginalEnergyKcal', sql.Decimal(7, 2), food.originalEnergyKcal);
            Database.addInput(request, 'EnergyKcal', sql.Decimal(7, 2), food.energyKcal);
            Database.addInput(request, 'OriginalCarbs', sql.Decimal(7, 2), food.originalCarbs);
            Database.addInput(request, 'Carbs', sql.Decimal(7, 2), food.carbs);
            Database.addInput(request, 'OriginalProtein', sql.Decimal(7, 2), food.originalProtein);
            Database.addInput(request, 'Protein', sql.Decimal(7, 2), food.protein);
            Database.addInput(request, 'OriginalFat', sql.Decimal(7, 2), food.originalFat);
            Database.addInput(request, 'Fat', sql.Decimal(7, 2), food.fat);
            Database.addInput(request, 'DominantMacro', sql.VarChar(20), food.dominantMacro);
            Database.addInput(request, 'AdditionalProps', sql.NVarChar(sql.MAX), food.additionalProps ? JSON.stringify(food.additionalProps) : []);

            const query = `
                INSERT INTO dbo.MealLogsFoods (
                    MealLogId, OwnerId, CreatorId, CreatorName, USDAId, IsPublic, IsUSDA, Label, Category,
                    ServingUnit, OriginalServingSize, ServingSize,  OriginalEnergyKcal, EnergyKcal, OriginalCarbs, Carbs, OriginalProtein, Protein, OriginalFat, Fat, DominantMacro, AdditionalProps
                )
                OUTPUT INSERTED.Id
                VALUES (
                    @MealLogId, @OwnerId, @CreatorId, @CreatorName, @USDAId, @IsPublic, @IsUSDA, @Label, @Category,
                    @ServingUnit, @OriginalServingSize, @ServingSize, @OriginalEnergyKcal, @EnergyKcal, @OriginalCarbs, @Carbs, @OriginalProtein, @Protein, @OriginalFat, @Fat, @DominantMacro, @AdditionalProps
                );
            `;

            const affectedRows = await request.query(query);

            if (affectedRows.rowsAffected[0] === 0) return false;
            const id = affectedRows.recordset[0].Id;

            return id;
        } catch (err) {
            console.error('addFood error:', err);
            return false;
        }
    }

    // Deletes a food from a meal
    static async deleteFood(mealId, foodId) {
        if (!mealId || !foodId) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'MealLogId', sql.Int, mealId);
            Database.addInput(request, 'Id', sql.Int, foodId);

            const query = `
                DELETE FROM MealLogsFoods
                WHERE MealLogId = @MealLogId AND Id = @Id
            `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('deleteFood error:', err);
            return false;
        }
    }

    // Updates a food in a meal
    static async updateFood(food) {
        if (!food || !food.id || !food.mealId) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, food.id);
            Database.addInput(request, 'MealLogId', sql.Int, food.mealId);
            Database.addInput(request, 'ServingSize', sql.Decimal(7, 2), food.servingSize ?? 0);
            Database.addInput(request, 'EnergyKcal', sql.Decimal(7, 2), food.energyKcal ?? 0);
            Database.addInput(request, 'Carbs', sql.Decimal(7, 2), food.carbs ?? 0);
            Database.addInput(request, 'Protein', sql.Decimal(7, 2), food.protein ?? 0);
            Database.addInput(request, 'Fat', sql.Decimal(7, 2), food.fat ?? 0);
            Database.addInput(request, 'AdditionalProps', sql.NVarChar(sql.MAX), food.additionalProps ? JSON.stringify(food.additionalProps) : []);

            const query = `
                UPDATE MealLogsFoods
                SET ServingSize = @ServingSize,
                    EnergyKcal = @EnergyKcal,
                    Carbs = @Carbs,
                    Protein = @Protein,
                    Fat = @Fat,
                    AdditionalProps = @AdditionalProps
                WHERE MealLogId = @MealLogId AND Id = @Id
            `;

            const result = await request.query(query);
            if (result.rowsAffected[0] === 0) return false;

            return food.id;
        } catch (err) {
            console.error('updateFood error:', err);
            return false;
        }
    }

    // Fetch all foods for a given meal
    static async fetchFoodsByMealId(mealId) {
        try {
            const request = Database.getRequest();
            Database.addInput(request, 'MealId', sql.Int, mealId);

            const query = `SELECT * FROM MealLogsFoods WHERE MealLogId = @MealId`;
            const result = await request.query(query);

            return result.recordset.map(food => {
                const obj = {};
                for (const key in food) {
                    if (key === 'AdditionalProps')
                        obj[ObjectMapper.toCamelCase(key)] = JSON.parse(food[key]);
                    else
                        obj[ObjectMapper.toCamelCase(key)] = food[key];
                }
                return obj;
            });
        } catch (err) {
            console.error('fetchFoodsByMealId error:', err);
            return [];
        }
    }

}
