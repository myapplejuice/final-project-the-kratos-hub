import { dietOptions } from "./global-options";
import { convertEnergy } from "./unit-converter";

export function proteinRequirement(weightKg, activityLevel) {
    const multipliers = { sedentary: 0.8, lightlyActive: 1.0, moderatelyActive: 1.3, veryActive: 1.6, extraActive: 2.0 };
    return Math.round(weightKg * (multipliers[activityLevel] || 1.3));
}

export function proteinRequirementFromLBM(lbmKg, activityLevel) {
    const multipliers = { sedentary: 1.2, lightlyActive: 1.5, moderatelyActive: 1.8, veryActive: 2.0, extraActive: 2.5 };
    lbmKg = Number(lbmKg);
    return Math.round((lbmKg * (multipliers[activityLevel] || 1.8)));
}

export function getProteinRequirement(user) {
    if (user.metrics?.leanBodyMass) {
        return proteinRequirementFromLBM(user.metrics.leanBodyMass, user.metrics.activityLevel);
    }
    return proteinRequirement(user.metrics.weightKg, user.metrics.activityLevel);
}

export function recommendedWaterIntake(weightKg) {
    return Math.round(weightKg * 35);
}

export function BMI(heightCm, weightKg) {
    heightCm = Number(heightCm);
    weightKg = Number(weightKg);

    if (!heightCm || !weightKg) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
}

export function BMIByLeanMass(weightKg, heightCm, leanBodyMass) {
    if (!weightKg || !heightCm || !leanBodyMass) return null;
    const heightM = heightCm / 100;
    return Math.round((leanBodyMass / (heightM * heightM)) * 10) / 10;
}

