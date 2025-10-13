import { Images } from "../settings/assets";
import { convertWeight } from "./unit-converter";

export const countryCodes = [
    { name: "United States", code: "US", dial_code: "+1" },
    { name: "Canada", code: "CA", dial_code: "+1" },
    { name: "United Kingdom", code: "GB", dial_code: "+44" },
    { name: "Australia", code: "AU", dial_code: "+61" },
    { name: "Germany", code: "DE", dial_code: "+49" },
    { name: "France", code: "FR", dial_code: "+33" },
    { name: "Italy", code: "IT", dial_code: "+39" },
    { name: "Spain", code: "ES", dial_code: "+34" },
    { name: "Israel", code: "IL", dial_code: "+972" },
    { name: "India", code: "IN", dial_code: "+91" },
    { name: "China", code: "CN", dial_code: "+86" },
    { name: "Japan", code: "JP", dial_code: "+81" },
    { name: "Brazil", code: "BR", dial_code: "+55" },
    { name: "Mexico", code: "MX", dial_code: "+52" },
    { name: "Russia", code: "RU", dial_code: "+7" },
    { name: "South Africa", code: "ZA", dial_code: "+27" },
    { name: "New Zealand", code: "NZ", dial_code: "+64" },
    { name: "Singapore", code: "SG", dial_code: "+65" },
    { name: "South Korea", code: "KR", dial_code: "+82" }
];

export const defaultPreferences = {
    heightUnit: { key: "cm", label: "Metric (cm)", labelShort: "Metric", field: "cm", placeholderLabel: "(cm)" },
    weightUnit: { key: "kg", label: "Kilogram (kg)", labelShort: "Kilogram", field: "kg", placeholderLabel: "(kg)" },
    fluidUnit: { key: "ml", label: "Milliliter (mL)", labelShort: "Milliliter", field: "mL", placeholderLabel: "(mL)" },
    energyUnit: { key: "kcal", label: "Kilocalorie (kcal)", labelShort: "Kilocalorie", field: "kcal", placeholderLabel: "(kcal)" },
    dateFormat: { key: "ISO", label: "YYYY-MM-DD", labelShort: "ISO", placeholderLabel: "(ISO)" },
    timeFormat: { key: "12h", label: "12h", labelShort: "12h", placeholderLabel: "(12h)" },
    language: { standard: 'en', format: 'en-US' },
    theme: 'dark',
};

export const weightUnits = [
    { key: "kg", label: "Kilogram (kg)", labelShort: "Kilogram", field: "kg", placeholderLabel: "(kg)" },
    { key: "lb", label: "Pound (lb)", labelShort: "Pound", field: "lb", placeholderLabel: "(lb)" }
];

export const heightUnits = [
    { key: "cm", label: "Metric (cm)", labelShort: "Metric", field: "cm", placeholderLabel: "(cm)" },
    { key: "ft/in", label: "Feet & Inches (ft / in)", labelShort: "Feet & Inches", field: "ft/in", placeholderLabel: "(ft/in)" }
];

export const energyUnits = [
    { key: "kcal", label: "Kilocalorie (kcal)", labelShort: "Kilocalorie", field: "kcal", placeholderLabel: "(kcal)" },
    { key: "kj", label: "Kilojoule (kJ)", labelShort: "Kilojoule", field: "kJ", placeholderLabel: "(kJ)" }
];

export const fluidUnits = [
    { key: "ml", label: "Milliliter (mL)", labelShort: "Milliliter", field: "mL", placeholderLabel: "(mL)" },
    { key: "floz", label: "Fluid Ounce (fl oz)", labelShort: "Fluid Ounce", field: "Fl Oz", placeholderLabel: "(fl oz)" },
    { key: "cups", label: "Cups", labelShort: "Cups", field: "cups", placeholderLabel: "(cups)" }
];

export const dateFormats = [
    { key: "ISO", label: "YYYY-MM-DD", labelShort: "ISO", placeholderLabel: "(ISO)" },
    { key: "US", label: "MM/DD/YYYY", labelShort: "US", placeholderLabel: "(US)" },
    { key: "EU", label: "DD/MM/YYYY", labelShort: "EU", placeholderLabel: "(EU)" }
];

export const timeFormats = [
    { key: "12h", label: "12h", labelShort: "12h", placeholderLabel: "(12h)" },
    { key: "24h", label: "24h", labelShort: "24h", placeholderLabel: "(24h)" }
];

