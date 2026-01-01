import express, { Request, Response } from 'express';
import Showtime from '../models/Showtime';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    const movieId = req.query.movieId;
    try {
        const query = movieId ? { movieId } : {};
        const showtimes = await Showtime.find(query).populate('movieId', 'title');
        res.json(showtimes);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const showtime = await Showtime.findById(req.params.id).populate('movieId');
        if (showtime) {
            res.json(showtime);
        } else {
            res.status(404).json({ message: 'Showtime not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', protect, admin, async (req: Request, res: Response) => {
    const { movieId, theater, startTime, rows, cols } = req.body;

    // Helper to generate seats
    const seats = [];
    const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < rows; r++) {
        for (let c = 1; c <= cols; c++) {
            seats.push({
                row: rowLabels[r],
                number: c,
                status: 'available'
            });
        }
    }

    try {
        const showtime = await Showtime.create({
            movieId,
            theater,
            startTime,
            seats
        });
        res.status(201).json(showtime);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
