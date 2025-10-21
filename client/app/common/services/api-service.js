import DeviceStorageService from './device-storage-service'

export default class APIService {
    static BASE_URL = "http://192.168.33.16:8080/api";
    static USDA_API_KEY = 'sSfzXgd2xefbtWbfEqd0hdjadFSQnUC8tFrRxIbE';
    static CLOUDINARY_CLOUD_NAME = "dkujdjk2d";
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

        const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${APIService.USDA_API_KEY}`, {
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

    static async uploadImageToCloudinary({ uri, folder, fileName, uploadPreset = "The_Kratos_Hub" }) {
        if (!uri) throw new Error("No file URI provided for upload");
        if (!folder || !fileName) throw new Error("No folder or file name provided for upload");

        try {
            const formData = new FormData();
            formData.append("file", {
                uri,
                type: "image/jpeg",
                name: fileName,
            });
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", folder);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${APIService.CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!data.secure_url) throw new Error(data.error?.message || "Cloudinary upload failed");

            return data.secure_url;
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            throw err;
        }
    }

    static async uploadDocumentToCloudinary({ uri, folder, fileName, type, mimeType, uploadPreset = "The_Kratos_Hub" }) {
        if (!uri) throw new Error("No file URI provided for upload");
        if (!folder || !fileName) throw new Error("No folder or file name provided");

        try {
            const formData = new FormData();
            formData.append("file", {
                uri,
                type: type || mimeType || 'application/octet-stream',
                name: fileName,
            });
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", folder);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${APIService.CLOUDINARY_CLOUD_NAME}/raw/upload`,
                { method: "POST", body: formData }
            );

            const data = await response.json();

            if (!data.secure_url) throw new Error(data.error?.message || "Cloudinary upload failed");

            return data.secure_url;
        } catch (err) {
            console.error("Cloudinary document upload error:", err);
            throw err;
        }
    }

    static community = {
        post: (payload) => APIService.request(`/community/post/${APIService.USER_ID}`, 'POST', payload),
        posts: (payload) => APIService.request(`/community/posts/${APIService.USER_ID}`, 'POST', payload),
        savedPosts: (payload) => APIService.request(`/community/saved-posts/${APIService.USER_ID}`, 'POST', payload),
        create: (payload) => APIService.request(`/community/create/${APIService.USER_ID}`, 'POST', payload),
        update: (payload) => APIService.request(`/community/update/${APIService.USER_ID}`, 'PUT', payload),
        delete: (payload) => APIService.request(`/community/delete/${APIService.USER_ID}`, 'DELETE', payload),
        like: (payload) => APIService.request(`/community/like/${APIService.USER_ID}`, 'POST', payload),
        save: (payload) => APIService.request(`/community/save/${APIService.USER_ID}`, 'POST', payload),
        share: (payload) => APIService.request(`/community/share/${APIService.USER_ID}`, 'POST', payload),
        likers: (payload) => APIService.request(`/community/likers/${APIService.USER_ID}`, 'POST', payload),
    }

    static verification = {
        apply: (payload) => APIService.request(`/verification/${APIService.USER_ID}`, 'POST', payload),
        update: (payload) => APIService.request(`/verification/${APIService.USER_ID}`, 'PUT', payload),
        cancel: (payload) => APIService.request(`/verification/${APIService.USER_ID}`, 'DELETE', payload),
        fetchApplications: () => APIService.request(`/verification/${APIService.USER_ID}`, 'GET'),
    }

    static notifications = {
        all: () => APIService.request(`/notifications/${APIService.USER_ID}`, 'GET'),
        push: (payload) => APIService.request(`/notifications/${APIService.USER_ID}`, 'POST', payload),
        seen: (payload) => APIService.request(`/notifications/${APIService.USER_ID}`, 'PUT', payload)
    };

    static user = {
        create: (payload) => APIService.request('/user/create', 'POST', payload, false),
        login: (payload) => APIService.request('/user/login', 'POST', payload, false),
        profile: () => APIService.request('/user/profile', 'GET'),
        update: (payload) => APIService.request(`/user/update/${APIService.USER_ID}`, 'PUT', payload),
        destroy: (payload) => APIService.request(`/user/delete/${APIService.USER_ID}`, 'DELETE', payload),
        recoveryMail: (payload) => APIService.request('/user/recovery/send-code', 'POST', payload, false),
        updateByRecovery: (payload, recoveryToken) => APIService.request('/user/recovery/update-password', 'PUT', payload, true, recoveryToken),
        trainerProfile: {
            update: (payload) => APIService.request(`/user/trainer-profile/${APIService.USER_ID}`, 'PUT', payload),
        }
    };

    static userToUser = {
        anotherProfile: (id) => APIService.request(`/user-to-user/another-profile/${id}`, 'GET'),
        multipleAnotherProfile: (payload) => APIService.request(`/user-to-user/multiple-another-profile/${APIService.USER_ID}`, 'POST', payload),
        friendRequest: (payload) => APIService.request(`/user-to-user/friend-request/${APIService.USER_ID}`, 'POST', payload),
        replyRequest: (payload) => APIService.request(`/user-to-user/reply-request/${APIService.USER_ID}`, 'POST', payload),
        terminateFriendship: (payload) => APIService.request(`/user-to-user/terminate-friendship/${APIService.USER_ID}`, 'DELETE', payload),
        restoreFriendship: (payload) => APIService.request(`/user-to-user/restore-friendship/${APIService.USER_ID}`, 'PUT', payload),
        chat: {
            messages: (payload) => APIService.request(`/user-to-user/messages/${APIService.USER_ID}`, 'POST', payload),
        }
    }

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
            update: (payload) => APIService.request(`/nutrition/meals/${APIService.USER_ID}`, 'PUT', payload),
            delete: (payload) => APIService.request(`/nutrition/meals/${APIService.USER_ID}`, 'DELETE', payload),
            bulk: (payload) => APIService.request(`/nutrition/meals/bulk/${APIService.USER_ID}`, 'POST', payload),
            foods: {
                add: (payload) => APIService.request(`/nutrition/meals/food/${APIService.USER_ID}`, 'POST', payload),
                update: (payload) => APIService.request(`/nutrition/meals/food/${APIService.USER_ID}`, 'PUT', payload),
                delete: (payload) => APIService.request(`/nutrition/meals/food/${APIService.USER_ID}`, 'DELETE', payload)
            }
        },
        mealPlans: {
            create: (payload) => APIService.request(`/nutrition/meal-plans/${APIService.USER_ID}`, 'POST', payload),
            update: (payload) => APIService.request(`/nutrition/meal-plans/${APIService.USER_ID}`, 'PUT', payload),
            delete: (payload) => APIService.request(`/nutrition/meal-plans/${APIService.USER_ID}`, 'DELETE', payload),
            otherUserPlans: (payload) => APIService.request(`/nutrition/meal-plans-user/${APIService.USER_ID}`, 'POST', payload),
            clone: (payload) => APIService.request(`/nutrition/meal-plans/clone/${APIService.USER_ID}`, 'POST', payload),
            meals: {
                add: (payload) => APIService.request(`/nutrition/meal-plans/meal/${APIService.USER_ID}`, 'POST', payload),
                update: (payload) => APIService.request(`/nutrition/meal-plans/meal/${APIService.USER_ID}`, 'PUT', payload),
                delete: (payload) => APIService.request(`/nutrition/meal-plans/meal/${APIService.USER_ID}`, 'DELETE', payload),
                foods: {
                    add: (payload) => APIService.request(`/nutrition/meal-plans/meal/food/${APIService.USER_ID}`, 'POST', payload),
                    update: (payload) => APIService.request(`/nutrition/meal-plans/meal/food/${APIService.USER_ID}`, 'PUT', payload),
                    delete: (payload) => APIService.request(`/nutrition/meal-plans/meal/food/${APIService.USER_ID}`, 'DELETE', payload)
                }
            }
        },
        foods: {
            foods: (scope) => APIService.request(`/nutrition/foods/${APIService.USER_ID}?scope=${scope}`, 'GET'),
            foodsByUserId: (payload) => APIService.request(`/nutrition/foods/other-user/${APIService.USER_ID}`, 'POST', payload),
            create: (payload) => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'POST', payload),
            update: (payload) => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'PUT', payload),
            delete: (payload) => APIService.request(`/nutrition/foods/${APIService.USER_ID}`, 'DELETE', payload)
        }
    };

    static training = {
        exercises: {
            exercises: () => APIService.request(`/training/exercise/${APIService.USER_ID}`, 'GET'),
            create: (payload) => APIService.request(`/training/exercise/${APIService.USER_ID}`, 'POST', payload),
            update: (payload) => APIService.request(`/training/exercise/${APIService.USER_ID}`, 'PUT', payload),
            updateSets: (payload) => APIService.request(`/training/exercise/sets/${APIService.USER_ID}`, 'PUT', payload),
            delete: (payload) => APIService.request(`/training/exercise/${APIService.USER_ID}`, 'DELETE', payload)
        },
        workouts:{
            workouts: () => APIService.request(`/training/workout/${APIService.USER_ID}`, 'GET'),
            create: (payload) => APIService.request(`/training/workout/${APIService.USER_ID}`, 'POST', payload),
            update: (payload) => APIService.request(`/training/workout/${APIService.USER_ID}`, 'PUT', payload),
            delete: (payload) => APIService.request(`/training/workout/${APIService.USER_ID}`, 'DELETE', payload),
            exercises: {
                add: (payload) => APIService.request(`/training/workout/exercise/${APIService.USER_ID}`, 'POST', payload),
                update: (payload) => APIService.request(`/training/workout/exercise/${APIService.USER_ID}`, 'PUT', payload),
                delete: (payload) => APIService.request(`/training/workout/exercise/${APIService.USER_ID}`, 'DELETE', payload)
            }
        }
    };
}