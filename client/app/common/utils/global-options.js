import { Images } from "../settings/assets";
import { convertWeight } from "./unit-converter";

export const bodyParts = [
    { label: 'Traps', imageUrl: '' },
    { label: 'Shoulders', imageUrl: '' },
    { label: 'Chest', imageUrl: '' },
    { label: 'Upper Back', imageUrl: '' },
    { label: 'Lower Back', imageUrl: '' },
    { label: 'Biceps', imageUrl: '' },
    { label: 'Triceps', imageUrl: '' },
    { label: 'Forearms', imageUrl: '' },
    { label: 'Abs / Core', imageUrl: '' },
    { label: 'Obliques', imageUrl: '' },
    { label: 'Quads', imageUrl: '' },
    { label: 'Hamstrings', imageUrl: '' },
    { label: 'Glutes', imageUrl: '' },
    { label: 'Calves', imageUrl: '' },
    { label: 'Hip Flexors', imageUrl: '' },
    { label: 'Adductors (Inner Thigh)', imageUrl: '' },
    { label: 'Abductors (Outer Thigh)', imageUrl: '' },
    { label: 'Neck', imageUrl: '' },
    { label: 'Traps & Neck', imageUrl: '' },
]

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





// type: "compound" | "isolation"
// mechanic: "push" | "pull" | "static"
// level: "beginner" | "intermediate" | "advanced"
export const exercises = [
    { id: "ex_001", label: "Barbell Bench Press", muscleGroups: ["Chest", "Triceps", "Front Delts"], type: "compound", equipment: "Barbell", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Keep your feet flat, control the bar, and avoid bouncing off the chest." },
    { id: "ex_002", label: "Incline Dumbbell Press", muscleGroups: ["Chest", "Triceps", "Front Delts"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Press dumbbells upward while keeping a slight arch in your back." },
    { id: "ex_003", label: "Push-Up", muscleGroups: ["Chest", "Triceps", "Front Delts"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Keep your body straight and lower until your chest nearly touches the floor." },
    { id: "ex_004", label: "Barbell Squat", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Barbell", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 15, instructions: "Keep your back straight and descend until thighs are parallel to the ground." },
    { id: "ex_005", label: "Lunges", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 10, instructions: "Step forward into a lunge, ensuring your knee doesn't pass your toes." },
    { id: "ex_006", label: "Deadlift", muscleGroups: ["Hamstrings", "Glutes", "Lower Back"], type: "compound", equipment: "Barbell", mechanic: "pull", level: "advanced", isBodyweight: false, kCalBurned: 18, instructions: "Keep your back straight and lift with your legs, not your back." },
    { id: "ex_007", label: "Pull-Up", muscleGroups: ["Lats", "Biceps", "Traps"], type: "compound", equipment: "Pull-Up Bar", mechanic: "pull", level: "advanced", isBodyweight: true, kCalBurned: 12, instructions: "Pull your chin above the bar, keeping your core tight." },
    { id: "ex_008", label: "Lat Pulldown", muscleGroups: ["Lats", "Biceps", "Traps"], type: "compound", equipment: "Lat Pulldown Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Pull the bar down to your chest, keeping your back straight." },
    { id: "ex_009", label: "Dumbbell Bicep Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Keep your elbows close to your torso and curl the weights up." },
    { id: "ex_010", label: "Tricep Dips", muscleGroups: ["Triceps", "Chest", "Shoulders"], type: "compound", equipment: "Dip Bar", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 10, instructions: "Lower your body until your arms are at a 90-degree angle, then push back up." },
    { id: "ex_011", label: "Overhead Dumbbell Press", muscleGroups: ["Shoulders", "Traps"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Press the dumbbells overhead, keeping elbows slightly bent." },
    { id: "ex_012", label: "Arnold Press", muscleGroups: ["Shoulders", "Traps"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Rotate wrists while pressing dumbbells overhead." },
    { id: "ex_013", label: "Front Raise", muscleGroups: ["Shoulders"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Lift dumbbells in front of you to shoulder height." },
    { id: "ex_014", label: "Lateral Raise", muscleGroups: ["Shoulders"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Lift dumbbells to the sides, keeping arms slightly bent." },
    { id: "ex_015", label: "Bent-Over Row", muscleGroups: ["Back", "Lats", "Biceps"], type: "compound", equipment: "Barbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Keep your back flat and pull the barbell toward your abdomen." },
    { id: "ex_016", label: "Seated Row", muscleGroups: ["Back", "Lats", "Biceps"], type: "compound", equipment: "Cable Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Pull the handle toward your torso, squeezing shoulder blades." },
    { id: "ex_017", label: "Face Pull", muscleGroups: ["Rear Delts", "Traps"], type: "isolation", equipment: "Cable Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Pull rope toward face, keeping elbows high." },
    { id: "ex_018", label: "Hammer Curl", muscleGroups: ["Biceps", "Forearms"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Curl dumbbells with palms facing each other." },
    { id: "ex_019", label: "Concentration Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Dumbbell", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Sit and curl dumbbell toward shoulder, elbow braced on thigh." },
    { id: "ex_020", label: "Skullcrusher", muscleGroups: ["Triceps"], type: "isolation", equipment: "EZ Bar", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Lower bar to forehead slowly, then extend arms back up." },
    { id: "ex_021", label: "Seated Tricep Press", muscleGroups: ["Triceps"], type: "compound", equipment: "Dumbbell", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 8, instructions: "Press dumbbell overhead while keeping elbows tight." },
    { id: "ex_022", label: "Leg Extension", muscleGroups: ["Quads"], type: "isolation", equipment: "Leg Extension Machine", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Extend legs fully, controlling the motion." },
    { id: "ex_023", label: "Leg Curl", muscleGroups: ["Hamstrings"], type: "isolation", equipment: "Leg Curl Machine", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Curl legs back, keeping hips down." },
    { id: "ex_024", label: "Standing Calf Raise", muscleGroups: ["Calves"], type: "isolation", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 5, instructions: "Raise heels slowly, then lower under control." },
    { id: "ex_025", label: "Seated Calf Raise", muscleGroups: ["Calves"], type: "isolation", equipment: "Calf Raise Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Push through balls of feet and slowly return." },
    { id: "ex_026", label: "Plank", muscleGroups: ["Abs", "Core"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 4, instructions: "Keep your body straight, hold position, avoid sagging." },
    { id: "ex_027", label: "Side Plank", muscleGroups: ["Obliques", "Core"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 4, instructions: "Hold side plank, keep body in a straight line." },
    { id: "ex_028", label: "Hanging Leg Raise", muscleGroups: ["Abs"], type: "isolation", equipment: "Pull-Up Bar", mechanic: "static", level: "intermediate", isBodyweight: true, kCalBurned: 6, instructions: "Lift legs up slowly, control the descent." },
    { id: "ex_029", label: "Russian Twist", muscleGroups: ["Obliques"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "intermediate", isBodyweight: true, kCalBurned: 6, instructions: "Twist torso side to side, keeping core tight." },
    { id: "ex_030", label: "Mountain Climbers", muscleGroups: ["Abs", "Quads", "Shoulders"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 12, instructions: "Drive knees toward chest quickly while maintaining plank." },
    { id: "ex_031", label: "Incline Barbell Bench Press", muscleGroups: ["Chest", "Front Delts", "Triceps"], type: "compound", equipment: "Barbell", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Press bar upward on an incline bench, keep elbows tucked slightly." },
    { id: "ex_032", label: "Decline Dumbbell Press", muscleGroups: ["Chest", "Triceps"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Press dumbbells on a decline bench, control motion downward." },
    { id: "ex_033", label: "Chest Fly", muscleGroups: ["Chest"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Keep a slight bend in elbows and bring arms together above chest." },
    { id: "ex_034", label: "Incline Dumbbell Fly", muscleGroups: ["Chest", "Front Delts"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Perform fly motion on an incline bench, squeeze chest at top." },
    { id: "ex_035", label: "Cable Crossover", muscleGroups: ["Chest"], type: "isolation", equipment: "Cable Machine", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 7, instructions: "Bring cables together in front of chest while keeping arms slightly bent." },
    { id: "ex_036", label: "Dumbbell Pullover", muscleGroups: ["Chest", "Lats"], type: "compound", equipment: "Dumbbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 8, instructions: "Lower dumbbell behind head and pull back over chest, keep elbows slightly bent." },
    { id: "ex_037", label: "Cable Bicep Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Cable Machine", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Curl handle towards shoulder, keep elbows pinned." },
    { id: "ex_038", label: "Incline Dumbbell Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Curl dumbbells while lying on incline bench, maintain strict form." },
    { id: "ex_039", label: "Reverse Curl", muscleGroups: ["Biceps", "Forearms"], type: "isolation", equipment: "Barbell", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Curl barbell with palms facing down, elbows close." },
    { id: "ex_040", label: "Cable Tricep Pushdown", muscleGroups: ["Triceps"], type: "isolation", equipment: "Cable Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Push cable down fully, keep elbows tucked to sides." },
    { id: "ex_041", label: "Close-Grip Bench Press", muscleGroups: ["Triceps", "Chest"], type: "compound", equipment: "Barbell", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Press bar with narrow grip, elbows close to torso." },
    { id: "ex_042", label: "Overhead Cable Tricep Extension", muscleGroups: ["Triceps"], type: "isolation", equipment: "Cable Machine", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 7, instructions: "Extend cable overhead while keeping elbows fixed." },
    { id: "ex_043", label: "Goblet Squat", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Dumbbell", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 12, instructions: "Hold dumbbell at chest and squat down, keep chest up." },
    { id: "ex_044", label: "Sumo Deadlift", muscleGroups: ["Hamstrings", "Glutes", "Lower Back"], type: "compound", equipment: "Barbell", mechanic: "pull", level: "advanced", isBodyweight: false, kCalBurned: 18, instructions: "Wide stance deadlift, keep back flat, lift with legs and glutes." },
    { id: "ex_045", label: "Leg Press", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Leg Press Machine", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 15, instructions: "Push platform upward, keep back flat, do not lock knees at top." },
    { id: "ex_046", label: "Hack Squat", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Hack Squat Machine", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 14, instructions: "Squat down with back against pad, push platform with feet." },
    { id: "ex_047", label: "Step-Ups", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 10, instructions: "Step onto a platform, drive through heel, alternate legs." },
    { id: "ex_048", label: "Good Mornings", muscleGroups: ["Hamstrings", "Glutes", "Lower Back"], type: "compound", equipment: "Barbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Hinge at hips with bar on shoulders, keep back straight." },
    { id: "ex_049", label: "Glute Bridge", muscleGroups: ["Glutes", "Hamstrings"], type: "isolation", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Lift hips until body forms a straight line, squeeze glutes at top." },
    { id: "ex_050", label: "Hip Thrust", muscleGroups: ["Glutes", "Hamstrings"], type: "compound", equipment: "Barbell", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Drive hips up with barbell on hips, pause at top." },
    { id: "ex_051", label: "Standing Dumbbell Calf Raise", muscleGroups: ["Calves"], type: "isolation", equipment: "Dumbbells", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Raise heels while holding dumbbells at sides, lower slowly." },
    { id: "ex_052", label: "Seated Dumbbell Shoulder Press", muscleGroups: ["Shoulders", "Traps"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Press dumbbells overhead, elbows slightly bent." },
    { id: "ex_053", label: "Dumbbell Shrugs", muscleGroups: ["Traps"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Lift shoulders toward ears, pause, then lower slowly." },
    { id: "ex_054", label: "Upright Row", muscleGroups: ["Shoulders", "Traps"], type: "compound", equipment: "Barbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 8, instructions: "Lift barbell to chest level, keep elbows higher than wrists." },
    { id: "ex_055", label: "Chest Dips", muscleGroups: ["Chest", "Triceps", "Shoulders"], type: "compound", equipment: "Dip Bar", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 10, instructions: "Lean forward slightly, lower body until arms 90°, then push up." },
    { id: "ex_056", label: "Incline Push-Up", muscleGroups: ["Chest", "Triceps", "Front Delts"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 7, instructions: "Hands on elevated surface, lower chest toward surface." },
    { id: "ex_057", label: "Decline Push-Up", muscleGroups: ["Chest", "Triceps", "Front Delts"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 9, instructions: "Feet on elevated surface, perform push-up controlled." },
    { id: "ex_058", label: "Cable Lateral Raise", muscleGroups: ["Shoulders"], type: "isolation", equipment: "Cable Machine", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Lift handle to side until shoulder height, control slowly." },
    { id: "ex_059", label: "Barbell Front Squat", muscleGroups: ["Quads", "Glutes", "Core"], type: "compound", equipment: "Barbell", mechanic: "push", level: "advanced", isBodyweight: false, kCalBurned: 15, instructions: "Rest barbell on front shoulders, squat down, keep torso upright." },
    { id: "ex_060", label: "Dumbbell Step-Over", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Step over platform holding dumbbells, alternate legs." },
    { id: "ex_061", label: "Incline Cable Fly", muscleGroups: ["Chest", "Front Delts"], type: "isolation", equipment: "Cable Machine", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 7, instructions: "Perform fly motion on incline cable setup, squeeze chest at top." },
    { id: "ex_062", label: "Single-Arm Dumbbell Row", muscleGroups: ["Back", "Lats", "Biceps"], type: "compound", equipment: "Dumbbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Row dumbbell toward torso while keeping back flat, one arm at a time." },
    { id: "ex_063", label: "Renegade Row", muscleGroups: ["Back", "Abs", "Biceps"], type: "compound", equipment: "Dumbbells", mechanic: "pull", level: "advanced", isBodyweight: true, kCalBurned: 12, instructions: "From plank position, row each dumbbell toward torso alternating sides." },
    { id: "ex_064", label: "T-Bar Row", muscleGroups: ["Back", "Lats", "Rear Delts"], type: "compound", equipment: "T-Bar Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Pull T-bar toward chest while keeping torso stable." },
    { id: "ex_065", label: "Inverted Row", muscleGroups: ["Back", "Biceps"], type: "compound", equipment: "Bodyweight", mechanic: "pull", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Pull chest to bar while keeping body straight from head to heels." },
    { id: "ex_066", label: "Cable Rear Delt Fly", muscleGroups: ["Rear Delts", "Traps"], type: "isolation", equipment: "Cable Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "With cables set at chest height, pull outward focusing on rear delts." },
    { id: "ex_067", label: "Dumbbell Rear Delt Fly", muscleGroups: ["Rear Delts"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Bend forward slightly and lift dumbbells laterally, keep arms slightly bent." },
    { id: "ex_068", label: "Pull-Over Machine", muscleGroups: ["Chest", "Lats"], type: "compound", equipment: "Machine", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 8, instructions: "Pull the machine handle over your chest, keep back flat." },
    { id: "ex_069", label: "Cable Upright Row", muscleGroups: ["Shoulders", "Traps"], type: "compound", equipment: "Cable Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 7, instructions: "Pull cable handle to chin height, elbows above wrists." },
    { id: "ex_070", label: "Incline Hammer Curl", muscleGroups: ["Biceps", "Forearms"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Curl dumbbells while lying on incline bench, keep palms facing each other." },
    { id: "ex_071", label: "Standing Dumbbell Press", muscleGroups: ["Shoulders", "Traps"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Press dumbbells overhead while keeping a tight core." },
    { id: "ex_072", label: "Seated Military Press", muscleGroups: ["Shoulders", "Traps"], type: "compound", equipment: "Barbell", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Press bar overhead while seated, keep back straight." },
    { id: "ex_074", label: "Barbell Shrugs", muscleGroups: ["Traps"], type: "isolation", equipment: "Barbell", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Hold barbell in front, shrug shoulders up and lower under control." },
    { id: "ex_075", label: "Incline Dumbbell Rear Delt Fly", muscleGroups: ["Rear Delts"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Lie on incline bench face down, lift dumbbells to sides." },
    { id: "ex_077", label: "Front Cable Raise", muscleGroups: ["Shoulders"], type: "isolation", equipment: "Cable Machine", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Attach handle to low pulley, raise arm in front to shoulder height." },
    { id: "ex_078", label: "Dumbbell Side Bend", muscleGroups: ["Obliques"], type: "isolation", equipment: "Dumbbell", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Hold dumbbell in one hand, bend sideways slowly and return upright." },
    { id: "ex_079", label: "Standing Oblique Twist", muscleGroups: ["Obliques"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 4, instructions: "Twist torso side to side while keeping hips facing forward." },
    { id: "ex_080", label: "Hanging Knee Raise", muscleGroups: ["Abs"], type: "isolation", equipment: "Pull-Up Bar", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 5, instructions: "Hang from bar and lift knees toward chest, control descent." },
    { id: "ex_081", label: "Ab Wheel Rollout", muscleGroups: ["Abs", "Core"], type: "compound", equipment: "Ab Wheel", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 8, instructions: "Roll wheel forward, keep back straight, return slowly." },
    { id: "ex_082", label: "Decline Sit-Up", muscleGroups: ["Abs"], type: "isolation", equipment: "Decline Bench", mechanic: "static", level: "intermediate", isBodyweight: true, kCalBurned: 6, instructions: "Perform sit-up on decline bench, avoid pulling on neck." },
    { id: "ex_083", label: "Cable Woodchopper", muscleGroups: ["Obliques"], type: "isolation", equipment: "Cable Machine", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Pull cable diagonally across body, rotate torso, control motion." },
    { id: "ex_086", label: "Romanian Deadlift", muscleGroups: ["Hamstrings", "Glutes", "Lower Back"], type: "compound", equipment: "Barbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 14, instructions: "Keep legs slightly bent, lower bar slowly along legs, return to start." },
    { id: "ex_088", label: "Cable Kickback", muscleGroups: ["Glutes"], type: "isolation", equipment: "Cable Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Attach ankle strap, push leg back fully, control motion." },
    { id: "ex_089", label: "Donkey Kick", muscleGroups: ["Glutes"], type: "isolation", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 5, instructions: "On hands and knees, push one leg up toward ceiling, return slowly." },
    { id: "ex_090", label: "Step-Up", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Step onto elevated platform with one leg, drive through heel, return down." },
    { id: "ex_091", label: "Weighted Step-Up", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Hold dumbbells, step onto platform, push through heel to stand tall." },
    { id: "ex_092", label: "Side Lunge", muscleGroups: ["Quads", "Glutes", "Adductors"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Step sideways into lunge, keep opposite leg straight, return to start." },
    { id: "ex_093", label: "Curtsy Lunge", muscleGroups: ["Glutes", "Quads"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Step one leg diagonally behind, lower into lunge, return upright." },
    { id: "ex_094", label: "Cable Glute Abduction", muscleGroups: ["Glutes", "Hip Abductors"], type: "isolation", equipment: "Cable Machine", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Attach ankle strap, move leg outward against cable resistance." },
    { id: "ex_095", label: "Hip Abductor Machine", muscleGroups: ["Glutes", "Hip Abductors"], type: "isolation", equipment: "Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Push outward against pads, control movement back." },
    { id: "ex_096", label: "Single-Leg Romanian Deadlift", muscleGroups: ["Hamstrings", "Glutes", "Lower Back"], type: "compound", equipment: "Dumbbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Hinge at hips with one leg raised behind, keep back straight." },
    { id: "ex_097", label: "Stepmill Climb", muscleGroups: ["Quads", "Glutes", "Calves"], type: "compound", equipment: "Stairmill", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 12, instructions: "Step continuously on machine, maintain steady pace." },
    { id: "ex_098", label: "Jump Squat", muscleGroups: ["Quads", "Glutes", "Calves"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 10, instructions: "Perform squat and explode upward, land softly." },
    { id: "ex_099", label: "Broad Jump", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 12, instructions: "Jump forward as far as possible, land safely." },
    { id: "ex_100", label: "Burpees", muscleGroups: ["Chest", "Triceps", "Quads", "Glutes", "Core"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 15, instructions: "Drop to push-up position, perform push-up, jump up explosively." },
    { id: "ex_101", label: "Dumbbell Chest Press on Stability Ball", muscleGroups: ["Chest", "Triceps", "Front Delts", "Core"], type: "compound", equipment: "Dumbbells + Stability Ball", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Lie back on the stability ball, feet flat on floor, press dumbbells upward, keep core engaged." },
    { id: "ex_102", label: "Single-Leg Glute Bridge", muscleGroups: ["Glutes", "Hamstrings", "Core"], type: "isolation", equipment: "Bodyweight", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 8, instructions: "Lie on back, lift one leg, push hips upward with other leg, squeeze glutes at top." },
    { id: "ex_103", label: "Dumbbell Lateral Lunge to Curtsy Lunge", muscleGroups: ["Quads", "Glutes", "Adductors", "Hamstrings"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Step laterally holding dumbbells, then perform a curtsy lunge with same leg, return to start." },
    { id: "ex_104", label: "Medicine Ball Slams", muscleGroups: ["Abs", "Shoulders", "Back", "Arms"], type: "compound", equipment: "Medicine Ball", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 14, instructions: "Raise medicine ball overhead and slam it to the ground with force, squat to catch it, repeat." },
    { id: "ex_105", label: "TRX Inverted Row", muscleGroups: ["Back", "Biceps", "Rear Delts", "Core"], type: "compound", equipment: "TRX Suspension Trainer", mechanic: "pull", level: "intermediate", isBodyweight: true, kCalBurned: 10, instructions: "Hold TRX handles, lean back, pull chest toward handles while keeping body straight." },
    { id: "ex_106", label: "Kettlebell Russian Swing", muscleGroups: ["Glutes", "Hamstrings", "Shoulders", "Core"], type: "compound", equipment: "Kettlebell", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Swing kettlebell between legs and up to shoulder height, using hip drive, keep core tight." },
    { id: "ex_107", label: "Chest Press Machine", muscleGroups: ["Chest", "Triceps", "Front Delts"], type: "compound", equipment: "Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 10, instructions: "Sit on machine, press handles forward, control return." },
    { id: "ex_108", label: "Leg Curl Machine", muscleGroups: ["Hamstrings"], type: "isolation", equipment: "Machine", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Curl legs back slowly, control the weight." },
    { id: "ex_109", label: "Smith Machine Squat", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Smith Machine", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 14, instructions: "Keep feet shoulder-width, descend slowly, push through heels." },
    { id: "ex_110", label: "Hack Squat Machine", muscleGroups: ["Quads", "Glutes"], type: "compound", equipment: "Hack Squat Machine", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 14, instructions: "Keep back flat against pad, push platform with legs." },
    { id: "ex_111", label: "Dumbbell Fly on Flat Bench", muscleGroups: ["Chest"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Bring dumbbells together above chest, slight elbow bend." },
    { id: "ex_112", label: "Dumbbell Fly on Incline Bench", muscleGroups: ["Chest", "Front Delts"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Perform fly motion on incline bench, squeeze chest at top." },
    { id: "ex_113", label: "Barbell Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Barbell", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Keep elbows tight to torso, curl barbell up, control down." },
    { id: "ex_114", label: "Preacher Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "EZ Bar or Dumbbell", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Use preacher bench, curl weight up slowly, control return." },
    { id: "ex_115", label: "Incline Barbell Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Barbell", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Sit on incline bench, curl barbell while keeping elbows back." },
    { id: "ex_116", label: "Cable Bicep Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Cable Machine", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Curl cable handle toward shoulder, keep elbows pinned." },
    { id: "ex_117", label: "Barbell Rows", muscleGroups: ["Back", "Lats", "Rear Delts"], type: "compound", equipment: "Barbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Hinge at hips, row barbell to abdomen, keep back flat." },
    { id: "ex_118", label: "Dumbbell Rows", muscleGroups: ["Back", "Lats", "Rear Delts"], type: "compound", equipment: "Dumbbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Row one dumbbell at a time toward torso, keep back flat." },
    { id: "ex_119", label: "Lat Pulldown (Wide Grip)", muscleGroups: ["Lats", "Biceps"], type: "compound", equipment: "Lat Pulldown Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Pull bar to chest, elbows wide, control return." },
    { id: "ex_120", label: "Lat Pulldown (Close Grip)", muscleGroups: ["Lats", "Biceps"], type: "compound", equipment: "Lat Pulldown Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Pull bar to chest, elbows tucked, control return." },
    { id: "ex_121", label: "Cable Face Pull", muscleGroups: ["Rear Delts", "Traps"], type: "isolation", equipment: "Cable Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Pull rope to face, keep elbows high, squeeze rear delts." },
    { id: "ex_122", label: "Dumbbell Rear Delt Fly", muscleGroups: ["Rear Delts"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Bend forward slightly, lift dumbbells laterally, slight elbow bend." },
    { id: "ex_123", label: "Kettlebell Swing", muscleGroups: ["Glutes", "Hamstrings", "Core", "Shoulders"], type: "compound", equipment: "Kettlebell", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Swing kettlebell using hip drive, keep core tight." },
    { id: "ex_124", label: "Clean and Press", muscleGroups: ["Full Body"], type: "compound", equipment: "Barbell", mechanic: "push", level: "advanced", isBodyweight: false, kCalBurned: 18, instructions: "Lift barbell from floor to shoulders, press overhead in one motion." },
    { id: "ex_125", label: "Snatch", muscleGroups: ["Full Body"], type: "compound", equipment: "Barbell", mechanic: "pull", level: "advanced", isBodyweight: false, kCalBurned: 20, instructions: "Explosively lift barbell overhead in one motion, maintain form." },
    { id: "ex_126", label: "Walking Lunge", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Bodyweight / Dumbbells", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 10, instructions: "Step forward into a lunge, push through heel to stand, alternate legs." },
    { id: "ex_127", label: "Bulgarian Split Squat", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Dumbbells / Bodyweight", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Rear foot elevated, lower back knee to floor, drive through front heel." },
    { id: "ex_128", label: "Glute Bridge", muscleGroups: ["Glutes", "Hamstrings"], type: "isolation", equipment: "Bodyweight / Barbell", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 6, instructions: "Lie on back, drive hips up, squeeze glutes at top." },
    { id: "ex_129", label: "Hip Thrust", muscleGroups: ["Glutes", "Hamstrings"], type: "compound", equipment: "Barbell / Bodyweight", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Back on bench, barbell on hips, thrust hips upward, squeeze glutes." },
    { id: "ex_130", label: "Step-Ups", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Bodyweight / Dumbbells", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Step onto platform, drive through heel, alternate legs." },
    { id: "ex_131", label: "Incline Bench Press", muscleGroups: ["Chest", "Front Delts", "Triceps"], type: "compound", equipment: "Barbell / Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Press weight up from incline bench, control descent." },
    { id: "ex_132", label: "Decline Bench Press", muscleGroups: ["Chest", "Front Delts", "Triceps"], type: "compound", equipment: "Barbell / Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Press weight up from decline bench, control descent." },
    { id: "ex_133", label: "Push-Ups", muscleGroups: ["Chest", "Triceps", "Front Delts"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Lower chest to floor, push back up, keep body straight." },
    { id: "ex_134", label: "Diamond Push-Ups", muscleGroups: ["Triceps", "Chest"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 9, instructions: "Hands form diamond under chest, lower and push up." },
    { id: "ex_135", label: "Overhead Press", muscleGroups: ["Shoulders", "Triceps"], type: "compound", equipment: "Barbell / Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Press weight overhead, keep core tight, control descent." },
    { id: "ex_136", label: "Lateral Raises", muscleGroups: ["Lateral Delts"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Raise arms to side, slight elbow bend, lower slowly." },
    { id: "ex_137", label: "Front Raises", muscleGroups: ["Front Delts"], type: "isolation", equipment: "Dumbbells", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Raise dumbbells in front to shoulder height, lower slowly." },
    { id: "ex_138", label: "Arnold Press", muscleGroups: ["Shoulders", "Triceps"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 9, instructions: "Rotate dumbbells while pressing overhead, control return." },
    { id: "ex_139", label: "Pull-Ups", muscleGroups: ["Lats", "Biceps", "Rear Delts"], type: "compound", equipment: "Bodyweight / Pull-Up Bar", mechanic: "pull", level: "intermediate", isBodyweight: true, kCalBurned: 10, instructions: "Pull body up until chin passes bar, lower slowly." },
    { id: "ex_140", label: "Chin-Ups", muscleGroups: ["Biceps", "Lats"], type: "compound", equipment: "Bodyweight / Pull-Up Bar", mechanic: "pull", level: "intermediate", isBodyweight: true, kCalBurned: 10, instructions: "Palms facing you, pull body up, lower slowly." },
    { id: "ex_141", label: "Inverted Rows", muscleGroups: ["Back", "Rear Delts", "Biceps"], type: "compound", equipment: "Bodyweight / Bar", mechanic: "pull", level: "beginner", isBodyweight: true, kCalBurned: 7, instructions: "Pull chest to bar while keeping body straight, lower slowly." },
    { id: "ex_142", label: "Seated Cable Row", muscleGroups: ["Back", "Lats", "Biceps"], type: "compound", equipment: "Cable Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Pull handle to abdomen, squeeze back, control return." },
    { id: "ex_143", label: "Plank", muscleGroups: ["Core"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 3, instructions: "Hold body in straight line on elbows/toes, keep core tight." },
    { id: "ex_144", label: "Side Plank", muscleGroups: ["Obliques", "Core"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 3, instructions: "Support body on side elbow and feet, hold position." },
    { id: "ex_145", label: "Russian Twist", muscleGroups: ["Obliques", "Core"], type: "isolation", equipment: "Bodyweight / Medicine Ball", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 5, instructions: "Twist torso side to side while seated, feet off ground." },
    { id: "ex_146", label: "Hanging Leg Raises", muscleGroups: ["Core", "Hip Flexors"], type: "isolation", equipment: "Pull-Up Bar", mechanic: "static", level: "intermediate", isBodyweight: true, kCalBurned: 6, instructions: "Hang from bar, lift legs to 90°, lower slowly." },
    { id: "ex_147", label: "Barbell Bicep Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Barbell", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Curl barbell up, keep elbows close to body, lower slowly." },
    { id: "ex_148", label: "Dumbbell Bicep Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Dumbbells", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Curl dumbbells alternately or together, control movement." },
    { id: "ex_149", label: "Hammer Curl", muscleGroups: ["Biceps", "Brachialis"], type: "isolation", equipment: "Dumbbells", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Palms face each other, curl dumbbells up, lower slowly." },
    { id: "ex_150", label: "Concentration Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Dumbbell", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 5, instructions: "Sit, curl dumbbell with elbow on thigh, squeeze at top." },
    { id: "ex_151", label: "Tricep Dips", muscleGroups: ["Triceps", "Chest"], type: "compound", equipment: "Bodyweight / Bench", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 7, instructions: "Lower body by bending elbows, push back up." },
    { id: "ex_152", label: "Overhead Tricep Extension", muscleGroups: ["Triceps"], type: "isolation", equipment: "Dumbbell / Cable", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Extend weight overhead, lower behind head, lift slowly." },
    { id: "ex_153", label: "Tricep Kickback", muscleGroups: ["Triceps"], type: "isolation", equipment: "Dumbbell", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Lean forward, extend dumbbell behind, squeeze tricep, return slowly." },
    { id: "ex_154", label: "Wrist Curl", muscleGroups: ["Forearms"], type: "isolation", equipment: "Barbell / Dumbbell", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 4, instructions: "Curl wrists upward, control weight down." },
    { id: "ex_155", label: "Reverse Wrist Curl", muscleGroups: ["Forearms"], type: "isolation", equipment: "Barbell / Dumbbell", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 4, instructions: "Curl wrists upward with palms down, lower slowly." },
    { id: "ex_156", label: "Standing Calf Raise", muscleGroups: ["Calves"], type: "isolation", equipment: "Bodyweight / Dumbbell", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 5, instructions: "Raise heels as high as possible, lower slowly." },
    { id: "ex_157", label: "Seated Calf Raise", muscleGroups: ["Calves"], type: "isolation", equipment: "Machine / Dumbbell on knees", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 5, instructions: "Raise heels while seated, lower under control." },
    { id: "ex_158", label: "Lat Pulldown", muscleGroups: ["Lats", "Biceps"], type: "compound", equipment: "Cable Machine", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 9, instructions: "Pull bar to chest, squeeze lats, control return." },
    { id: "ex_159", label: "Single-Arm Dumbbell Row", muscleGroups: ["Back", "Lats", "Biceps"], type: "compound", equipment: "Dumbbell / Bench", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 8, instructions: "Row dumbbell to waist, keep back flat, lower slowly." },
    { id: "ex_160", label: "Chest Fly", muscleGroups: ["Chest"], type: "isolation", equipment: "Dumbbells / Cable", mechanic: "static", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Arms open wide, bring hands together above chest." },
    { id: "ex_161", label: "Cable Crossover", muscleGroups: ["Chest"], type: "isolation", equipment: "Cable Machine", mechanic: "static", level: "intermediate", isBodyweight: false, kCalBurned: 7, instructions: "Pull handles together at chest level, squeeze, return slowly." },
    { id: "ex_162", label: "Plank", muscleGroups: ["Abs", "Core"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 3, instructions: "Hold body straight on elbows and toes, engage core." },
    { id: "ex_163", label: "Side Plank", muscleGroups: ["Obliques", "Core"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "intermediate", isBodyweight: true, kCalBurned: 3, instructions: "Support body on one elbow/foot, keep straight line." },
    { id: "ex_164", label: "Hanging Knee Raise", muscleGroups: ["Abs", "Hip Flexors"], type: "isolation", equipment: "Pull-up Bar", mechanic: "pull", level: "intermediate", isBodyweight: true, kCalBurned: 5, instructions: "Hang, lift knees to chest, lower slowly." },
    { id: "ex_165", label: "Hanging Leg Raise", muscleGroups: ["Abs", "Hip Flexors"], type: "isolation", equipment: "Pull-up Bar", mechanic: "pull", level: "advanced", isBodyweight: true, kCalBurned: 6, instructions: "Hang, lift straight legs to parallel or higher, lower slowly." },
    { id: "ex_166", label: "Bicycle Crunch", muscleGroups: ["Abs", "Obliques"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 4, instructions: "Alternate elbow to opposite knee while pedaling legs." },
    { id: "ex_167", label: "Russian Twist", muscleGroups: ["Obliques", "Abs"], type: "isolation", equipment: "Bodyweight / Medicine Ball", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 4, instructions: "Twist torso side to side, keep legs lifted." },
    { id: "ex_168", label: "Kettlebell Swing", muscleGroups: ["Glutes", "Hamstrings", "Back"], type: "compound", equipment: "Kettlebell", mechanic: "push/pull", level: "intermediate", isBodyweight: false, kCalBurned: 12, instructions: "Swing kettlebell from hips, control on return." },
    { id: "ex_169", label: "Burpee", muscleGroups: ["Full Body"], type: "compound", equipment: "Bodyweight", mechanic: "push/pull", level: "beginner", isBodyweight: true, kCalBurned: 10, instructions: "Squat, jump to plank, push-up, jump up." },
    { id: "ex_170", label: "Mountain Climbers", muscleGroups: ["Core", "Cardio"], type: "compound", equipment: "Bodyweight", mechanic: "pull/push", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Alternate knees to chest in plank position quickly." },
    { id: "ex_171", label: "Medicine Ball Slam", muscleGroups: ["Full Body", "Abs"], type: "compound", equipment: "Medicine Ball", mechanic: "push/pull", level: "intermediate", isBodyweight: false, kCalBurned: 9, instructions: "Lift ball overhead, slam to ground, catch, repeat." },
    { id: "ex_172", label: "Weighted Pull-up", muscleGroups: ["Back", "Biceps"], type: "compound", equipment: "Pull-up Bar + Weight", mechanic: "pull", level: "advanced", isBodyweight: false, kCalBurned: 10, instructions: "Perform pull-up with additional weight for resistance." },
    { id: "ex_173", label: "One-Arm Dumbbell Row", muscleGroups: ["Back", "Lats", "Biceps"], type: "compound", equipment: "Dumbbell / Bench", mechanic: "pull", level: "advanced", isBodyweight: false, kCalBurned: 8, instructions: "Row dumbbell with one arm, stabilize torso, control movement." },
    { id: "ex_174", label: "Incline Dumbbell Bench Press", muscleGroups: ["Chest", "Triceps", "Front Delts"], type: "compound", equipment: "Dumbbells / Bench", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 9, instructions: "Press dumbbells up on incline, control on lowering." },
    { id: "ex_175", label: "Bulgarian Split Squat", muscleGroups: ["Quads", "Glutes"], type: "compound", equipment: "Bodyweight / Dumbbell", mechanic: "push", level: "intermediate", isBodyweight: true, kCalBurned: 8, instructions: "Rear foot elevated, squat down on front leg, push up." },
    { id: "ex_176", label: "Pistol Squat", muscleGroups: ["Quads", "Glutes"], type: "compound", equipment: "Bodyweight", mechanic: "push", level: "advanced", isBodyweight: true, kCalBurned: 10, instructions: "Single-leg squat with other leg extended forward." },
    { id: "ex_177", label: "Walking Lunge", muscleGroups: ["Quads", "Glutes", "Hamstrings"], type: "compound", equipment: "Bodyweight / Dumbbells", mechanic: "push", level: "beginner", isBodyweight: true, kCalBurned: 8, instructions: "Step forward into lunge, push off, continue walking." },
    { id: "ex_178", label: "Hip Thrust", muscleGroups: ["Glutes", "Hamstrings"], type: "compound", equipment: "Barbell / Bench", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 9, instructions: "Place upper back on bench, thrust hips upward, squeeze glutes." },
    { id: "ex_179", label: "Glute Kickback (Cable)", muscleGroups: ["Glutes"], type: "isolation", equipment: "Cable Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 4, instructions: "Attach ankle strap, kick leg back slowly, control return." },
    { id: "ex_180", label: "Romanian Deadlift", muscleGroups: ["Hamstrings", "Glutes", "Back"], type: "compound", equipment: "Barbell / Dumbbells", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 10, instructions: "Hinge at hips, keep back straight, lower weight, squeeze glutes to stand." },
    { id: "ex_181", label: "Leg Curl (Machine)", muscleGroups: ["Hamstrings"], type: "isolation", equipment: "Leg Curl Machine", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Curl legs toward glutes slowly, control on return." },
    { id: "ex_182", label: "Cable Chest Fly", muscleGroups: ["Chest"], type: "isolation", equipment: "Cable Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Pull cables together at chest height, control return." },
    { id: "ex_183", label: "Decline Dumbbell Bench Press", muscleGroups: ["Chest", "Triceps"], type: "compound", equipment: "Dumbbells / Bench", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 9, instructions: "Press dumbbells up on decline bench, control lowering." },
    { id: "ex_184", label: "Chest Press (Machine)", muscleGroups: ["Chest", "Triceps"], type: "compound", equipment: "Chest Press Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 8, instructions: "Push handles forward, return slowly, maintain control." },
    { id: "ex_185", label: "Dumbbell Lateral Raise", muscleGroups: ["Shoulders", "Lateral Delts"], type: "isolation", equipment: "Dumbbells", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Raise dumbbells sideways to shoulder height, control down." },
    { id: "ex_186", label: "Arnold Press", muscleGroups: ["Shoulders", "Front Delts"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 7, instructions: "Rotate dumbbells while pressing overhead." },
    { id: "ex_187", label: "Face Pull (Cable)", muscleGroups: ["Rear Delts", "Traps"], type: "isolation", equipment: "Cable Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Pull rope to face level, elbows high, control return." },
    { id: "ex_188", label: "Barbell Bicep Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Barbell", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Curl bar up, keep elbows tight, control down." },
    { id: "ex_189", label: "Hammer Curl (Dumbbell)", muscleGroups: ["Biceps", "Forearms"], type: "isolation", equipment: "Dumbbells", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Curl dumbbells with neutral grip, control down." },
    { id: "ex_190", label: "Triceps Pushdown (Cable)", muscleGroups: ["Triceps"], type: "isolation", equipment: "Cable Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Push rope or bar down until arms fully extended, control return." },
    { id: "ex_191", label: "Overhead Triceps Extension", muscleGroups: ["Triceps"], type: "isolation", equipment: "Dumbbell / Cable", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Extend arms overhead, lower behind head slowly, control return." },
    { id: "ex_192", label: "Pallof Press", muscleGroups: ["Core", "Obliques"], type: "isolation", equipment: "Cable Machine / Band", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 4, instructions: "Press handle/band straight in front, resist rotation, control back." },
    { id: "ex_193", label: "Ab Wheel Rollout", muscleGroups: ["Abs", "Core"], type: "isolation", equipment: "Ab Wheel", mechanic: "pull/push", level: "advanced", isBodyweight: true, kCalBurned: 7, instructions: "Roll forward on wheel, maintain straight back, return slowly." },
    { id: "ex_194", label: "Side Crunch", muscleGroups: ["Obliques"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "beginner", isBodyweight: true, kCalBurned: 3, instructions: "Lie on side, crunch torso toward hips, lower slowly." },
    { id: "ex_195", label: "Single-Leg Romanian Deadlift (Dumbbell)", muscleGroups: ["Hamstrings", "Glutes"], type: "compound", equipment: "Dumbbells", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 8, instructions: "Hinge at one hip, lower dumbbell while balancing, squeeze glutes to stand." },
    { id: "ex_196", label: "Step-Up (Weighted)", muscleGroups: ["Glutes", "Quads", "Hamstrings"], type: "compound", equipment: "Dumbbells / Step", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 7, instructions: "Step onto elevated surface, drive through heel, control down." },
    { id: "ex_197", label: "Cable Pull-Through", muscleGroups: ["Glutes", "Hamstrings"], type: "compound", equipment: "Cable Machine", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 7, instructions: "Stand facing away from cable, pull rope between legs by hinging at hips, squeeze glutes." },
    { id: "ex_198", label: "Incline Cable Fly", muscleGroups: ["Upper Chest"], type: "isolation", equipment: "Cable Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 6, instructions: "Set cables low, bring hands up together, control return." },
    { id: "ex_199", label: "Dumbbell Floor Press", muscleGroups: ["Chest", "Triceps"], type: "compound", equipment: "Dumbbells", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 7, instructions: "Lie on floor, press dumbbells up, control down to floor." },
    { id: "ex_200", label: "Cable Lateral Raise", muscleGroups: ["Shoulders", "Lateral Delts"], type: "isolation", equipment: "Cable Machine", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 5, instructions: "Lift cable to side, elbow slightly bent, control down." },
    { id: "ex_201", label: "Dumbbell Front Raise", muscleGroups: ["Front Delts"], type: "isolation", equipment: "Dumbbells", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Raise dumbbells in front to shoulder height, control down." },
    { id: "ex_202", label: "Seated Overhead Press (Machine)", muscleGroups: ["Shoulders", "Triceps"], type: "compound", equipment: "Shoulder Press Machine", mechanic: "push", level: "beginner", isBodyweight: false, kCalBurned: 7, instructions: "Press handles overhead, control back to start." },
    { id: "ex_203", label: "Cable Bicep Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Cable Machine", mechanic: "pull", level: "beginner", isBodyweight: false, kCalBurned: 5, instructions: "Curl cable toward shoulders, control slowly." },
    { id: "ex_204", label: "Incline Dumbbell Curl", muscleGroups: ["Biceps"], type: "isolation", equipment: "Dumbbells / Bench", mechanic: "pull", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Curl while leaning back on incline bench, control down." },
    { id: "ex_205", label: "Skullcrusher (EZ Bar)", muscleGroups: ["Triceps"], type: "isolation", equipment: "EZ Bar / Bench", mechanic: "push", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Lower bar toward forehead, extend elbows to press up." },
    { id: "ex_206", label: "Hanging Knee Raise", muscleGroups: ["Abs", "Hip Flexors"], type: "isolation", equipment: "Pull-Up Bar", mechanic: "pull", level: "intermediate", isBodyweight: true, kCalBurned: 5, instructions: "Hang from bar, raise knees toward chest, control down." },
    { id: "ex_207", label: "Cable Woodchopper", muscleGroups: ["Obliques", "Core"], type: "isolation", equipment: "Cable Machine", mechanic: "rotation", level: "intermediate", isBodyweight: false, kCalBurned: 6, instructions: "Pull cable across body in chopping motion, control return." },
    { id: "ex_208", label: "Plank with Shoulder Tap", muscleGroups: ["Core", "Shoulders"], type: "isolation", equipment: "Bodyweight", mechanic: "static", level: "intermediate", isBodyweight: true, kCalBurned: 4, instructions: "Hold plank, tap opposite shoulder with hand, maintain hips stable." },
    { id: "ex_209", label: "Russian Twist (Weighted)", muscleGroups: ["Obliques", "Core"], type: "isolation", equipment: "Medicine Ball / Dumbbell", mechanic: "rotation", level: "intermediate", isBodyweight: true, kCalBurned: 5, instructions: "Sit on floor, twist torso side to side with weight, feet lifted or grounded." },

];

