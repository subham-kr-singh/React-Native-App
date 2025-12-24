import client from './client';

export const getDriverSchedule = async () => {
    try {
        const response = await client.get('/api/driver/schedules/today');
        return response.data;
    } catch (error) {
        console.error("Error fetching driver schedule:", error);
        throw error;
    }
};

export const broadcastLocation = async (scheduleId, lat, lng, speed, busNumber) => {
    try {
        await client.post('/api/driver/location', {
            scheduleId,
            latitude: lat,
            longitude: lng,
            speed: speed || 0,
            busNumber
        });
    } catch (error) {
        // Log error but don't crash app as this is high frequency
        console.log("Error broadcasting location:", error.message);
    }
};
