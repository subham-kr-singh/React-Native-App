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
        // Backend expects: { busNumber, capacity, status }
        // We filter out any extra fields like routeNumber here just in case
        const payload = {
            busNumber: busData.busNumber,
            capacity: busData.capacity || 40,
            status: busData.status || 'IDLE'
        };
        const response = await client.post('/api/admin/buses', payload);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

export const assignBusToSchedule = async (scheduleId, busId) => {
    try {
        const response = await client.put(`/api/admin/schedules/${scheduleId}`, { busId });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};

