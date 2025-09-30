import sql from 'mssql/msnodesqlv8.js';
import Database from '../../database/database.js';
import ObjectMapper from '../../../utils/object-mapper.js';

export default class NutritionMealFoodsDBService {
    // Adds a food to a meal
    static async addFood(food) {
        if (!food) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'MealLogId', sql.Int, food.mealId);
            Database.addInput(request, 'CreatorId', sql.UniqueIdentifier, food.creatorId || '00000000-0000-0000-0000-000000000000');
            Database.addInput(request, 'CreatorName', sql.VarChar(100), food.creatorName || 'Unknown');
            Database.addInput(request, 'USDAId', sql.Int, food.USDAId ?? -1);
            Database.addInput(request, 'IsPublic', sql.Bit, food.isPublic ?? 0);
            Database.addInput(request, 'IsUSDA', sql.Bit, food.isUSDA ?? 0);
            Database.addInput(request, 'Label', sql.VarChar(50), food.label);
            Database.addInput(request, 'Category', sql.VarChar(50), food.category);
            Database.addInput(request, 'ServingUnit', sql.VarChar(20), food.servingUnit);
            Database.addInput(request, 'OriginalServingSize', sql.Decimal(7, 2), food.originalServingSize ?? food.servingSize);
            Database.addInput(request, 'ServingSize', sql.Decimal(7, 2), food.servingSize);
            Database.addInput(request, 'OriginalEnergyKcal', sql.Decimal(7, 2), food.originalEnergyKcal ?? food.energyKcal);
            Database.addInput(request, 'OriginalCarbs', sql.Decimal(7, 2), food.originalCarbs ?? food.carbs);
            Database.addInput(request, 'OriginalProtein', sql.Decimal(7, 2), food.originalProtein ?? food.protein);
            Database.addInput(request, 'OriginalFat', sql.Decimal(7, 2), food.originalFat ?? food.fat);
            Database.addInput(request, 'EnergyKcal', sql.Decimal(7, 2), food.energyKcal);
            Database.addInput(request, 'Carbs', sql.Decimal(7, 2), food.carbs);
            Database.addInput(request, 'Protein', sql.Decimal(7, 2), food.protein);
            Database.addInput(request, 'Fat', sql.Decimal(7, 2), food.fat);
            Database.addInput(request, 'DominantMacro', sql.VarChar(20), food.dominantMacro);
            Database.addInput(request, 'AdditionalProps', sql.NVarChar(sql.MAX), food.additionalProps ? JSON.stringify(food.additionalProps) : null);

            const query = `
                INSERT INTO dbo.MealLogFoods (
                    MealLogId, CreatorId, CreatorName, USDAId, IsPublic, IsUSDA, Label, Category,
                    ServingUnit, OriginalServingSize, ServingSize,
                    OriginalEnergyKcal, OriginalCarbs, OriginalProtein, OriginalFat,
                    EnergyKcal, Carbs, Protein, Fat, DominantMacro, AdditionalProps
                )
                OUTPUT INSERTED.Id
                VALUES (
                    @MealLogId, @CreatorId, @CreatorName, @USDAId, @IsPublic, @IsUSDA, @Label, @Category,
                    @ServingUnit, @OriginalServingSize, @ServingSize,
                    @OriginalEnergyKcal, @OriginalCarbs, @OriginalProtein, @OriginalFat,
                    @EnergyKcal, @Carbs, @Protein, @Fat, @DominantMacro, @AdditionalProps
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
                DELETE FROM MealLogFoods
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
    static async updateFood(mealId, food) {
        if (!mealId || !food || !food.id) return false;

        try {
            const request = Database.getRequest();
            Database.addInput(request, 'Id', sql.Int, food.id);
            Database.addInput(request, 'MealLogId', sql.Int, mealId);
            Database.addInput(request, 'Label', sql.VarChar(50), food.label);
            Database.addInput(request, 'Category', sql.VarChar(50), food.category);
            Database.addInput(request, 'ServingUnit', sql.VarChar(20), food.servingUnit);
            Database.addInput(request, 'ServingSize', sql.Decimal(7, 2), food.servingSize);
            Database.addInput(request, 'EnergyKcal', sql.Decimal(7, 2), food.energyKcal);
            Database.addInput(request, 'Carbs', sql.Decimal(7, 2), food.carbs);
            Database.addInput(request, 'Protein', sql.Decimal(7, 2), food.protein);
            Database.addInput(request, 'Fat', sql.Decimal(7, 2), food.fat);
            Database.addInput(request, 'DominantMacro', sql.VarChar(20), food.dominantMacro);
            Database.addInput(request, 'AdditionalProps', sql.NVarChar(sql.MAX), food.additionalProps ? JSON.stringify(food.additionalProps) : null);

            const query = `
                UPDATE MealLogFoods
                SET Label = @Label,
                    Category = @Category,
                    ServingUnit = @ServingUnit,
                    ServingSize = @ServingSize,
                    EnergyKcal = @EnergyKcal,
                    Carbs = @Carbs,
                    Protein = @Protein,
                    Fat = @Fat,
                    DominantMacro = @DominantMacro,
                    AdditionalProps = @AdditionalProps
                WHERE MealLogId = @MealLogId AND Id = @Id
            `;

            const result = await request.query(query);
            return result.rowsAffected[0] > 0;
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

            const query = `SELECT * FROM MealLogFoods WHERE MealLogId = @MealId`;
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
