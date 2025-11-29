# ParkEase Backend

Backend API for ParkEase parking lot management system built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and update the MongoDB connection string if needed
   - Default configuration:
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/parkease
     ```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Admin Routes (`/api/admin`)
- `POST /slots` - Create a new parking slot
- `GET /slots` - Get all parking slots
- `PUT /slots/:id` - Update slot state
- `GET /slots/:id/logs` - Get slot change logs
- `DELETE /slots/:id` - Delete a parking slot

### Visitor Routes (`/api/visitor`)
- `GET /stats` - Get parking statistics (total and per-type counts)
- `GET /slots` - Get all parking slots (read-only)
- `GET /recommended` - Get recommended parking slot

### Analytics Routes (`/api/analytics`)
- `GET /utilization` - Get current day utilization percentage

## Database Schema

### ParkingSlot
- `label`: String (unique, required)
- `type`: Enum ['Two-wheeler', 'Four-wheeler']
- `state`: Enum ['Free', 'Occupied', 'Reserved']
- `createdAt`: Date
- `updatedAt`: Date

### SlotLog
- `slotId`: ObjectId (reference to ParkingSlot)
- `previousState`: String
- `newState`: String
- `changedBy`: String (default: 'admin')
- `timestamp`: Date

## Testing

Test the API with curl:

```bash
# Create a slot
curl -X POST http://localhost:3000/api/admin/slots \
  -H "Content-Type: application/json" \
  -d '{"label":"A1","type":"Two-wheeler"}'

# Get statistics
curl http://localhost:3000/api/visitor/stats

# Get recommended slot
curl http://localhost:3000/api/visitor/recommended
```
