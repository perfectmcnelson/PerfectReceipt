import axios from "axios";
import { API_PATHS, BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 50000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");

        // endpoints that should NOT have Authorization
        const skipAuthPaths = [
            API_PATHS.AUTH.GOOGLE_LOGIN,
        ];

        // config.url might be full or relative — check endsWith or includes
        const shouldSkip = skipAuthPaths.some((p) => {
            if (!p) return false;
            return config.url && config.url.includes(p.replace(/^\//, ''));
        });

        if (!shouldSkip && accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
            // Make sure we don't leave a stale header around
            delete config.headers.Authorization;
        }

        return config;
    }, 
    (error) => Promise.reject(error)
);


// Response Interceptor
// axiosInstance.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         // Handle common errors globally
//         if (error.response) {
//             if (error.response.status === 500) {
//                 console.error("Server error. Please try again later.");
//             }
//         } else if (error.code === "ECONNABORTED") {
//             console.error("Request timeout. Please try again.");
//         }
//         return Promise.reject(error);
//     }
// );

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;

            // 🚨 Account suspended
            if (status === 403 && data?.code === "ACCOUNT_SUSPENDED") {
                window.dispatchEvent(
                    new CustomEvent("account:suspended", {
                        detail: data
                    })
                );
            }

            // 🚨 Unauthorized - Token invalid/expired
            if (status === 401) {
                // localStorage.removeItem("token");
                localStorage.clear();
                window.location.href = "/login";
                return;
            }

            if (status === 500) {
                console.error("Server error. Please try again later.");
            }
        } 
        else if (error.code === "ECONNABORTED") {
            console.error("Request timeout. Please try again.");
        }

        return Promise.reject(error);
    }
);

 
export default axiosInstance;
