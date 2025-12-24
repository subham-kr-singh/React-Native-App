import client from './client';

export const login = async (email, password) => {
    try {
        const response = await client.post('/api/auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const register = async (userData) => {
    try {
        const response = await client.post('/api/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
}
