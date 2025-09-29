import { router, usePathname } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { Dimensions, Image, Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
import AnimatedButton from '../../components/screen-comps/animated-button';
import ProgressDots from "../../components/screen-comps/progress-dots";
import TextButton from "../../components/screen-comps/text-button";
import { useBackHandlerContext } from "../../common/contexts/back-handler-context";
import { UserContext } from "../../common/contexts/user-context";
import usePopups from "../../common/hooks/use-popups";
import {
    BMI, BMR, caloriesByGoal, TDEE, macrosFromCalories, bodyFat as calcBodyFat,
    proteinRequirementFromLBM, BMIByLeanMass, leanBodyMass as calcLeanBodyMass, recommendedWaterIntake as calcRecommendedWaterIntake
} from "../../common/utils/metrics-calculator";
import { convertHeight, convertWeight, convertFluid, convertEnergy } from "../../common/utils/unit-converter";
import { scaleFont } from "../../common/utils/scale-fonts";
import { routes } from "../../common/settings/constants";
import { colors, nutritionColors } from "../../common/settings/styling";
import { goalOptions, activityOptions, fluidUnits, dietOptions, weightUnits, energyUnits, heightUnits, defaultPreferences } from "../../common/utils/global-options"
import { Images } from "../../common/settings/assets";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import DeviceStorageService from "../../common/services/device-storage-service";
import AppText from "../../components/screen-comps/app-text";
import AppTextInput from "../../components/screen-comps/app-text-input";
import APIService from "../../common/services/api-service";
import AppScroll from "../../components/screen-comps/app-scroll";
import PercentageBar from "../../components/screen-comps/percentage-bar";

export default function Register() {
    const containerRef = useRef(0);
    const [container, setContainer] = useState(0);
    const { setUser } = useContext(UserContext);
    const { createDialog, createToast, createAlert, showSpinner, hideSpinner, createOptions } = usePopups();
    const { setBackHandler } = useBackHandlerContext();
    const stepTitles = {
        0: "Age & Gender",
        1: "Height",
        2: "Weight",
        3: "Activity Level",
        4: "Goal",
        5: "Water Intake",
        6: "Energy Intake",
        7: "Diet Type",
        8: "Personal Info"
    };

    // Metrics
    const [heightUnit, setHeightUnit] = useState("cm");
    const [weightUnit, setWeightUnit] = useState("kg");
    const [fluidUnit, setFluidUnit] = useState("ml");
    const [energyUnit, setEnergyUnit] = useState("kcal");
    const [heightCm, setHeightCm] = useState("");
    const [heightFt, setHeightFt] = useState("");
    const [heightIn, setHeightIn] = useState("");
    const [weightKg, setWeightKg] = useState("");
    const [weightLb, setWeightLb] = useState("");
    const [bmi, setBmi] = useState("");
    const [bmiByLeanMass, setBmiByLeanMass] = useState("");
    const [bmr, setBmr] = useState("");
    const [tdee, setTdee] = useState("");
    const [bodyFat, setBodyFat] = useState("");
    const [leanBodyMass, setLeanBodyMass] = useState('');
    const [activityLevel, setActivityLevel] = useState(null);
    const [goal, setGoal] = useState(null);
    const [recommendedEnergyKcal, setRecommendedEnergyKcal] = useState("");
    const [recommendedEnergyKj, setRecommendedEnergyKj] = useState("");
    const [energyKcal, setEnergyKcal] = useState("");
    const [energyKj, setEnergyKj] = useState("");
    const [waterMl, setWaterMl] = useState("");
    const [waterFloz, setWaterFloz] = useState("");
    const [waterCups, setWaterCups] = useState("");
    const [diet, setDiet] = useState(null);
    const [proteinRequirement, setProteinRequirement] = useState("");
    const [recommendedWaterIntake, setRecommendedWaterIntake] = useState("");
    const [carbRate, setCarbRate] = useState("");
    const [proteinRate, setProteinRate] = useState("");
    const [fatRate, setFatRate] = useState("");
    const [macrosGrams, setMacrosGrams] = useState({ carbs: 0, protein: 0, fat: 0 });

    // User info
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    useEffect(() => {
        setBackHandler(() => {
            if (containerRef.current > 0) {
                setContainer(containerRef.current - 1)
            }
            else
                createDialog({
                    title: "Registration",
                    text: "Are you sure you want to cancel registration?",
                    onConfirm: () => router.back()
                });
            return true;
        });
    }, []);

    useEffect(() => {
        containerRef.current = container;
    }, [container]);

    function handleHeightChangeMetric(cm) {
        if (cm === '') {
            setHeightCm("");
            setHeightFt("");
            setHeightIn("");
            return;
        }

        setHeightCm(cm);
        const { feet, inches } = convertHeight(Number(cm) || 0, 'cm', 'ft/in');
        setHeightFt(String(feet));
        setHeightIn(String(inches));
    }

    function handleHeightChangeUS(feet, inches) {
        if (feet === '' && inches === '') {
            setHeightFt("");
            setHeightIn("");
            setHeightCm("");
            return;
        }

        setHeightFt(feet);
        setHeightIn(inches);

        const cm = convertHeight({ feet: Number(feet) || 0, inches: Number(inches) || 0 }, 'ft/in', 'cm');
        setHeightCm(String(cm));
    }

    function handleWeightChange(value) {
        if (value === '') {
            setWeightKg("");
            setWeightLb("");
            return;
        }

        if (weightUnit === "kg") setWeightKg(value);
        else setWeightLb(value);

        const result = String(weightUnit === "kg" ? convertWeight(Number(value) || 0, 'kg', 'lb') : convertWeight(Number(value) || 0, 'lb', 'kg'));

        if (weightUnit === "kg") setWeightLb(result);
        else setWeightKg(result);
    }

    function handleWaterChange(value, unit) {
        // Keep the raw string so user can type decimal
        if (unit === "ml") setWaterMl(value);
        if (unit === "floz") setWaterFloz(value);
        if (unit === "cups") setWaterCups(value);

        if (value === '') {
            setWaterMl("");
            setWaterFloz("");
            setWaterCups("");
            return;
        }

        const numeric = Number(value) || 0;

        if (unit !== "ml") setWaterMl(String(convertFluid(numeric, unit, "ml")));
        if (unit !== "floz") setWaterFloz(String(convertFluid(numeric, unit, "floz")));
        if (unit !== "cups") setWaterCups(String(convertFluid(numeric, unit, "cups")));
    }

    function handleDietSelect(option) {
        if (option.key === 'custom') {
            const currentPreset = dietOptions.find(d => d.key === diet) || { carbRate: 40, proteinRate: 30, fatRate: 30 };
            setCarbRate(String(currentPreset.carbRate));
            setProteinRate(String(currentPreset.proteinRate));
            setFatRate(String(currentPreset.fatRate));
            setMacrosGrams(macrosFromCalories(energyKcal, 'custom', currentPreset.carbRate, currentPreset.proteinRate, currentPreset.fatRate));
            setDiet('custom');
        } else {
            setDiet(option.key);
            setCarbRate(String(option.carbRate));
            setProteinRate(String(option.proteinRate));
            setFatRate(String(option.fatRate));
            setMacrosGrams(macrosFromCalories(energyKcal, option.key, option.carbRate, option.proteinRate, option.fatRate));
        }
    }

    function handleEnergyChange(value) {
        if (value === '') {
            setEnergyKcal("");
            setEnergyKj("");
            return;
        }

        const numeric = Number(value) || 0;

        if (energyUnit === "kcal") {
            setEnergyKcal(String(numeric));
            setEnergyKj(String(convertEnergy(numeric, "kcal", "kj")));
        } else {
            setEnergyKj(String(numeric));
            setEnergyKcal(String(convertEnergy(numeric, "kj", "kcal")));
        }
    }

    function handleAdvance() {
        if (container === 0) { // Age
            if (!gender)
                return createToast({ message: "Select a gender & enter age!" });

            const numericAge = Number(age);
            if (!age || isNaN(numericAge) || numericAge < 5 || numericAge > 120) {
                return createToast({ message: "Enter a valid age (5-120)!" });
            }

        }
        else if (container === 1) { // Height
            if (!heightCm || (heightUnit === "ft/in" && (!heightFt || !heightIn)))
                return createToast({ message: "Enter your height!" });

            if (heightUnit === "cm") {
                const hCm = Number(heightCm);
                if (!heightCm || isNaN(hCm) || hCm < 50 || hCm > 250) {
                    return createToast({ message: "Enter a valid height in cm (50-250)!" });
                }
            } else { // US units
                const ft = Number(heightFt);
                const inch = Number(heightIn);
                const totalInches = (ft || 0) * 12 + (inch || 0);
                if (!heightFt || !heightIn || isNaN(ft) || isNaN(inch) || totalInches < 20 || totalInches > 100) {
                    return createToast({ message: "Enter a valid height in ft/in (1'8\"-8'4\" inches)!" });
                }
            }
        }
        else if (container === 2) { // Weight
            if (!weightKg && !weightLb)
                return createToast({ message: "Enter your weight!" });

            if (weightUnit === "kg") {
                const wKg = Number(weightKg);
                if (!weightKg || isNaN(wKg) || wKg < 10 || wKg > 300) {
                    return createToast({ message: "Enter a valid weight in kg (10-300)!" });
                }
            } else { // US units
                const wLb = Number(weightLb);
                if (!weightLb || isNaN(wLb) || wLb < 22 || wLb > 660) {
                    return createToast({ message: "Enter a valid weight in lb (22-660)!" });
                }
            }
        }
        else if (container === 3) { // Activity level
            if (!activityLevel)
                return createToast({ message: "Select activity level!" });
        }
        else if (container === 4) { // Energy (Goal)
            if (!goal)
                return createToast({ message: "Select a goal!" });

            const numericWeight = Number(weightKg);
            const numericHeight = Number(heightCm);
            const numericAge = Number(age);

            const calculatedBmi = BMI(numericHeight, numericWeight);

            const calculatedBmr = BMR(numericWeight, numericHeight, numericAge, gender);
            const calculatedTdee = TDEE(calculatedBmr, activityLevel);
            const calculatedBodyFat = calcBodyFat(calculatedBmi, numericAge, gender, activityLevel);
            const recommendedEnergyKcal = caloriesByGoal(calculatedTdee, goal);
            const recommendedEnergyKj = convertEnergy(recommendedEnergyKcal, 'kcal', 'kj');

            const calculatedLeanBodyMass = calcLeanBodyMass(numericWeight, calculatedBodyFat);
            const calculatedProteinRequirement = proteinRequirementFromLBM(calculatedLeanBodyMass, activityLevel);
            const calculatedRecommendedWaterIntake = calcRecommendedWaterIntake(numericWeight);
            const calculatedBmiByLeanMass = BMIByLeanMass(numericWeight, heightCm, calculatedLeanBodyMass);

            setBmi(String(calculatedBmi));
            setBmiByLeanMass((String(calculatedBmiByLeanMass)))
            setBmr(calculatedBmr);
            setTdee(calculatedTdee);
            setBodyFat(String(calculatedBodyFat));
            setRecommendedEnergyKcal(String(recommendedEnergyKcal));
            setRecommendedEnergyKj(String(recommendedEnergyKj));
            setLeanBodyMass(String(calculatedLeanBodyMass));
            setProteinRequirement(String(calculatedProteinRequirement));
            setRecommendedWaterIntake(String(calculatedRecommendedWaterIntake));
        }
        else if (container === 5) { // Water Goal
            const ml = Number(waterMl);
            const floz = Number(waterFloz);
            const cups = Number(waterCups);

            if (ml <= 0 && floz <= 0 && cups <= 0) {
                return createToast({ message: "Set your daily water goal!" });
            }
        }
        else if (container === 6) { // Energy Goal
            const recCalsKcal = Number(recommendedEnergyKcal?.trim() || 0);
            const calsKcal = Number(energyKcal?.trim() || 0);
            const recCalsKj = Number(recommendedEnergyKj?.trim() || 0);
            const calsKl = Number(energyKj?.trim() || 0);

            if (recCalsKcal <= 0 || calsKcal <= 0 || recCalsKj <= 0 || calsKl <= 0) {
                return createToast({ message: "Set your caloric intake!" });
            }

            if (diet) {
                setMacrosGrams(macrosFromCalories(energyKcal, diet, carbRate, proteinRate, fatRate));

            }
        }
        else if (container === 7) { // Diet Type
            if (!diet) {
                return createToast({ message: "Select a diet type!" });
            }

            if (diet === "custom") {
                const total = (Number(carbRate) || 0) + (Number(proteinRate) || 0) + (Number(fatRate) || 0);
                if (total !== 100) {
                    return createToast({ message: "Custom percentages must sum to 100!" });
                }
            }
        }
        else if (container === 8) {
            const nameRegex = /^[A-Za-z'-]+( [A-Za-z'-]+)*$/;
            if (![firstname, lastname, email, phone, password, confirmPass].every(v => v?.trim()))
                return createToast({ message: "Fill in all fields!" });

            if (!nameRegex.test(firstname.trim()) || !nameRegex.test(lastname.trim())) {
                return createToast({ message: "Firstname and lastname must contain only letters!" });
            }

            if (password.length < 6) {
                return createToast({ message: "Password must be at least 6 characters!" });
            }

            if (password !== confirmPass)
                return createToast({ message: "Passwords do not match!" });

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return createToast({ message: "Enter a valid email address!" });
            }

            const phoneRegex = /^[0-9+\-\s()]+$/;
            if (!phoneRegex.test(phone)) {
                return createToast({ message: "Please enter a valid phone number!" });

            }

            const phoneDigits = phone.replace(/\D/g, '');
            if (phoneDigits.length < 7 || phoneDigits.length > 15) {
                return createToast({ message: "Please enter a valid phone number!" });
            }

            return initSignUp();
        }

        if (container < 8)
            setContainer(container + 1);
    }

    async function initSignUp() {
        Keyboard.dismiss();
        showSpinner();

        try {
            const user = await prepareUserObject();
            const pref = await preparePrefObject();

            const result = await APIService.user.create(user);

            if (result.success) {
                const token = result.data.token;
                await DeviceStorageService.setUserPreferences(pref);
                const userProfile = await DeviceStorageService.initUserSession(token);
                setUser(userProfile);

                createAlert({
                    title: "Registration",
                    text: `Registration success!\nClick OK to continue`,
                    onPress: () => { router.prefetch(routes.NUTRITION_HUB), router.replace(routes.HOMEPAGE) }
                });
            } else {
                createAlert({ title: "Registration Failed", text: result.message })
            }
        } catch (e) {
            createAlert({ title: "Registration", text: `Internal server error!${e.message ? `\n${e.message}` : ''}` })
        } finally {
            hideSpinner();
        }
    }

    async function prepareUserObject() {
        let imageBase64 = '';
        try {
            const asset = Asset.fromModule(Images.profilePic);
            await asset.downloadAsync();
            imageBase64 = await FileSystem.readAsStringAsync(asset.localUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
        } catch (error) {
            console.warn('Error loading default profile image:', error);
            imageBase64 = '';
        }

        const user = {
            firstname,
            lastname,
            age,
            gender,
            email,
            phone,
            password,
            imageBase64,
            metrics: {
                weightKg: Number(weightKg),
                heightCm: Number(heightCm),
                bmi: Number(bmi),
                bodyFat: Number(bodyFat),
                leanBodyMass: Number(leanBodyMass),
                bmr: Number(Math.round(bmr)),
                tdee: Number(Math.round(tdee)),
                activityLevel,
            },
            nutrition: {
                goal,
                waterMl: Number(waterMl),
                diet,
                recommendedEnergyKcal: Number(recommendedEnergyKcal),
                setEnergyKcal: Number(energyKcal),
                carbRate: Number(carbRate) || 0,
                proteinRate: Number(proteinRate) || 0,
                proteinRequirement: Number(proteinRequirement),
                fatRate: Number(fatRate) || 0,
                carbGrams: Number(macrosGrams.carbs),
                proteinGrams: Number(macrosGrams.protein),
                fatGrams: Number(macrosGrams.fat),
            },
        };
        return user;
    }

    async function preparePrefObject() {
        const heightPref = heightUnits.find(item => item.key === heightUnit) || defaultPreferences.heightUnit;
        const weightPref = weightUnits.find(item => item.key === weightUnit) || defaultPreferences.weightUnit;
        const fluidPref = fluidUnits.find(item => item.key === fluidUnit) || defaultPreferences.fluidUnit;
        const energyPref = energyUnits.find(item => item.key === energyUnit) || defaultPreferences.energyUnit;

        const pref = {
            heightUnit: heightPref,
            weightUnit: weightPref,
            fluidUnit: fluidPref,
            energyUnit: energyPref,
            dateFormat: defaultPreferences.dateFormat,
            timeFormat: defaultPreferences.timeFormat,
            language: defaultPreferences.language,
            theme: defaultPreferences.theme,
        }
        return pref;
    }

    return (
        <AppScroll extraTop={20}>
            <View style={styles.titleContainer}>
                <TouchableOpacity style={styles.arrowContainer} onPress={() => {
                    if (container > 0) {
                        setContainer(container - 1)
                    }
                    else
                        createDialog({
                            title: "Registration",
                            text: "Are you sure you want to cancel registration?",
                            onConfirm: () => router.back()
                        });
                }}>
                    <Image source={Images.arrow} style={styles.arrow} />
                </TouchableOpacity>
                <AppText style={styles.screenTitle}>{stepTitles[container]}</AppText>
            </View>
            <View style={styles.progressContainer}>
                <ProgressDots
                    steps={Array.from({ length: 9 }, (_, i) => container === i)}
                    activeColor={colors.main}
                    inactiveColor="rgb(82, 82, 82)"
                />
            </View>
            <View style={styles.contentWrapper}>
                {container === 0 && (
                    <>
                        <AppText style={{ color: "white", marginVertical: 10 }}>Enter your age and gender</AppText>
                        <AppTextInput
                            onChangeText={setAge}
                            value={String(age)}
                            placeholder="Age"
                            placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                            style={styles.input}
                            keyboardType="numeric"
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', width: '90%' }}>
                            <AnimatedButton
                                onPress={() => setGender("male")}
                                title="Male"
                                style={[styles.switchButton, { backgroundColor: gender === 'male' ? colors.mainSecond : colors.background, marginHorizontal: 8, width: '48%' }]}
                                textStyle={styles.switchButtonText}
                            />
                            <AnimatedButton
                                onPress={() => setGender("female")}
                                title="Female"
                                style={[styles.switchButton, { backgroundColor: gender === 'female' ? colors.mainSecond : colors.background, marginHorizontal: 8, width: '48%' }]}
                                textStyle={styles.switchButtonText}
                            />
                        </View>
                    </>
                )}
                {container === 1 && (
                    <>
                        <AppText style={{ color: "white", marginVertical: 10 }}>
                            Enter your height
                        </AppText>
                        {heightUnit === "cm" ? (
                            <AppTextInput
                                value={heightCm}
                                onChangeText={handleHeightChangeMetric}
                                placeholder="cm"
                                style={styles.input}
                                keyboardType="numeric"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                            />
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: Dimensions.get('window').width * 0.9 }}>
                                <AppTextInput
                                    value={heightFt}
                                    onChangeText={(ft) => handleHeightChangeUS(ft, heightIn)}
                                    placeholder="ft"
                                    style={[styles.input, { width: '48%' }]}
                                    keyboardType="numeric"
                                    placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                />
                                <AppTextInput
                                    value={heightIn}
                                    onChangeText={(inches) => handleHeightChangeUS(heightFt, inches)}
                                    placeholder="in"
                                    style={[styles.input, { width: '48%' }]}
                                    keyboardType="numeric"
                                    placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                />
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%' }}>
                            {heightUnits.map((option) => (
                                <AnimatedButton
                                    key={option.key}
                                    title={option.labelShort}
                                    onPress={() => setHeightUnit(option.key)}
                                    style={[styles.switchButton, { backgroundColor: heightUnit === option.key ? colors.mainSecond : colors.background, width: "48%" }]}
                                    textStyle={styles.switchButtonText}
                                />
                            ))}
                        </View>
                    </>
                )}
                {container === 2 && (
                    <>
                        <AppText style={{ color: "white", marginVertical: 10 }}>
                            Enter your weight
                        </AppText>
                        <AppTextInput
                            value={weightUnit === "kg" ? weightKg : weightLb}
                            onChangeText={handleWeightChange}
                            placeholder={weightUnit === "kg" ? "Weight (kg)" : "Weight (lb)"}
                            style={styles.input}
                            keyboardType="numeric"
                            placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%' }}>
                            {weightUnits.map((option) => (
                                <AnimatedButton
                                    key={option.key}
                                    title={option.labelShort}
                                    onPress={() => setWeightUnit(option.key)}
                                    style={[styles.switchButton, { backgroundColor: weightUnit === option.key ? colors.mainSecond : colors.background, width: "48%" }]}
                                    textStyle={styles.switchButtonText}
                                />
                            ))}
                        </View>
                    </>
                )}
                {container === 3 && (
                    <>
                        <AppText style={{ color: "white", marginVertical: 10 }}>
                            Select your activity level
                        </AppText>
                        {activityOptions.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => setActivityLevel(option.key)}
                                style={[
                                    styles.switchButton,
                                    {
                                        backgroundColor:
                                            activityLevel === option.key ? colors.mainSecond : colors.background,
                                        justifyContent: 'center', alignItems: 'center'
                                    },
                                ]}
                            >
                                <AppText style={styles.switchButtonText}>{option.label}</AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: 12 }}>
                                    {option.description}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
                {container === 4 && (
                    <>
                        <AppText style={{ color: "white", marginVertical: 10 }}>
                            Select your goal
                        </AppText>
                        {goalOptions.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                onPress={() => setGoal(option.key)}
                                style={[
                                    styles.switchButton,
                                    {
                                        backgroundColor:
                                            goal === option.key ? colors.mainSecond : colors.background,
                                        justifyContent: 'center', alignItems: 'center'
                                    },
                                ]}
                            >
                                <AppText style={styles.switchButtonText}>
                                    {option.label}
                                </AppText>
                                <AppText style={{ color: colors.mutedText, fontSize: 12 }}>
                                    {option.description}
                                </AppText>
                            </TouchableOpacity>
                        ))}

                    </>
                )}
                {container === 5 && (
                    <>
                        <AppText style={{ color: "white", textAlign: 'center', width: '80%', marginBottom: 5 }}>
                            Recommmended water intake
                            <AppText style={{ color: colors.main, marginVertical: 10, textAlign: 'center' }}>
                                {` ${convertFluid(recommendedWaterIntake, "ml", fluidUnit)} ${fluidUnits.find(item => item.key === fluidUnit).field}`}
                            </AppText>
                        </AppText>

                        {fluidUnit === 'ml' && (
                            <AppTextInput
                                onChangeText={(value) => handleWaterChange(value, "ml")}
                                value={waterMl}
                                placeholder="Water (mL)"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                                keyboardType="numeric"
                            />
                        )}
                        {fluidUnit === 'floz' && (
                            <AppTextInput
                                onChangeText={(value) => handleWaterChange(value, "floz")}
                                value={waterFloz}
                                placeholder="Water (Fl Oz)"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                                keyboardType="numeric"
                            />
                        )}
                        {fluidUnit === 'cups' && (
                            <AppTextInput
                                onChangeText={(value) => handleWaterChange(value, "cups")}
                                value={waterCups}
                                placeholder="Water (cups)"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                                keyboardType="numeric"
                            />
                        )}

                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: '90%' }}>
                            {fluidUnits.map((option) => (
                                <AnimatedButton
                                    key={option.key}
                                    style={[styles.switchButton, { backgroundColor: fluidUnit === option.key ? colors.mainSecond : colors.background, width: "31%" }]}
                                    onPress={() => setFluidUnit(option.key)}
                                    title={option.labelShort}
                                    textStyle={styles.switchButtonText}
                                />
                            ))}
                        </View>
                    </>
                )}
                {container === 6 && (
                    <>
                        <AppText style={{ color: "white", marginVertical: 10, textAlign: 'center', width: '80%' }}>
                            Recommended daily energy <AppText style={{ color: colors.main }}>
                                {energyUnit === 'kcal' ? recommendedEnergyKcal : recommendedEnergyKj} {energyUnits.find((item) => item.key === energyUnit).field}
                            </AppText>
                        </AppText>

                        <AppTextInput
                            value={energyUnit === 'kcal' ? energyKcal : energyKj}
                            onChangeText={handleEnergyChange}
                            placeholder="Energy per day"
                            style={styles.input}
                            placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                            keyboardType="numeric"
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%' }}>
                            <AnimatedButton
                                title="kcal"
                                onPress={() => setEnergyUnit("kcal")}
                                style={[styles.switchButton, { backgroundColor: energyUnit === 'kcal' ? colors.mainSecond : colors.background, width: '48%' }]}
                                textStyle={styles.switchButtonText}
                            />
                            <AnimatedButton
                                title="kJ"
                                onPress={() => setEnergyUnit("kj")}
                                style={[styles.switchButton, { backgroundColor: energyUnit === 'kj' ? colors.mainSecond : colors.background, width: '48%' }]}
                                textStyle={styles.switchButtonText}
                            />
                        </View>
                    </>
                )}
                {container === 7 && (
                    <>
                        <AppText style={{ color: "white", marginBottom: 10, textAlign: 'center' }}>
                            Daily calorie consumption is <AppText style={{ color: colors.main }}>{energyUnit === 'kcal' ? energyKcal : energyKj} {energyUnits.find((item) => item.key === energyUnit).field}</AppText>
                            {"\n"}
                            Recommended minimum protein intake of <AppText style={{ color: colors.main }}>
                                {Math.round(proteinRequirement)}g
                            </AppText>
                        </AppText>
                        <TouchableOpacity
                            onPress={() => {
                                createOptions({
                                    title: "Diet Type",
                                    options: dietOptions.map(d => d.label),
                                    current: diet ? dietOptions.find(d => d.key === diet)?.label : null,
                                    onConfirm: (option) => {
                                        if (!option) return;
                                        const selected = dietOptions.find(d => d.label === option);
                                        if (selected.key === diet) return;
                                        handleDietSelect(selected);
                                    },
                                });
                            }}
                            style={[styles.switchButton, { width: "90%", justifyContent: 'center', paddingHorizontal: 16 }]}
                        >
                            <AppText style={[styles.switchButtonText, { fontWeight: "700", textAlign: "center" }]}>
                                {diet ? dietOptions.find(d => d.key === diet)?.label : "Select Diet"}
                            </AppText>
                            {diet && (
                                <AppText style={{ color: colors.mutedText, fontSize: 12, textAlign: "center" }}>
                                    {diet ? dietOptions.find(d => d.key === diet)?.description : ""}
                                </AppText>)
                            }
                        </TouchableOpacity>


                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 15, width: '90%' }}>
                            {diet === 'custom' && (() => {
                                const isKj = energyUnit === 'kj';

                                const macros = macrosFromCalories(energyKcal, diet, carbRate, proteinRate, fatRate, true);

                                const carbCalsKcal = (Number(macros.carbs) || 0) * 4;
                                const proteinCalsKcal = (Number(macros.protein) || 0) * 4;
                                const fatCalsKcal = (Number(macros.fat) || 0) * 9;

                                const totalCalsKcal = carbCalsKcal + proteinCalsKcal + fatCalsKcal;

                                const totalCals = isKj ? convertEnergy(totalCalsKcal, 'kcal', 'kj') : totalCalsKcal;
                                const displayedEnergy = isKj ? convertEnergy(Number(energyKcal), 'kcal', 'kj') : energyKcal;

                                const totalPct = displayedEnergy > 0 ? (totalCals / displayedEnergy) * 100 : 0;

                                return (
                                    <AppText
                                        style={{
                                            color: "white",
                                            marginBottom: 15,
                                            width: '100%',
                                            textAlign: 'center',
                                            fontSize: scaleFont(11),
                                        }}
                                    >
                                        Consumed: {totalCals} {isKj ? 'kJ' : 'kcal'} {"\n"}
                                        <AppText
                                            style={{
                                                color: totalPct > 100 ? 'red' : totalPct === 100 ? 'green' : colors.mutedText,
                                                fontWeight: "600",
                                            }}
                                        >
                                            {Math.round(totalPct)}% of goal
                                        </AppText>
                                    </AppText>
                                );
                            })()}

                            {(() => {
                                return (
                                    <PercentageBar
                                        values={[
                                            { percentage: Number(carbRate), color: nutritionColors.carbs1, title: 'Carbs' },
                                            { percentage: Number(proteinRate), color: nutritionColors.protein1, title: 'Protein' },
                                            { percentage: Number(fatRate), color: nutritionColors.fat1, title: 'Fat' },
                                        ]}
                                        barHeight={10}
                                        showPercentage={true}
                                        minVisiblePercentage={3}
                                    />
                                );
                            })()}
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: 'space-between', width: "90%", marginTop: 5 }}>
                            <AppTextInput
                                value={carbRate}
                                onChangeText={(value) => {
                                    setDiet('custom')
                                    setCarbRate(value)
                                    setMacrosGrams(macrosFromCalories(energyKcal, 'custom', value, proteinRate, fatRate))
                                }}
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                placeholder="%"
                                style={[styles.input, { width: '30%' }]}
                                keyboardType="numeric"
                            />
                            <AppTextInput
                                value={proteinRate}
                                onChangeText={(value) => {
                                    setDiet('custom')
                                    setProteinRate(value)
                                    setMacrosGrams(macrosFromCalories(energyKcal, 'custom', carbRate, value, fatRate))
                                }}
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                placeholder="%"
                                style={[styles.input, { width: '30%' }]}
                                keyboardType="numeric"
                            />
                            <AppTextInput
                                value={fatRate}
                                onChangeText={(value) => {
                                    setDiet('custom')
                                    setFatRate(value)
                                    setMacrosGrams(macrosFromCalories(energyKcal, 'custom', carbRate, proteinRate, value))
                                }}
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                placeholder="%"
                                style={[styles.input, { width: '34%' }]}
                                keyboardType="numeric"
                            />
                        </View>
                    </>
                )}
                {container === 8 && (<>
                    <AppText style={{ color: "white", marginVertical: 10 }}>Please enter your personal details</AppText>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: Dimensions.get('window').width * 0.9 }}>
                        <AppTextInput
                            onChangeText={(value) => setFirstname(value)}
                            value={firstname}
                            placeholder="Firstname"
                            placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                            style={[styles.input, { width: '48%' }]}
                            keyboardType="default"
                        />
                        <AppTextInput
                            onChangeText={(value) => setLastname(value)}
                            value={lastname}
                            placeholder="Lastname"
                            placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                            style={[styles.input, { width: '48%' }]}
                                    keyboardType="default"
                        />
                    </View>
                    <AppTextInput
                        onChangeText={(value) => setEmail(value)}
                        value={email}
                        placeholder="Email"
                        placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                        style={styles.input}
                        keyboardType="email-address"
                    />
                    <AppTextInput
                        onChangeText={(value) => setPhone(value)}
                        value={phone}
                        placeholder="Phone"
                        placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                        style={styles.input}
                        inputMode="tel"
                        keyboardType="phone-pad"
                    />
                    <AppTextInput
                        secureTextEntry={true}
                        onChangeText={(value) => setPassword(value)}
                        value={password}
                        placeholder="Password"
                        placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                        style={styles.input}
                    />
                    <AppTextInput
                        secureTextEntry={true}
                        onChangeText={(value) => setConfirmPass(value)}
                        value={confirmPass}
                        placeholder="Confirm Password"
                        placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                        style={styles.input}
                    />
                </>
                )}
                <View style={[styles.stageButtonsContainer, { flexDirection: container === 0 ? 'column' : 'row' }]}>
                    {container !== 0 && (<AnimatedButton
                        onPress={() => {
                            setContainer(container - 1);
                        }}
                        title="Back"
                        style={[styles.stageButton, { width: container == 0 ? Dimensions.get("window").width * 0.9 : Dimensions.get("window").width * 0.43, }]}
                        textStyle={styles.stageButtonText} />)}
                    <AnimatedButton
                        onPress={handleAdvance}
                        title={container === 8 ? "Finish" : "Next"}
                        style={[styles.stageButton, { width: container == 0 ? Dimensions.get("window").width * 0.9 : Dimensions.get("window").width * 0.43, }]}
                        textStyle={styles.stageButtonText} />
                </View>
                <TextButton
                    mainText="Cancel Registration"
                    mainTextStyle={styles.cancelButtonText}
                    onPress={() => {
                        createDialog({
                            title: "Registration",
                            text: "Are you sure you want to cancel registration?",
                            onConfirm: () => router.back()
                        });
                        return true;
                    }}
                />
            </View>
        </AppScroll>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
    },
    screenTitle: {
        fontSize: scaleFont(30),
        color: "rgb(0, 140, 255)",
    },
    arrowContainer: {
        transform: [{ scaleX: -1 }],
        position: "absolute",
        left: 20,
    },
    arrow: {
        width: 30,
        height: 30,
    },
    progressContainer: { justifyContent: "flex-start", alignItems: "center" },
    contentWrapper: { justifyContent: "flex-start", alignItems: "center", width: "100%" },
    switchButton: { width: Dimensions.get("window").width * 0.9, height: 50, marginVertical: 10, borderRadius: 20, borderColor: colors.main, borderWidth: 1, backgroundColor: colors.background },
    switchButtonText: { color: 'white', fontSize: scaleFont(12) },
    cancelButtonText: { marginVertical: 15, color: colors.main, fontSize: scaleFont(12) },
    stageButtonsContainer: { width: Dimensions.get('window').width * 0.9, justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
    stageButton: { alignSelf: 'center', height: 50, marginVertical: 10, borderRadius: 20, backgroundColor: colors.main },
    stageButtonText: { fontSize: scaleFont(12) },
    input: { width: Dimensions.get('window').width * 0.9, height: 50, color: "white", borderColor: "black", borderWidth: 1, marginVertical: 10, borderRadius: 15, padding: 7, backgroundColor: "rgb(39, 40, 56)" }
});