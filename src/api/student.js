import client from './client';

export const getNearbyStops = async (lat, lng, radius = 5000) => {
    try {
        const response = await client.get(`/api/student/stops/nearby`, {
            params: { lat, lng, radius }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching nearby stops:", error);
        throw error;
    }
};

export const getMorningBuses = async (stopId, date) => {
    try {
        const response = await client.get(`/api/student/morning-buses`, {
            params: { stopId, date }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching morning buses:", error);
        throw error;
    }
};
