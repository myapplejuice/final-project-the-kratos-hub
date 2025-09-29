import { activityOptions } from "../helper-functions/global-options";
import { goalOptions, bmiClasses, bodyFatRanges } from "../helper-functions/global-options";

function unique(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function homeGreetingText() {
    const date = new Date();
    const hour = date.getHours();
    const month = date.getMonth();

    // Detect season
    let season = "winter";
    if ([2, 3, 4].includes(month)) season = "spring";
    else if ([5, 6, 7].includes(month)) season = "summer";
    else if ([8, 9, 10].includes(month)) season = "autumn";

    let text = "Hello";
    let emoji = "👋";

    // Time slots (text fixed)
    if (hour >= 5 && hour < 8) {
        text = "Rise and shine";
    } else if (hour >= 8 && hour < 12) {
        text = "Good morning";
    } else if (hour >= 12 && hour < 17) {
        text = "Good afternoon";
    } else if (hour >= 17 && hour < 20) {
        text = "Good evening";
    } else if (hour >= 20 && hour < 23) {
        text = "Enjoying the night?";
    } else {
        text = "Good night";
    }

    // Seasonal emoji sets
    const seasonalEmojis = {
        spring: {
            morningEarly: "🌸",
            morning: "🌼",
            afternoon: "🌞",
            evening: "🌇",
            night: "🌙",
            lateNight: "🌌"
        },
        summer: {
            morningEarly: "🌄",
            morning: "☀️",
            afternoon: "🏖️",
            evening: "🌇",
            night: "🌙",
            lateNight: "🌌"
        },
        autumn: {
            morningEarly: "🍂",
            morning: "🍁",
            afternoon: "☀️",
            evening: "🌆",
            night: "🌙",
            lateNight: "🌌"
        },
        winter: {
            morningEarly: "❄️",
            morning: "☀️",
            afternoon: "☃️",
            evening: "🌇",
            night: "🌙",
            lateNight: "🌌"
        }
    };

    // Pick emoji by season + time
    let timeKey = "lateNight";
    if (hour >= 5 && hour < 8) timeKey = "morningEarly";
    else if (hour >= 8 && hour < 12) timeKey = "morning";
    else if (hour >= 12 && hour < 17) timeKey = "afternoon";
    else if (hour >= 17 && hour < 20) timeKey = "evening";
    else if (hour >= 20 && hour < 23) timeKey = "night";

    emoji = seasonalEmojis[season][timeKey];

    const emojiColorMap = {
        "🌄": "#FFD36E4b",
        "☀️": "#FFEB3B4b",
        "🌞": "#FFC1074b",
        "🌇": "#FF70434b",
        "🌆": "#FF8A654b",
        "🌙": "#90CAF94b",
        "🌌": "#5C6BC04b",
        "👋": "#B0BEC54b",
        "🌸": "#FFB6C14b",
        "🌼": "#FFF1764b",
        "🍂": "#FF8C004b",
        "🍁": "#D2691E4b",
        "❄️": "#B3E5FC4b",
        "☃️": "#E1F5FE4b",
        "🏖️": "#ffd0804b"
    };

    const color = emojiColorMap[emoji] || "#B0BEC54b";

    return [text, emoji];
}

export function homeIntroText() {
    const hour = new Date().getHours();

    const messages = {
        earlyMorning: [
            "New day, new opportunities - what's first on your list?",
            "A fresh start! Let's tackle today's goals.",
            "Small steps lead to big results - what's first on your list?",
            "Consistency is key - what's your first action today?",
            "Today is another chance to move closer to your goals - seize it!",
            "The day is yours to seize - what's your first move?"
        ],
        morning: [
            "What's on the agenda for today? Let's get moving!",
            "How's your training been? Time to check in on your progress!",
            "We hope you're having a wonderful day! Ready to crush your goals?",
            "Let's get to work! Every step counts!"
        ],
        afternoon: [
            "What's your focus today - workout, meals, or both?",
            "Keep up the momentum! Today is yours to conquer!",
            "Time to make progress! What's on your schedule?",
            "Ready to level up your day? Let's go!"
        ],
        evening: [
            "How are you feeling today? Let's make it productive!",
            "Your health, your rules - what's first on the agenda?",
            "Feeling motivated? Time to log your progress!",
            "Let's make today count - what's on the plan?"
        ],
        night: [
            "Great work today - take a moment to appreciate your progress!",
            "Unwind and recharge - tomorrow is another chance to grow.",
            "Reflect on your wins today, no matter how small.",
            "Rest well, you've earned it - your journey continues tomorrow."
        ]
    };

    let bucket = "morning";
    if (hour >= 5 && hour < 8) bucket = "earlyMorning";
    else if (hour >= 8 && hour < 12) bucket = "morning";
    else if (hour >= 12 && hour < 17) bucket = "afternoon";
    else if (hour >= 17 && hour < 21) bucket = "evening";
    else bucket = "night";

    const pool = messages[bucket];
    return pool[Math.floor(Math.random() * pool.length)];
}

export function homeStatsTabsText() {
    const messages = [
        "Understand the numbers that drive your progress",
        "Your body, your health - learn more below!",
        "Discover key insights about your body",
        "Your essential fitness metrics, explained below",
        "Tap a stat to dive deeper into your health",
        "Explore what these metrics mean for your fitness journey",

        "These stats are your playbook - master them to master your goals!",
        "Your progress is written in these metrics - check them out!",
        "Want better results? Start by knowing your numbers",
        "Your fitness journey starts with understanding your stats",

        "Learn more about your core health stats below",
        "Explore evidence-based insights about your body",
        "Track the science behind your health and performance",
        "Your metabolic and body composition metrics, tap to learn below!",
        "Numbers matter - see what yours reveal",

        "Curious what these numbers mean? Tap to learn more!",
        "Here's a quick breakdown of your key stats, tap to learn more!",
        "Ever wondered what these metrics say about you?",
        "Your fitness story, told in numbers, tap below!",
        "Stats don't lie - let's see what yours say..."
    ];

    return messages[Math.floor(Math.random() * messages.length)];
}

export function homeBottomTabsText() {
    const goalsMessages = [
        "Have you updated your metrics today to stay on track?",
        "Check your BMI and see if it matches your goals!",
        "Log your weight to track your progress!",
        "Review your TDEE to adjust your intake - have you done it?",
        "Adjust your energy goals if your progress has plateaued!",
        "Set a new mini-goal for strength or endurance this week",
        "Are your height and weight metrics current? Update them!",
        "Small updates daily lead to big results - have you done yours?",
        "Reflect on your weekly progress and log your updates!",
        "Add a healthy habit today to support your metrics!",
        "Are your goals realistic and ready for the upcoming week?",
        "Fuel your progress by logging your activity now",
        "Check if your nutrition goal supports your target weight",
        "Celebrate your milestones - have you logged your achievements?" // add milestones and achievements later
    ];

    const loggerMessages = [
        "Log your meals now and keep your nutrition on track!",
        "Did you complete a workout today? Tap to log it!",
        "Track your activity to stay consistent - update your logs!",
        "Have you logged your breakfast, lunch, and dinner yet?",
        "Push yourself further - record a workout or meal!",
        "Keep your streak alive: log your meals and workouts!",
        "Stay consistent! Update your logs before the day ends",
        "Track your progress today - don't skip a log!",
        "Log a meal or workout to hold yourself accountable!",
        "Stay active! Tap to log your daily efforts",
        "Consistency pays off - have you entered your data?",
        "Did you adjust your exercise plan based on your energy today?",
        "Take a moment to log today's meals and exercises",
        "Record your actions - don't let your progress slip!",
        "Have you tapped to log your meals and workouts today?",
        "Adjust your energy intake if needed and log it!",
        "Record your meals, workouts, and water intake today",
        //"Did you rest and recover? Log it if you did!", <-- // add rest logging
        "Push yourself a little more than yesterday - log your activity!" // add time aware analytics
    ];


    const goalMessage = goalsMessages[Math.floor(Math.random() * goalsMessages.length)];
    const loggerMessage = loggerMessages[Math.floor(Math.random() * loggerMessages.length)];
    return { goalMessage, loggerMessage };
}

export function goalsActivityFeedbackText(user, num) {
    if (!user || !user.metrics) return [];

    const { bmi, bodyFat, activityLevel } = user.metrics;
    const feedbacks = [];

    // Determine BMI class
    const bmiClass = bmiClasses.find(c => {
        const sexRange = user.gender === "female" ? c.female : c.male;
        return bmi >= sexRange.min && bmi <= sexRange.max;
    })?.key || "normal";

    // Determine Body Fat class (male example)
    const bodyFatClass = bodyFatRanges.find(r => {
        const range = user.gender === "female" ? r.female : r.male;
        return bodyFat >= range.min && bodyFat <= range.max;
    })?.key || "average";

    // Determine activity level object from activityLevel
    const activity = activityOptions.find(a => a.key === activityLevel) || { level: 1 };

    // Activity-level feedback
    if (activity.level <= 2) {
        feedbacks.push(
            "You're low on activity - even small steps count!",
            "Try to move more today: a walk or light exercise helps.",
            "Consistency matters more than intensity - start small."
        );
    } else if (activity.level === 3) {
        feedbacks.push(
            "You're moderately active. Keep up the consistency!",
            "Strength and cardio together improve results.",
            "Monitor both activity and nutrition for best outcomes."
        );
    } else {
        feedbacks.push(
            "Excellent activity level! Make sure to recover properly.",
            "High activity means your body needs proper fuel.",
            "Track meals and rest to match your energy expenditure."
        );
    }

    // BMI/body fat combined feedback
    if (bmiClass === "overweight" || bmiClass.includes("obese")) {
        feedbacks.push("Be mindful of your BMI: combining proper diet and activity can improve health.");
    }

    if (bodyFatClass === "obese") {
        feedbacks.push(
            "Your body fat is high - focus on gradual, sustainable changes.",
            "Include both cardio and resistance training.",
            "Track progress visually to stay motivated."
        );
    } else if (bodyFatClass === "overweight") {
        feedbacks.push(
            "Slightly above ideal body fat - maintain healthy eating and consistent activity.",
            "Small daily changes add up over time.",
            "Slow, steady progress is better than extreme workouts."
        );
    } else if (bodyFatClass === "average") {
        feedbacks.push(
            "Body fat is moderate - keep monitoring nutrition and activity.",
            "Consistency helps maintain or improve composition."
        );
    } else if (bodyFatClass === "athletes" || bodyFatClass === "fitness") {
        feedbacks.push(
            "Healthy body fat - excellent work!",
            "Keep your consistent training and balanced diet.",
            "Consider setting a new performance goal to stay challenged."
        );
    } else if (bodyFatClass === "essentialFat") {
        feedbacks.push(
            "Body fat is very low - ensure proper fueling and recovery.",
            "Maintain strength and endurance safely."
        );
    }

    const shuffled = unique(feedbacks);
    return shuffled.slice(0, Math.min(num, shuffled.length));
}

export function goalsWeightGoalFeedbackText(user, num) {
    if (!user || !user.metrics || !user.nutrition?.goal) return [];

    const { bmi, bodyFat } = user.metrics;
    const goalKey = user.nutrition.goal;
    const feedbacks = [];

    // Determine BMI class
    const bmiClass = bmiClasses.find(c => {
        const sexRange = user.gender === "female" ? c.female : c.male;
        return bmi >= sexRange.min && bmi <= sexRange.max;
    })?.key || "normal";


    // Determine body fat class
    const bodyFatClass = bodyFatRanges.find(r => {
        const range = user.gender === "female" ? r.female : r.male;
        return bodyFat >= range.min && bodyFat <= range.max;
    })?.key || "average";

    // Goal-specific feedback
    switch (goalKey) {
        case "weightLoss":
            feedbacks.push(
                "Focus on an energy deficit while maintaining protein intake to preserve muscle mass.",
                "Consider combining moderate cardio with resistance training for effective fat loss.",
                "Track your meals and activity to ensure gradual and sustainable weight reduction.",
                "Small, consistent steps lead to long-term results - don't rush the process."
            );
            break;
        case "mildWeightLoss":
            feedbacks.push(
                "Slight energy adjustments can help you lose weight slowly and sustainably.",
                "Include regular activity and strength exercises to prevent muscle loss.",
                "Monitor your progress weekly to adjust your plan if needed."
            );
            break;
        case "maintain":
            feedbacks.push(
                "Focus on maintaining your current energy balance to sustain your weight.",
                "Regular physical activity will help you keep your current body composition.",
                "Track meals occasionally to stay aware of dietary patterns."
            );
            break;
        case "mildWeightGain":
            feedbacks.push(
                "Slight energy surplus will help you gain weight gradually.",
                "Strength training is key to gaining lean mass instead of fat.",
                "Monitor your weight weekly to avoid excessive fat gain."
            );
            break;
        case "weightGain":
            feedbacks.push(
                "Ensure an energy surplus combined with regular strength training to gain muscle.",
                "Focus on nutrient-dense foods to support healthy weight gain.",
                "Track your progress and adjust your energy intake as needed."
            );
            break;
    }

    // Optional: add BMI or body fat tips for extra context
    // Combined BMI/body fat feedback
    if (bmiClass === "overweight" || bmiClass.includes("obese") || bodyFatClass === "overweight" || bodyFatClass === "obese") {
        feedbacks.push(
            "Focus on gradual, sustainable changes to improve your health.",
            "Combine cardio and resistance training for effective results.",
            "Track your progress consistently to stay motivated."
        );
    } else if (bodyFatClass === "average") {
        feedbacks.push(
            "You're in a good state - maintain your healthy habits!",
            "Keep monitoring your nutrition and activity to stay on track.",
            "Small adjustments now can help prevent future issues."
        );
    } else {
        // Healthy categories: essentialFat, athletes, fitness, normal BMI
        feedbacks.push(
            "Excellent work! Keep up your consistent training and balanced diet.",
            "Maintain your current habits to sustain your health and performance.",
            "Consider setting new goals to challenge yourself and stay motivated."
        );
    }

    // Return a unique, limited list
    const uniqueFeedbacks = Array.from(new Set(feedbacks));
    return uniqueFeedbacks.slice(0, Math.min(num, uniqueFeedbacks.length));
}
export function goalsActivityTip(activityLevel) {
    const tipsPool = {
        sedentary: [
            "Did you know? Even short walks can boost energy and improve mood!",
            "Take the stairs instead of the elevator - small steps count!",
            "Consistency matters: start with 10 minutes of light activity daily!",
            "Stretching can reduce stiffness and improve posture, even at home!",
            "Did you know? Light daily movement can improve circulation and reduce fatigue!"
        ],
        lightlyActive: [
            "Short walks between work sessions can boost energy and focus!",
            "Did you know? Strength training 1-2 times a week helps maintain muscle mass!",
            "Try standing or walking breaks during sedentary tasks!",
            "Mix light cardio with stretching for better recovery and mobility!",
            "Did you know? Regular activity helps maintain bone density over time!"
        ],
        moderatelyActive: [
            "You're doing well! Combine strength and cardio for balanced fitness!",
            "Did you know? High-intensity bursts can improve endurance and metabolism!",
            "Track your steps or workouts to stay motivated!",
            "Adding 1-2 active rest days helps recovery and growth!",
            "Did you know? Consistent moderate activity can reduce stress and improve sleep quality!"
        ],
        veryActive: [
            "Excellent activity level! Make sure to recover properly!",
            "Fuel your body with protein and carbs to match your energy needs!",
            "Focus on mobility and flexibility to prevent injuries!",
            "Advanced workouts can be more effective with proper warm-ups!",
            "Did you know? Active people have better long-term cardiovascular health!"
        ],
        extraActive: [
            "Elite activity level! Recovery and sleep are just as important as training!",
            "Track energy and macros to match your high energy expenditure!",
            "Consider periodization in your training to maximize results!",
            "Hydration and micronutrients become critical at this level!",
            "Did you know? Elite-level training requires careful balance of effort and recovery!"
        ]
    };

    const tips = tipsPool[activityLevel] || ["Stay active daily - consistency is key!"];
    return tips[Math.floor(Math.random() * tips.length)];
}


export function goalsWeightGoalTip(goalKey) {
    const tipsPool = {
        weightLoss: [
            "Did you know? Maintaining protein intake preserves muscle mass while losing weight!",
            "Combine moderate cardio with strength training for effective fat loss!",
            "Track your meals and activity to ensure gradual and sustainable weight reduction!",
            "Small, consistent steps lead to long-term results - don't rush the process!",
            "Stay hydrated: water helps control hunger and supports metabolism!"
        ],
        mildWeightLoss: [
            "Slight energy adjustments can help you lose weight slowly and sustainably!",
            "Include regular activity and strength exercises to prevent muscle loss!",
            "Monitor your progress weekly to adjust your plan if needed!",
            "Did you know? Small, manageable changes in meals create lasting habits!",
            "Did you know? Mild energy deficits are easier to maintain long-term!"
        ],
        maintain: [
            "Focus on maintaining your current energy balance to sustain your weight!",
            "Regular physical activity helps preserve your current body composition!",
            "Track meals occasionally to stay aware of dietary patterns!",
            "Celebrate your consistency - maintaining weight is a win!",
            "Did you know? Weight maintenance requires both nutrition and activity balance!"
        ],
        mildWeightGain: [
            "Slight energy surplus helps you gain weight gradually!",
            "Strength training is key to gaining lean mass instead of fat!",
            "Monitor your weight weekly to avoid excessive fat gain!",
            "Focus on nutrient-dense foods to support healthy gains!",
            "Did you know? Slow weight gain ensures most of it is lean mass!"
        ],
        weightGain: [
            "Ensure an energy surplus combined with regular strength training to gain muscle!",
            "Prioritize protein and nutrient-rich foods for lean mass growth!",
            "Track your progress and adjust energy intake as needed!",
            "Avoid empty energy - focus on balanced, healthy weight gain!",
            "Did you know? Consistent strength training maximizes lean mass gain during weight gain!"
        ]
    };

    const selectedTips = tipsPool[goalKey] || ["Focus on balanced nutrition and consistent activity for healthy results!"];
    return selectedTips[Math.floor(Math.random() * selectedTips.length)];
}

export function goalsDietaryFeedbackTips(user, num = 3) {
    if (!user || !user.nutrition) return ["Follow a balanced nutrition plan consistently!"];

    const { diet, goal } = user.nutrition;
    const tipsPool = [];

    // General long-term advice
    tipsPool.push(
        "Stick to your macros over time rather than adjusting daily.",
        "Consistency beats perfection: follow your diet plan steadily.",
        "Avoid drastic changes - small, gradual adjustments are more effective.",
        "Focus on overall weekly trends rather than daily fluctuations."
    );

    // Tips based on diet type
    switch (diet) {
        case "highProtein":
            tipsPool.push(
                "Include a variety of protein sources to avoid monotony.",
                "Balance protein intake with enough carbs and fats for energy.",
                "Don't overemphasize protein at the expense of other nutrients."
            );
            break;
        case "lowCarb":
            tipsPool.push(
                "Prioritize fiber-rich vegetables to maintain digestion.",
                "Monitor energy levels - low carb may affect high-intensity workouts.",
                "Avoid excessive reliance on processed low-carb snacks."
            );
            break;
        case "lowFat":
            tipsPool.push(
                "Include healthy fats like avocado, nuts, and olive oil.",
                "Don't remove fats entirely - they're essential for hormone health.",
                "Balance low-fat intake with sufficient protein and carbs."
            );
            break;
        case "balanced":
            tipsPool.push(
                "Maintain equal focus on carbs, protein, and fats for sustained energy.",
                "Rotate food choices to ensure micronutrient diversity.",
                "Keep meals colorful to cover a broad spectrum of nutrients."
            );
            break;
        case "ketogenic":
            tipsPool.push(
                "Ensure adequate electrolyte intake (sodium, potassium, magnesium).",
                "Monitor fat sources to include unsaturated fats over saturated ones.",
                "Stay hydrated - ketogenic diets increase water loss."
            );
            break;
        case "custom":
            tipsPool.push(
                "Adjust macros carefully and track your progress.",
                "Consistency is key - avoid frequent drastic changes.",
                "Review your nutrition plan regularly and make informed tweaks."
            );
            break;
        default:
            tipsPool.push(
                "Follow your diet plan consistently and review progress weekly."
            );
    }

    tipsPool.push(
        "Track your meals consistently to stay on target.",
        "Logging even one meal a day helps maintain awareness of your intake."
    );

    tipsPool.push(
        "Aim to log all meals to get an accurate picture of your nutrition.",
        "Consistency in meal tracking improves diet adherence."
    );

    // Tips based on goal
    switch (goal) {
        case "weightLoss":
        case "mildWeightLoss":
            tipsPool.push(
                "Focus on nutrient-dense foods to stay full with fewer energy.",
                "Avoid skipping meals - consistent intake helps prevent overeating later."
            );
            break;
        case "weightGain":
        case "mildWeightGain":
            tipsPool.push(
                "Include energy-dense whole foods to support gradual gains.",
                "Combine protein with carbs in meals to maximize muscle growth."
            );
            break;
        case "maintain":
            tipsPool.push(
                "Track macros occasionally to maintain weight effectively.",
                "Focus on balanced meals rather than overcomplicating tracking."
            );
            break;
    }

    // Shuffle tips and pick up to `num` unique ones
    const shuffledTips = unique(tipsPool);
    return shuffledTips.slice(0, Math.min(num, shuffledTips.length));
}
