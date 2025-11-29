# 🅿️ ParkEase - Smart Parking Management System

A comprehensive parking lot status and management application for commercial complexes, built with React Native (Expo) and Node.js.

## 📋 Overview

ParkEase helps commercial complexes monitor and share the occupancy status of their parking lots in real-time. The system provides separate interfaces for administrators to manage parking slots and visitors to find available parking.

## ✨ Features

### Admin Features
- Configure parking slots with custom labels (A1, A2, etc.)
- Set slot types (Two-wheeler/Four-wheeler)
- Change slot states (Free/Occupied/Reserved)
- View change logs for each slot
- Delete parking slots
- Real-time slot management

### Visitor Features
- View total and per-type parking statistics
- See all parking slots in a visual grid
- Get recommended parking slot (first available)
- Auto-refresh every 10 seconds
- Pull-to-refresh functionality

### Analytics
- Current day utilization percentage
- Visual progress indicators
- Occupancy insights
- Breakdown by slot type

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful JSON endpoints

### Mobile App
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **Styling**: React Native StyleSheet with custom design system
- **HTTP Client**: Axios

## 📁 Project Structure

```
parkease/
├── backend/              # Node.js backend
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── server.js        # Express server
└── mobile/              # React Native app
    └── src/
        ├── components/  # Reusable components
        ├── screens/     # Screen components
        ├── navigation/  # Navigation setup
        ├── config/      # API configuration
        └── styles/      # Design system
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Expo Go app (for mobile testing)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/parkease
```

4. Start the server:
```bash
npm run dev
```

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API endpoint in `src/config/api.js` (use your IP for physical devices)

4. Start Expo:
```bash
npx expo start
```

5. Scan QR code with Expo Go app or use simulator

## 📱 Screenshots & Usage

### Admin Flow
1. Open app and select "Admin Dashboard"
2. Create parking slots with labels and types
3. Tap slots to change states or view logs
4. Pull down to refresh

### Visitor Flow
1. Open app and select "Visitor View"
2. See recommended slot at the top
3. Browse statistics and all slots
4. Auto-refreshes every 10 seconds

### Analytics Flow
1. Open app and select "Analytics"
2. View utilization percentage
3. See occupancy breakdown
4. Get insights on parking availability

## 🎨 Design Highlights

- **Modern UI**: Vibrant gradients and smooth animations
- **Dark Theme**: Eye-friendly dark color scheme
- **State Colors**:
  - 🟢 Free: Green gradient
  - 🔴 Occupied: Red gradient
  - 🔵 Reserved: Blue gradient
- **Touch Optimized**: Native mobile interactions
- **Responsive**: Adapts to different screen sizes

## 🔌 API Endpoints

### Admin (`/api/admin`)
- `POST /slots` - Create slot
- `GET /slots` - Get all slots
- `PUT /slots/:id` - Update slot state
- `GET /slots/:id/logs` - Get logs
- `DELETE /slots/:id` - Delete slot

### Visitor (`/api/visitor`)
- `GET /stats` - Get statistics
- `GET /slots` - Get all slots
- `GET /recommended` - Get recommended slot

### Analytics (`/api/analytics`)
- `GET /utilization` - Get utilization percentage

## 📝 License

ISC

## 👨‍💻 Development

For detailed setup and development instructions, see:
- [Backend README](backend/README.md)
- [Mobile README](mobile/README.md)
