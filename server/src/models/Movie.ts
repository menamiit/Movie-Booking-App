import mongoose, { Document, Schema } from 'mongoose';

export interface IMovie extends Document {
    title: string;
    description: string;
    poster: string;
    genre: string[];
    duration: number; // in minutes
}

const movieSchema = new Schema<IMovie>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    poster: { type: String, required: true },
    genre: [{ type: String, required: true }],
    duration: { type: Number, required: true },
}, {
    timestamps: true,
});

const Movie = mongoose.model<IMovie>('Movie', movieSchema);
export default Movie;