export const activityOptions = [
    {
        image: Images.sitting,
        key: "sedentary",
        description: "Sedentary with little or no exercise",
        label: "Sedentary",
        color: "#708090",
        factor: 1.2,
        tips: [
            "Try short daily walks or stretching to gradually increase activity.",
            "Small changes like taking stairs can help boost your TDEE."
        ],
        level: 1
    },
    {
        image: Images.runningNormal,
        key: "lightlyActive",
        description: "Exercise 1-3 times/week",
        label: "Lightly Active",
        color: "#3B82F6",
        factor: 1.375,
        tips: [
            "Consistency is key: gradually increase exercise duration or intensity.",
            "Combine light cardio with bodyweight exercises for better results."
        ],
        level: 2
    },
    {
        image: Images.runningFast,
        key: "moderatelyActive",
        description: "Exercise 4-5 times/week",
        label: "Moderately Active",
        color: "#6BCB77",
        factor: 1.55,
        tips: [
            "Maintain a balanced diet to support your activity level.",
            "Include strength training to maximize fat burn."
        ],
        level: 3
    },
    {
        image: Images.flexBiceps,
        key: "veryActive",
        description: "Daily exercise or intense 3-4 times/week",
        label: "Very Active",
        color: "#F7B801",
        factor: 1.725,
        tips: [
            "Ensure proper rest and recovery to prevent fatigue.",
            "Track your food to match your higher energy needs."
        ],
        level: 4
    },
    {
        image: Images.flexDoubleBi,
        key: "extraActive",
        description: "Very intense exercises with physical job",
        label: "Extra Active",
        color: "#F35B04",
        factor: 1.9,
        tips: [
            "Hydrate well and focus on nutrient-dense foods.",
            "Listen to your body: recovery is as important as activity."
        ],
        level: 5
    },
];

export const goalOptions = [
    {
        image: Images.weighingTwo,
        key: "weightLoss",
        description: "20% decrease in energy intake",
        label: "Weight Loss",
        color: "#B91C1C", // deep red (strong loss)
        level: 1
    },
    {
        image: Images.measuringTape,
        key: "mildWeightLoss",
        description: "10% decrease in energy intake",
        label: "Mild Weight Loss",
        color: "#F43F5E", // pink/red (mild loss)
        level: 2
    },
    {
        image: Images.athleticThree,
        key: "maintain",
        description: "No increase in energy intake",
        label: "Maintenance",
        color: "#68b870", // neutral gray (maintenance)
        level: 3
    },
    {
        key: "mildWeightGain",
        label: "Mild Weight Gain",
        description: "10% increase in energy intake",
        image: Images.benchPress,
        color: "#FB923C", // bright orange
        level: 4,
    },
    {
        key: "weightGain",
        label: "Weight Gain",
        description: "20% increase in energy intake",
        image: Images.weightlifting,
        color: "#C2410C", // deep burnt orange
        level: 5,
    },
];

export const lbmLevels = [
    {
        key: "very_low",
        title: "Very Low",
        description: "Very low muscle mass",
        male: { min: 0, max: 50 },
        female: { min: 0, max: 45 },
        rangeKg: "< 50 kg (M), < 45 kg (F)",
        rangeLb: `< ${convertWeight(50, 'kg', 'lb')} lb (M), < ${convertWeight(45, 'kg', 'lb')} lb (F)`,
        color: "#F472B6",
        tips: [
            "Begin a structured resistance training program 3 - 4 times/week.",
            "Focus on high-protein meals to support muscle growth.",
        ],
    },
    {
        key: "low",
        title: "Low",
        description: "Below average muscle mass",
        male: { min: 50, max: 60 },
        female: { min: 45, max: 55 },
        rangeKg: "50-60 kg (M), 45-55 kg (F)",
        rangeLb: `${convertWeight(50, 'kg', 'lb')} - ${convertWeight(60, 'kg', 'lb')} lb (M), ${convertWeight(45, 'kg', 'lb')} - ${convertWeight(55, 'kg', 'lb')} lb (F)`,
        color: "#FB7185",
        tips: [
            "Increase strength training intensity gradually.",
            "Ensure adequate protein and energy intake.",
        ],
    },
    {
        key: "average",
        title: "Average",
        description: "Typical lean body mass",
        male: { min: 60, max: 70 },
        female: { min: 55, max: 65 },
        rangeKg: "60-70 kg (M), 55-65 kg (F)",
        rangeLb: `${convertWeight(60, 'kg', 'lb')} - ${convertWeight(70, 'kg', 'lb')} lb (M), ${convertWeight(55, 'kg', 'lb')} - ${convertWeight(65, 'kg', 'lb')} lb (F)`,
        color: "#10B981",
        tips: [
            "Maintain regular resistance training.",
            "Balance nutrition to sustain muscle.",
        ],
    },
    {
        key: "high",
        title: "High",
        description: "Above average muscle mass",
        male: { min: 70, max: 80 },
        female: { min: 65, max: 75 },
        rangeKg: "70-80 kg (M), 65-75 kg (F)",
        rangeLb: `${convertWeight(70, 'kg', 'lb')} - ${convertWeight(80, 'kg', 'lb')} lb (M), ${convertWeight(65, 'kg', 'lb')} - ${convertWeight(75, 'kg', 'lb')} lb (F)`,
        color: "#F59E0B",
        tips: [
            "Focus on recovery and flexibility routines.",
            "Maintain strength training for continued progress.",
        ],
    },
    {
        key: "excellent",
        title: "Excellent",
        description: "Outstanding muscle mass",
        male: { min: 80, max: Infinity },
        female: { min: 75, max: Infinity },
        rangeKg: "> 80 kg (M), > 75 kg (F)",
        rangeLb: `> ${convertWeight(80, 'kg', 'lb')} lb (M), > ${convertWeight(75, 'kg', 'lb')} lb (F)`,
        color: "#C2410C",
        tips: [
            "Maintain a consistent strength and conditioning routine.",
            "Track recovery to avoid overtraining.",
        ],
    },
];

