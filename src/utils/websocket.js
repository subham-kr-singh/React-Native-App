import { Client } from '@stomp/stompjs';
// TextEncoder polyfill is handled in index.js

const SOCKET_URL = 'wss://bus-tracker-backend-production-1f1c.up.railway.app/ws';

let client = null;

export const connectWebSocket = (onConnect) => {
    if (client && client.active) {
        return client;
    }

    client = new Client({
        brokerURL: SOCKET_URL,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
            console.log('Connected to WebSocket');
            if (onConnect) onConnect(client);
        },
        onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        },
    });

    client.activate();
    return client;
};

export const subscribeToBus = (busId, callback) => {
    if (!client || !client.active) {
        console.warn('WebSocket not connected');
        return;
    }

    return client.subscribe(`/topic/bus/${busId}`, (message) => {
        try {
            const location = JSON.parse(message.body);
            callback(location);
        } catch (e) {
            console.error("Error parsing websocket message", e);
        }
    });
};

export const disconnectWebSocket = () => {
    if (client) {
        client.deactivate();
        client = null;
    }
};
