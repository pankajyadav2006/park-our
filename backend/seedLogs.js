const mongoose = require('mongoose');
const SlotLog = require('./models/SlotLog');
const ParkingSlot = require('./models/ParkingSlot');
const connectDB = require('./config/database');
require('dotenv').config();

connectDB();

const seedLogs = async () => {
    try {
        const slots = await ParkingSlot.find();

        if (slots.length === 0) {
            console.log('No slots found. Please run seedSlots.js first.');
            process.exit(1);
        }

        await SlotLog.deleteMany({});
        console.log('Cleared existing logs');

        const logs = [];
        const now = new Date();

        // Generate logs for the past 7 days
        for (let day = 0; day < 7; day++) {
            const date = new Date(now);
            date.setDate(date.getDate() - day);

            // Simulate peak hours: 9-11 AM and 5-7 PM
            const peakHours = [9, 10, 11, 17, 18, 19];
            const regularHours = [8, 12, 13, 14, 15, 16, 20];

            // More activity during peak hours
            peakHours.forEach(hour => {
                const activitiesCount = 5 + Math.floor(Math.random() * 5); // 5-9 activities
                for (let i = 0; i < activitiesCount; i++) {
                    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
                    const timestamp = new Date(date);
                    timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

                    logs.push({
                        slotId: randomSlot._id,
                        previousState: 'Free',
                        newState: Math.random() > 0.5 ? 'Occupied' : 'Reserved',
                        changedBy: 'admin',
                        timestamp
                    });
                }
            });

            // Less activity during regular hours
            regularHours.forEach(hour => {
                const activitiesCount = 1 + Math.floor(Math.random() * 3); // 1-3 activities
                for (let i = 0; i < activitiesCount; i++) {
                    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
                    const timestamp = new Date(date);
                    timestamp.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

                    logs.push({
                        slotId: randomSlot._id,
                        previousState: 'Free',
                        newState: Math.random() > 0.5 ? 'Occupied' : 'Reserved',
                        changedBy: 'admin',
                        timestamp
                    });
                }
            });
        }

        await SlotLog.insertMany(logs);
        console.log('Added seed logs successfully');
        console.log(`Total logs created: ${logs.length}`);
        console.log('Peak hours should be around 9-11 AM and 5-7 PM');

        process.exit();
    } catch (error) {
        console.error('Error seeding logs:', error);
        process.exit(1);
    }
};

seedLogs();
