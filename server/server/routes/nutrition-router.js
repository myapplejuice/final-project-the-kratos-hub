import { Router } from 'express';
import NutritionDaysController from '../models/nutrition/days/nutrition-days-controller.js';
import NutritionMealsController from '../models/nutrition/meals/nutrition-meals-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import NutritionFoodsController from '../models/nutrition/foods/nutrition-foods-controller.js';
import NutritionMealPlansController from '../models/nutrition/meal-plans/nutrition-meal-plans-controller.js';
import NutritionMealsFoodsController from '../models/nutrition/meals/meal-foods/nutrition-meals-foods-controller.js';
import NutritionMealPlansMealsController from '../models/nutrition/meal-plans/meal-plans-meals/nutrition-meal-plans-meals-controller.js';
import NutritionMealPlansMealsFoodsController from '../models/nutrition/meal-plans/meal-plans-meals/meal-plans-meals-foods/nutrition-meal-plans-meals-foods-controller.js';

export default class NutritionRouter {
    static nutritionRouter;

    static init() {
        this.nutritionRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;
        const tokenAuthorization = MiddlewaresManager.tokenAuthorization;
        const userAuthorization = MiddlewaresManager.userAuthorization;

        this.nutritionRouter.get('/all/:id', tokenAuthorization, userAuthorization, asyncHandler(NutritionDaysController.getAllDays));
        this.nutritionRouter.get('/day/:date/:id', tokenAuthorization, userAuthorization, asyncHandler(NutritionDaysController.getDayByDate));
        this.nutritionRouter.post('/insert/:date/:id', tokenAuthorization, userAuthorization, asyncHandler(NutritionDaysController.insertNewDay));
        this.nutritionRouter.post('/ensure/:date/:id', tokenAuthorization, userAuthorization, asyncHandler(NutritionDaysController.ensureDayAndFutureDays));
        this.nutritionRouter.put('/update-day/:date/:id', tokenAuthorization, userAuthorization, asyncHandler(NutritionDaysController.updateDay));
        this.nutritionRouter.put('/update-consumption/:date/:id', tokenAuthorization, userAuthorization, asyncHandler(NutritionDaysController.updateConsumption));

        this.nutritionRouter.post("/meals/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealsController.createMeal));
        this.nutritionRouter.delete("/meals/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealsController.deleteMeal));
        this.nutritionRouter.put("/meals/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealsController.updateMeal));
        this.nutritionRouter.post("/meals/bulk/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealsController.multiCreateMeals));
        
        this.nutritionRouter.post("/meals/food/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealsFoodsController.addFood));
        this.nutritionRouter.delete("/meals/food/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealsFoodsController.deleteFood));
        this.nutritionRouter.put("/meals/food/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealsFoodsController.updateFood));

        this.nutritionRouter.get("/foods/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionFoodsController.fetchFoods));
        this.nutritionRouter.post("/foods/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionFoodsController.createFood));
        this.nutritionRouter.put("/foods/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionFoodsController.updateFood));
        this.nutritionRouter.delete("/foods/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionFoodsController.deleteFood));

        this.nutritionRouter.post("/meal-plans/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealPlansController.createPlan));
        this.nutritionRouter.delete("/meal-plans/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealPlansController.deletePlan));
        this.nutritionRouter.put("/meal-plans/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealPlansController.updatePlan));

        this.nutritionRouter.post("/meal-plans/meal/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealPlansMealsController.createMeal));
        this.nutritionRouter.delete("/meal-plans/meal/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealPlansMealsController.deleteMeal));
        this.nutritionRouter.put("/meal-plans/meal/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealPlansMealsController.updateMeal));

        this.nutritionRouter.post("/meal-plans/meal/food/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealPlansMealsFoodsController.addFood));
        this.nutritionRouter.delete("/meal-plans/meal/food/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealPlansMealsFoodsController.deleteFood));
        this.nutritionRouter.put("/meal-plans/meal/food/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealPlansMealsFoodsController.updateFood));



        return this.nutritionRouter;
    }
}