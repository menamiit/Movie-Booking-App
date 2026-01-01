import express, { Request, Response } from 'express';
import Movie from '../models/Movie';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// Public
router.get('/', async (req: Request, res: Response) => {
    try {
        const movies = await Movie.find({});
        res.json(movies);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Admin
router.post('/', protect, admin, async (req: Request, res: Response) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json(movie);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', protect, admin, async (req: Request, res: Response) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (movie) {
            await movie.deleteOne();
            res.json({ message: 'Movie removed' });
        } else {
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
