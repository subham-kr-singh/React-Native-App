# React-Native-App

A React Native application for the Bus Tracker system, providing real-time bus tracking functionality for students, drivers, and administrators.

## Features

- **Student Interface**: Track buses in real-time, view routes and stops
- **Driver Interface**: Share location and manage bus status
- **Admin Interface**: Manage routes, buses, and system configuration
- **Real-time Updates**: WebSocket integration for live tracking
- **Smart Commute**: Automatic direction detection based on location

## Tech Stack

- React Native with Expo
- React Navigation for routing
- WebSocket for real-time communication
- Geolocation services

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on web:
   ```bash
   npx expo start --web
   ```

## Project Structure

```
src/
├── api/          # API client and endpoints
├── components/   # Reusable UI components
├── screens/      # Screen components
├── services/     # Business logic and services
└── utils/        # Utility functions
```

## Configuration

Update the API endpoint in `src/api/client.js` to point to your backend server.

## License

MIT
