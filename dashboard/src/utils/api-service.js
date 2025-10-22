export default class APIService {
    static BASE_URL = "http://192.168.33.16:8080/api";
    static CLOUDINARY_CLOUD_NAME = "dkujdjk2d";
    static TOKEN = null;
    static ADMIN_ID = null;

    static async setAdmin(token, id) {
        this.TOKEN = token;
        this.ADMIN_ID = id;
    }

    static async clearAdmin() {
        this.TOKEN = null;
        this.ADMIN_ID = null;
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

        try {
            const headers = { "Content-Type": "application/json" };
            if (useToken) {
                const token = tokenOverride ?? this.TOKEN;
                if (token) headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(`${this.BASE_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
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
        } 
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


    static routes = {       
         access: (payload) => APIService.request(`/admin/access`, 'POST', payload,false),
         testToken: () => APIService.request(`/admin/test-token/${APIService.ADMIN_ID}`, 'GET'),
    }
}