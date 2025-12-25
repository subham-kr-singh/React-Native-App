import client from './client';

export const getBuses = async () => {
    try {
        const response = await client.get('/api/admin/buses');
        return response.data;
    } catch (error) {
        console.error("Error fetching buses:", error);
        throw error;
    }
};

export const addBus = async (busData) => {
    try {
        const response = await client.post('/api/admin/buses', busData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRoutes = async () => {
    try {
        const response = await client.get('/api/admin/routes');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createSchedule = async (routeId, busId, direction = "OUTBOUND") => {
    try {
        const response = await client.post('/api/admin/schedules', { routeId, busId, direction });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const assignBusToSchedule = async (scheduleId, busId) => {
    try {
        const response = await client.put(`/api/admin/schedules/${scheduleId}`, { busId });
        return response.data;
    } catch (error) {
        throw error;
    }
};
