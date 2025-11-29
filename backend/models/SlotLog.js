const mongoose = require('mongoose');

const slotLogSchema = new mongoose.Schema({
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSlot',
        required: true
    },
    previousState: {
        type: String,
        enum: ['Free', 'Occupied', 'Reserved', null]
    },
    newState: {
        type: String,
        required: true,
        enum: ['Free', 'Occupied', 'Reserved']
    },
    changedBy: {
        type: String,
        default: 'admin'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SlotLog', slotLogSchema);