export const dietOptions = [
    {
        key: "balanced",
        label: "Balanced",
        description: "40% Carbs, 35% Protein, 25% Fat",
        carbRate: 40,
        proteinRate: 35,
        fatRate: 25,
        color: "#3B82F6", // blueish - justice / equality
        image: Images.balanced2,
        tintColor: true
    },
    {
        key: "lowFat",
        label: "Low Fat",
        description: "60% Carbs, 25% Protein, 15% Fat",
        carbRate: 60,
        proteinRate: 25,
        fatRate: 15,
        color: "#A8F0A0", // soft green - healthy fats, light & fresh
        image: Images.lowFat,
        tintColor: false
    },
    {
        key: "lowCarb",
        label: "Low Carb",
        description: "20% Carbs, 40% Protein, 40% Fat",
        carbRate: 20,
        proteinRate: 40,
        fatRate: 40,
        color: "#FBBF24", // golden - grains / low carb foods
        image: Images.lowCarb,
        tintColor: false
    },
    {
        key: "highProtein",
        label: "High Protein",
        description: "25% Carbs, 40% Protein, 35% Fat",
        carbRate: 25,
        proteinRate: 40,
        fatRate: 35,
        color: "#EF4444", // reddish / pink-red - meat & poultry
        image: Images.protein5,
        tintColor: true
    },
    {
        key: "ketogenic",
        label: "Ketogenic",
        description: "5% Carbs, 25% Protein, 70% Fat",
        carbRate: 5,
        proteinRate: 25,
        fatRate: 70,
        color: "#93db34", // orange - fatty / keto-friendly
        image: Images.keto,
        tintColor: false
    },
    {
        key: "custom",
        label: "Custom",
        description: "Custom macronutrient distribution",
        color: "#9CA3AF", // soft friendly gray - neutral
        image: Images.custom,
        tintColor: true
    }
];

export const bmiClasses = [
    {
        key: "underweight",
        labelShort: "Under",
        title: "Underweight",
        description: "Low weight risk",
        range: "< 18.50",
        male: { min: 0, max: 18.49 },
        female: { min: 0, max: 18.49 },
        color: "#6BCB77",
        tips: [
            "You are underweight: aim for balanced meals to reach a healthier weight.",
            "Include protein, whole grains, and healthy fats in your diet.",
            "Strength training can help increase lean muscle mass."
        ]
    },
    {
        key: "normal",
        labelShort: "Normal",
        title: "Normal Weight",
        description: "Healthy weight",
        range: "18.5 - 25.99",
        male: { min: 18.5, max: 25.99 },
        female: { min: 18.5, max: 24.99 },
        color: "#6BCB77",
        tips: [
            "Great! Your weight is in the healthy range.",
            "Maintain your lifestyle with balanced nutrition and regular activity.",
            "Monitor changes to stay within the normal range."
        ]
    },
    {
        key: "overweight",
        labelShort: "Over",
        title: "Overweight",
        description: "Moderate risk",
        range: "25.99 - 30.99",
        male: { min: 26, max: 30.99 },
        female: { min: 25, max: 30.99 },
        color: "#F7B801",
        tips: [
            "You are slightly above healthy weight. Consider regular exercise and mindful eating.",
            "Strength training can help maintain muscle while reducing fat.",
            "Avoid extreme diets; focus on gradual, sustainable changes."
        ]
    },
    {
        key: "obeseI",
        labelShort: "Obese I",
        title: "Obese Class I",
        description: "High risk",
        range: "30.99 - 35.99",
        male: { min: 31, max: 35.99 },
        female: { min: 31, max: 34.99 },
        color: "#F35B04",
        tips: [
            "Health risk is increasing. Begin with small, consistent lifestyle changes.",
            "Increase daily activity and reduce processed food intake.",
            "Consider consulting a nutritionist or healthcare provider."
        ]
    },
    {
        key: "obeseII",
        labelShort: "Obese II",
        title: "Obese Class II",
        description: "Very high risk",
        range: "> 35.99",
        male: { min: 36, max: 100 },
        female: { min: 35, max: 100 },
        color: "#D72638",
        tips: [
            "Very high risk: prioritize safe weight reduction with professional guidance.",
            "Combine cardio, strength training, and proper nutrition for best results.",
            "Track your progress and focus on sustainable habits."
        ]
    }
];

