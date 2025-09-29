import DeviceStorageService from './device-storage-service'

export default class APIService {
    static BASE_URL = "http://192.168.33.16:8080/api";
    static USER_ID = null;

    static setUserId(id) {
        this.USER_ID = id;
    }

    static async ping() {
        const res = await this.request('/ping', 'GET', null, false);
        return res.success;
    }

    static async request(endpoint, method, body = null, useToken = true, tokenOverride = null) {
        if (!endpoint || !method) {
            console.error('Invalid request, method or endpoint missing!');
            return { success: false, message: 'Invalid request' };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

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
                signal: controller.signal
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
            clearTimeout(timeoutId);
        }
    }

    static user = {
        create: (payload) => APIService.request('/user/create', 'POST', payload, false),
        login: (payload) => APIService.request('/user/login', 'POST', payload, false),
        profile: () => APIService.request('/user/profile', 'GET'),
        update: (payload) => APIService.request(`/user/update/${APIService.USER_ID}`, 'PUT', payload),
        destroy: (password) => APIService.request(`/user/delete/${APIService.USER_ID}`, 'DELETE', { password }),
        recoveryMail: (data) => APIService.request('/user/recovery/send-code', 'POST', data, false),
        updateByRecovery: (data, recoveryToken) => APIService.request('/user/recovery/update-password', 'PUT', data, true, recoveryToken)
    };

    static nutrition = {
        days: {
            allDays: () => APIService.request(`/nutrition/all/${APIService.USER_ID}`, 'GET'),
            dayByDate: (date) => APIService.request(`/nutrition/day/${date}/${APIService.USER_ID}`, 'GET'),
            futureDays: (date) => APIService.request(`/nutrition/ensure/${date}/${APIService.USER_ID}`, 'POST'),
            updateDay: (date, payload) => APIService.request(`/nutrition/update-day/${date}/${APIService.USER_ID}`, 'PUT', payload),
            updateConsumption: (date, payload) => APIService.request(`/nutrition/update-consumption/${date}/${APIService.USER_ID}`, 'PUT', payload),
        },
        meals: {
            create: (payload) => APIService.request(`/nutrition/meals/${APIService.USER_ID}`, 'POST', payload),
            updateLabel: (payload) => APIService.request(`/nutrition/meals/${APIService.USER_ID}`, 'PUT', payload),
            delete: (payload) => APIService.request(`/nutrition/meals/${APIService.USER_ID}`, 'DELETE', payload)
        },
        foods: {
            all: () => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'GET'),
            create: (payload) => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'POST', payload),
            update: (payload) => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'PUT', payload),
            delete: (payload) => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'DELETE', payload)
        }
    };
}