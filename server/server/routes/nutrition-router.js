import { Router } from 'express';
import NutritionDaysController from '../models/nutrition/days/nutrition-days-controller.js';
import NutritionMealsController from '../models/nutrition/meals/nutrition-meals-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import NutritionFoodsController from '../models/nutrition/foods/nutrition-foods-controller.js';

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
        this.nutritionRouter.put("/meals/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionMealsController.updateMealLabel));

        this.nutritionRouter.get("/foods/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionFoodsController.allFoods));
        this.nutritionRouter.post("/foods/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionFoodsController.createFood));
        this.nutritionRouter.put("/foods/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionFoodsController.updateFood));
        this.nutritionRouter.delete("/foods/:id", tokenAuthorization, userAuthorization, asyncHandler(NutritionFoodsController.deleteFood));

        return this.nutritionRouter;
    }
}