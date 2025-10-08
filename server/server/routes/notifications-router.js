import { Router } from 'express';
import NutritionDaysController from '../models/nutrition/days/nutrition-days-controller.js';
import NutritionMealsController from '../models/nutrition/meals/nutrition-meals-controller.js';
import MiddlewaresManager from '../utils/middlewares-manager.js';
import NutritionFoodsController from '../models/nutrition/foods/nutrition-foods-controller.js';
import NutritionMealPlansController from '../models/nutrition/meal-plans/nutrition-meal-plans-controller.js';
import NutritionMealsFoodsController from '../models/nutrition/meals/meal-foods/nutrition-meals-foods-controller.js';
import NutritionMealPlansMealsController from '../models/nutrition/meal-plans/meal-plans-meals/nutrition-meal-plans-meals-controller.js';
import NutritionMealPlansMealsFoodsController from '../models/nutrition/meal-plans/meal-plans-meals/meal-plans-meals-foods/nutrition-meal-plans-meals-foods-controller.js';

export default class NotificationsRouter {
    static nutritionRouter;

    static init() {
        this.nutritionRouter = Router();
        const asyncHandler = MiddlewaresManager.asyncHandler;
        const tokenAuthorization = MiddlewaresManager.tokenAuthorization;
        const userAuthorization = MiddlewaresManager.userAuthorization;

        //do routes


        return this.nutritionRouter;
    }
}