import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import APIService from './api-service';
import { routes } from '../settings/constants';
import { defaultPreferences } from '../helper-functions/global-options';

export default class DeviceStorageService {

    static async getUserToken() {
        const token = await SecureStore.getItemAsync("token");
        return token ? JSON.parse(token) : null;
    }

    static async initUserSession(token = null) {
        try {
            if (token) {
                await SecureStore.setItemAsync("token", JSON.stringify(token));
            }

            const storedToken = await SecureStore.getItemAsync("token");
            if (!storedToken) {
                return false;
            }

            const profileResponse = await APIService.user.profile();
            if (!profileResponse.success) {
                return false;
            }

            const profile = profileResponse.data.profile;
            APIService.setUserId(profile.id);

            if (profile.imageBase64) {
                profile.image = { uri: `data:image/jpeg;base64,${profile.imageBase64}` };
                delete profile.imageBase64;
            }

            profile.preferences = await this.getUserPreferences();

            const daysResponse = await APIService.nutrition.days.allDays();
            profile.nutritionLogs = daysResponse.success ? daysResponse.data.days : {};

            const result = await APIService.nutrition.foods.all();
            const foods = result.data.foods;
            profile.foods = foods;

            return profile;
        } catch (error) {
            console.error("Error initializing user session:", error);
            return false;
        }
    }

    static async clearUserSession() {
        await SecureStore.deleteItemAsync("token");
        APIService.setUserId(null);
        router.replace(routes.INTRODUCTION);
    }

    static async setUserPreferences(preferences) {
        const merged = { ...defaultPreferences, ...preferences };
        await AsyncStorage.setItem('preferences', JSON.stringify(merged));
    }

    static async getUserPreferences() {
        let preferences = JSON.parse(await AsyncStorage.getItem("preferences"));
        const merged = { ...defaultPreferences, ...preferences };

        if (!preferences) {
            await AsyncStorage.setItem('preferences', JSON.stringify(merged));
        }

        return merged;
    }
}