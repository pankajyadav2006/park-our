const express = require('express');
const router = express.Router();
const ParkingSlot = require('../models/ParkingSlot');
const SlotLog = require('../models/SlotLog');
const { auth, isVisitor } = require('../middleware/auth');

router.use(auth);
router.use(isVisitor);
router.get('/stats', async (req, res) => {
    try {
        const slots = await ParkingSlot.find();

        const stats = {
            total: {
                free: 0,
                occupied: 0,
                reserved: 0
            },
            'Two-wheeler': {
                free: 0,
                occupied: 0,
                reserved: 0
            },
            'Four-wheeler': {
                free: 0,
                occupied: 0,
                reserved: 0
            }
        };

        slots.forEach(slot => {
            const state = slot.state.toLowerCase();
            stats.total[state]++;
            stats[slot.type][state]++;
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/slots', async (req, res) => {
    try {
        const slots = await ParkingSlot.find().sort({ label: 1 });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/recommended', async (req, res) => {
    try {
        const freeSlot = await ParkingSlot.findOne({ state: 'Free' }).sort({ label: 1 });

        if (!freeSlot) {
            return res.json({ message: 'No free slots available' });
        }

        res.json(freeSlot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/reserve/:id', async (req, res) => {
    try {
        const slot = await ParkingSlot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        if (slot.state !== 'Free') {
            return res.status(400).json({ error: 'Slot is not available for reservation' });
        }

        const previousState = slot.state;
        slot.state = 'Reserved';
        slot.updatedAt = Date.now();
        await slot.save();
        await SlotLog.create({
            slotId: slot._id,
            previousState,
            newState: 'Reserved',
            changedBy: req.user.email
        });

        res.json({ message: 'Slot reserved successfully', slot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
