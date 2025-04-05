import { useAuthStore } from '@/store/auth';
import axios from 'axios';

export const request = axios.create({
    baseURL: 'http://localhost:3000', //https://api.dafifi.net http://localhost:3000
    timeout: 100000,
    withCredentials: true,
});

export const setupInterceptors = () => {
    request.interceptors.request.use(
        (config) => {
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    request.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (
                error.response?.status === 401 &&
                !originalRequest._retry
            ) {
                originalRequest._retry = true;

                try {
                    await useAuthStore.getState().refreshToken();

                    return request(originalRequest);
                } catch (refreshError) {

                    useAuthStore.getState().logout();


                    window.location.href = '/user/login';

                    return Promise.reject(refreshError);
                }
            }

            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        console.error('Bad Request:', error.response.data);
                        break;
                    case 403:
                        console.error('Forbidden:', error.response.data);
                        break;
                    case 404:
                        console.error('Not Found:', error.response.data);
                        break;
                    case 500:
                        console.error('Server Error:', error.response.data);
                        break;
                }
            } else if (error.request) {

                console.error('No response received:', error.request);
            } else {

                console.error('Error setting up request:', error.message);
            }

            return Promise.reject(error);
        }
    );

    return request;
};

export const report_error = async (e: any) => {
    try {
        await request.post("/error", {
            message: e.message,
            stack: e.stack,
        });
    } catch (e) {
        console.log(e);
    }
}
