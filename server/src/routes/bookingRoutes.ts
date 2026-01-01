import express, { Request, Response } from 'express';
import Booking from '../models/Booking';
import Showtime from '../models/Showtime';
import { protect } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends Request {
    user?: any;
}

router.post('/', protect, async (req: AuthRequest, res: Response) => {
    const { showtimeId, seats, totalAmount } = req.body; // seats: [{ row, number }]

    try {
        // 1. Create Booking
        const booking = await Booking.create({
            userId: req.user._id,
            showtimeId,
            seats,
            totalAmount,
            paymentStatus: 'completed' // Mocking immediate success
        });

        // 2. Update Showtime seats to 'booked'
        const showtime = await Showtime.findById(showtimeId);
        if (showtime) {
            seats.forEach((bookedSeat: any) => {
                const seat = showtime.seats.find(s => s.row === bookedSeat.row && s.number === bookedSeat.number);
                if (seat) {
                    seat.status = 'booked';
                    seat.user = req.user._id;
                }
            });
            await showtime.save();
        }

        res.status(201).json(booking);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/mybookings', protect, async (req: AuthRequest, res: Response) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id }).populate('showtimeId').populate('userId', 'name email');
        res.json(bookings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
