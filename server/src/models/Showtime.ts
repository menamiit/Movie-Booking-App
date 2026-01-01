import mongoose, { Document, Schema } from 'mongoose';

export interface ISeat {
    user?: mongoose.Types.ObjectId;
    status: 'available' | 'booked' | 'locked';
    row: string;
    number: number;
}

export interface IShowtime extends Document {
    movieId: mongoose.Types.ObjectId;
    theater: string;
    startTime: Date;
    seats: ISeat[];
}

const seatSchema = new Schema<ISeat>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['available', 'booked', 'locked'], default: 'available' },
    row: { type: String, required: true },
    number: { type: Number, required: true },
});

const showtimeSchema = new Schema<IShowtime>({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: String, required: true },
    startTime: { type: Date, required: true },
    seats: [seatSchema],
}, {
    timestamps: true,
});

const Showtime = mongoose.model<IShowtime>('Showtime', showtimeSchema);
export default Showtime;
