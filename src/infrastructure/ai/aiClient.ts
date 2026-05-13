import axios from "axios";
import config from "../../config";

export const aiClient = axios.create({
    baseURL: config.ai_base_url,
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",
    },
});

// Global error interceptor — logs all AI failures in one place
aiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(
            `[AI Client] ${error.config?.method?.toUpperCase()} ${error.config?.url} failed:`,
            error?.response?.data || error.message
        );
        return Promise.reject(error);
    }
);