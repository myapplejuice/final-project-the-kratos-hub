import DeviceStorageService from './device-storage-service'

export default class APIService {
    static BASE_URL = "http://192.168.33.16:8080/api";
    static USDA_API_KEY = 'sSfzXgd2xefbtWbfEqd0hdjadFSQnUC8tFrRxIbE';
    static USER_ID = null;

    static setUserId(id) {
        this.USER_ID = id;
    }

    static async ping() {
        const res = await this.request('/ping', 'GET', null, false);
        return res.success;
    }

    static async request(endpoint, method, body = null, useToken = true, tokenOverride = null, timeout = 15000) {
        if (!endpoint || !method) {
            console.error('Invalid request, method or endpoint missing!');
            return { success: false, message: 'Invalid request' };
        }

        //const controller = new AbortController();
        //const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const headers = { "Content-Type": "application/json" };
            if (useToken) {
                const token = tokenOverride ?? await DeviceStorageService.getUserToken();
                if (token) headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(`${this.BASE_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
                //signal: controller.signal
            });

            const json = await res.json();

            if (!res.ok) {
                return { success: false, message: json?.message || json?.error || 'Request failed!' };
            }

            return { success: true, message: json?.message || 'Success!', data: json };
        } catch (e) {
            if (e.name === "AbortError") {
                return { success: false, message: "Request timed out" };
            }

            return { success: false, message: `Server error: ${e.message}` };
        } finally {
            //clearTimeout(timeoutId);
        }
    }

    static async USDARequest(body) {
        if (body === null || !body) return { success: false, message: 'Invalid request' };

        const res = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${APIService.USDA_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body
            }
        );

        const json = await res.json();

        if (!res.ok) {
            return { success: false, message: json?.message || 'USDA request failed' };
        }

        return { success: true, message: json?.message || 'Success!', data: json?.foods || [] };
    }

    static user = {
        create: (payload) => APIService.request('/user/create', 'POST', payload, false),
        login: (payload) => APIService.request('/user/login', 'POST', payload, false),
        profile: () => APIService.request('/user/profile', 'GET'),
        update: (payload) => APIService.request(`/user/update/${APIService.USER_ID}`, 'PUT', payload),
        destroy: (payload) => APIService.request(`/user/delete/${APIService.USER_ID}`, 'DELETE', payload),
        recoveryMail: (payload) => APIService.request('/user/recovery/send-code', 'POST', payload, false),
        updateByRecovery: (payload, recoveryToken) => APIService.request('/user/recovery/update-password', 'PUT', payload, true, recoveryToken)
    };

    static nutrition = {
        days: {
            days: () => APIService.request(`/nutrition/all/${APIService.USER_ID}`, 'GET'),
            dayByDate: (date) => APIService.request(`/nutrition/day/${date}/${APIService.USER_ID}`, 'GET'),
            futureDays: (date) => APIService.request(`/nutrition/ensure/${date}/${APIService.USER_ID}`, 'POST'),
            updateDay: (date, payload) => APIService.request(`/nutrition/update-day/${date}/${APIService.USER_ID}`, 'PUT', payload),
            updateConsumption: (date, payload) => APIService.request(`/nutrition/update-consumption/${date}/${APIService.USER_ID}`, 'PUT', payload),
        },
        meals: {
            create: (payload) => APIService.request(`/nutrition/meals/${APIService.USER_ID}`, 'POST', payload),
            updateLabel: (payload) => APIService.request(`/nutrition/meals/${APIService.USER_ID}`, 'PUT', payload),
            delete: (payload) => APIService.request(`/nutrition/meals/${APIService.USER_ID}`, 'DELETE', payload),
            foods: {
                add: (payload) => APIService.request(`/nutrition/meals/food/${APIService.USER_ID}`, 'POST', payload),
                update: (payload) => APIService.request(`/nutrition/meals/food/${APIService.USER_ID}`, 'PUT', payload),
                delete: (payload) => APIService.request(`/nutrition/meals/food/${APIService.USER_ID}`, 'DELETE', payload)
            }
        },
        foods: {
            foods: (scope) => APIService.request(`/nutrition/foods/${APIService.USER_ID}?scope=${scope}`, 'GET'),
            create: (payload) => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'POST', payload),
            update: (payload) => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'PUT', payload),
            delete: (payload) => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'DELETE', payload)
        }
    };
}