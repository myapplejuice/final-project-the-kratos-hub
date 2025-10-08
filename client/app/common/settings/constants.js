export const routes = {
    /* AUTHENTICATION */
    SPLASH: '/',
    INTRODUCTION: '/screens/authentication/introduction',
    LOGIN: '/screens/authentication/login',
    RECOVERY: '/screens/authentication/recovery',
    REGISTER: '/screens/authentication/register',

    /* MAIN */
    PROFILE: '/screens/main/profile',
    HOMEPAGE: '/screens/main/homepage',
    GOALS: '/screens/main/goals',
    NUTRITION_HUB: '/screens/main/nutrition-hub',
    TRAINING_HUB: '/screens/main/training-hub',

    /* HOMEPAGE CHILDREN */
    LEAN_BODY_MASS: '/screens/main/homepage/lean-body-mass',
    BODY_MASS_INDEX: '/screens/main/homepage/body-mass-index',
    TOTAL_DAILY_ENERGY_EXPENDITURE: '/screens/main/homepage/total-daily-energy-expenditure',
    BASAL_METABOLIC_RATE: '/screens/main/homepage/basal-metabolic-rate',
    BODY_FAT: '/screens/main/homepage/body-fat',

    /* PROFILE CHILDREN */
    SETTINGS: '/screens/main/profile/settings',
    EDIT_PROFILE: '/screens/main/profile/edit-profile',
    USDA_PROFILE: '/screens/main/profile/usda-profile',
    USER_PROFILE: '/screens/main/profile/user-profile',

    /* SETTINGS CHILDREN */
    UNITS_CHANGE: '/screens/main/profile/settings/units-change',
    ABOUT: '/screens/main/profile/settings/about',
    TERMS_OF_SERVICE: '/screens/main/profile/settings/terms-of-service',
    PRIVACY_POLICY: '/screens/main/profile/settings/privacy-policy',

    /* GOALS CHILDREN */
    EDIT_ACTIVITY: '/screens/main/goals/edit-activity',
    EDIT_WEIGHT_GOAL: '/screens/main/goals/edit-weight-goal',
    EDIT_DIET: '/screens/main/goals/edit-diet',

    /* NUTRITION CHILDREN */
    MEALS_LOG: '/screens/main/nutrition/meals-log',
    MEAL_PLANS: '/screens/main/nutrition/meal-plans',
    MEAL_PLANS_EDITOR: '/screens/main/nutrition/meal-plans-editor',
    FOOD_CREATOR: '/screens/main/nutrition/food-creator',
    FOOD_EDITOR: '/screens/main/nutrition/food-editor',
    FOOD_SELECTION: '/screens/main/nutrition/food-selection',
    FOOD_PROFILE: '/screens/main/nutrition/food-profile',
    FOODS: '/screens/main/nutrition/foods',

}

export const mainScreens = [
    routes.HOMEPAGE,
    routes.GOALS,
    routes.NUTRITION_HUB,
    routes.TRAINING_HUB
]

export const authScreens = [
    routes.SPLASH,
    routes.LOGIN,
    routes.RECOVERY,
    routes.REGISTER,
    routes.INTRODUCTION
]

export const exitAppBackScreens = [
    routes.INTRODUCTION,
    routes.HOMEPAGE
]

export const independentBackHandlerScreens = [
    routes.RECOVERY,
    routes.REGISTER
]