export function BMR(weight, height, age, gender) {
    weight = Number(weight);
    height = Number(height);
    age = Number(age);
    gender = gender.toLowerCase();

    if (gender === 'male') {
        return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
        return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
}

export function TDEE(bmr, activityLevel) {
    const multipliers = {
        sedentary: 1.2,
        lightlyActive: 1.375,
        moderatelyActive: 1.55,
        veryActive: 1.725,
        extraActive: 1.9
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

export function caloriesByGoal(tdee, goal) {
    const multipliers = {
        weightLoss: 0.8,
        mildWeightLoss: 0.9,
        maintain: 1.0,
        mildWeightGain: 1.1,
        weightGain: 1.2
    };
    return Math.round(tdee * (multipliers[goal] || 1));
}

export function bodyFat(bmi, age, gender, activityLevel = 'moderatelyActive') {
    bmi = Number(bmi);
    age = Number(age);
    gender = gender.toLowerCase();
    activityLevel = activityLevel.toLowerCase();

    if (!bmi || !age || !['male', 'female'].includes(gender)) return null;

    let intercept;

    // Base intercept by age
    if (gender === 'male') {
        intercept = age < 30 ? 16.0 : age <= 50 ? 15.0 : 14.0;
    } else {
        intercept = age < 30 ? 5.0 : age <= 50 ? 6.0 : 7.0;
    }

    // Adjust intercept by activity level
    const activityAdjustment = {
        sedentary: 1.0,
        lightlyActive: 0.5,
        moderatelyActive: 0.0,
        veryActive: -0.5,
        extraActive: -1.0
    };

    intercept -= activityAdjustment[activityLevel] || 0;

    const bodyFat = 1.20 * bmi + 0.23 * age - intercept;
    return Math.round(bodyFat * 10) / 10;
}

export function leanBodyMass(weightKg, bodyFat) {
    weightKg = Number(weightKg);
    bodyFat = Number(bodyFat);
    if (!weightKg || !bodyFat) return null;
    const leanMass = weightKg * (1 - bodyFat / 100);
    return Math.round(leanMass * 10) / 10;
}

export function caloriesFromMacros(carbsGrams, proteinGrams, fatGrams) {
    return Math.rounded(carbsGrams * 4 + proteinGrams * 4 + fatGrams * 9);
}

export function macrosFromCalories(totalCalories, dietKey, carbs = 0, protein = 0, fat = 0, returnLiteralValues = false) {
    if (!totalCalories || totalCalories <= 0) return { carbs: 0, protein: 0, fat: 0 };

    let carbPerc, proteinPerc, fatPerc;

    if (dietKey === "custom") {
        carbPerc = Number(carbs);
        proteinPerc = Number(protein);
        fatPerc = Number(fat);
    } else {
        const diet = dietOptions.find(d => d.key === dietKey);
        if (!diet) return { carbs: 0, protein: 0, fat: 0 };
        carbPerc = diet.carbRate;
        proteinPerc = diet.proteinRate;
        fatPerc = diet.fatRate;
    }

    const carbCalories = (totalCalories * carbPerc) / 100;
    const proteinCalories = (totalCalories * proteinPerc) / 100;
    const fatCalories = (totalCalories * fatPerc) / 100;

    if (returnLiteralValues) {
        return {
            carbs: carbCalories / 4,
            protein: proteinCalories / 4,
            fat: fatCalories / 9,
        };
    }

    return {
        carbs: Math.round(carbCalories / 4),
        protein: Math.round(proteinCalories / 4),
        fat: Math.round(fatCalories / 9),
    };
}

export function caloriesBurnedMET(weightKg, durationMin, MET) {
    weightKg = Number(weightKg);
    durationMin = Number(durationMin);
    MET = Number(MET);
    if (!weightKg || !durationMin || !MET) return null;
    return Math.round((MET * weightKg * (durationMin / 60) * 10)) / 10;
}

export function recalculateUserInformation(user) {
    try {
        if (!user?.metrics || !user?.nutrition) return user;

        const weightKg = Number(user.metrics.weightKg) || 0;
        const heightCm = Number(user.metrics.heightCm) || 0;
        const age = Number(user.age) || 0;
        const gender = user.gender;
        const activityLevel = user.metrics.activityLevel;
        const goal = user.nutrition.goal;

        // Metrics calculations
        const bmi = BMI(heightCm, weightKg);
        const bmr = BMR(weightKg, heightCm, age, gender);
        const tdee = TDEE(bmr, activityLevel);
        const bf = bodyFat(bmi, age, gender, activityLevel);
        const lbm = leanBodyMass(weightKg, bf);

        // Nutrition calculations
        const proteinRequirement = getProteinRequirement(user);
        const recommendedEnergyKcal = caloriesByGoal(tdee, goal);

        return {
            ...user,
            metrics: {
                ...user.metrics,
                bmi,
                bmr,
                tdee,
                bodyFat: bf,
                leanBodyMass: lbm,
            },
            nutrition: {
                ...user.nutrition,
                recommendedEnergyKcal,
                proteinRequirement,
            },
        };
    } catch (e) {
        console.log('Failed to recalc user information:', e);
        return user;
    }
}

export function totalDayConsumption(dayLog) {
  const meals = dayLog.meals || [];
  const foods = meals.flatMap(m => m.foods || []);

  return {
    energyKcal: foods.reduce((acc, f) => acc + (Number(f.energyKcal) || 0), 0),
    carbs: foods.reduce((acc, f) => acc + (Number(f.carbs) || 0), 0),
    protein: foods.reduce((acc, f) => acc + (Number(f.protein) || 0), 0),
    fat: foods.reduce((acc, f) => acc + (Number(f.fat) || 0), 0),
  };
}




//export function idealWeight(heightCm, gender) {
//    const heightIn = heightCm / 2.54;
//    if (gender === 'male') return 50 + 2.3 * (heightIn - 60);
//    return 45.5 + 2.3 * (heightIn - 60);
//}
//
//export function idealWeightRange(heightCm, gender) {
//    const lower = idealWeight(heightCm, gender) - 2;
//    const upper = idealWeight(heightCm, gender) + 2;
//    return { lower: parseFloat(lower.toFixed(2)), upper: parseFloat(upper.toFixed(2)) };
//}