export const bodyFatRanges = [
    {
        key: "essentialFat",
        labelShort: "Essential",
        title: "Essential Fat",
        description: "Needed for survival",
        range: "2-5% (Men), 10-13% (Women)",
        color: "#4AB5FF",
        male: { min: 2, max: 5.99 },
        female: { min: 10, max: 13.99 },
        tips: [
            "Critical low: This body fat level is only sustainable for very short periods (contests, photo shoots, extreme conditions).",
            "Remaining here long-term can harm hormones, immunity, and organ function.",
            "Women may face irregular menstrual cycles and higher osteoporosis risk.",
            "It's strongly advised to increase body fat after reaching this range."
        ]
    },
    {
        key: "athletes",
        labelShort: "Athletes",
        title: "Athletes",
        description: "Low fat, fit",
        range: "6-13% (Men), 14-20% (Women)",
        color: "#6BCB77",
        male: { min: 6, max: 13.99 },
        female: { min: 14, max: 20.99 },
        tips: [
            "This is a low and fit range, commonly seen in competitive athletes.",
            "Maintaining this range requires strict training, nutrition, and discipline.",
            "It's sustainable but may impact flexibility in social life and diet freedom.",
            "Energy levels should be monitored to avoid burnout or under-recovery."
        ]
    },
    {
        key: "fitness",
        labelShort: "Fitness",
        title: "Fitness",
        description: "Healthy fat",
        range: "14-17% (Men), 21-24% (Women)",
        color: "#3ED598",
        male: { min: 14, max: 17.99 },
        female: { min: 21, max: 24.99 },
        tips: [
            "Healthy and sustainable: This is considered an ideal range for fitness and appearance.",
            "You're balancing performance, aesthetics, and overall health effectively.",
            "Continue with consistent training and balanced nutrition.",
            "This range is maintainable long-term without major social or lifestyle sacrifices."
        ]
    },
    {
        key: "average",
        labelShort: "Average",
        title: "Average",
        description: "Moderate fat",
        range: "18-21% (Men), 25-28% (Women)",
        color: "#F7B801",
        male: { min: 18, max: 21.99 },
        female: { min: 25, max: 28.99 },
        tips: [
            "You're in a generally healthy range, but some caution is advised.",
            "Daily activity and mindful eating can help prevent drifting into higher fat levels.",
            "Strength training is highly recommended to preserve lean muscle mass.",
            "Keep an eye on weight trends — gradual increases may go unnoticed."
        ]
    },
    {
        key: "overweight",
        labelShort: "Overweight",
        title: "Overweight",
        description: "Above healthy fat",
        range: "22-29% (Men), 29-31% (Women)",
        color: "#F79C1F",
        male: { min: 22, max: 29.99 },
        female: { min: 29, max: 31.99 },
        tips: [
            "Above healthy: Body fat is higher than recommended for optimal health.",
            "Regular cardio, resistance training, and diet monitoring are advised.",
            "Focus on gradual fat reduction rather than quick fixes.",
            "Tracking progress and habits is more important than weight alone."
        ]
    },
    {
        key: "obese",
        labelShort: "Obese",
        title: "Obese",
        description: "High fat, risk",
        range: "30%+ (Men), 32%+ (Women)",
        color: "#D72638",
        male: { min: 30, max: Infinity },
        female: { min: 32, max: Infinity },
        tips: [
            "Critically high: This range significantly increases risk of cardiovascular disease, diabetes, and joint issues.",
            "Begin with small, sustainable changes in diet and physical activity.",
            "Professional guidance from a healthcare provider or nutritionist is strongly recommended.",
            "Consistency is key - even modest fat reduction can greatly improve health markers."
        ]
    }
];