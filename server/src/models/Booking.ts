import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
    userId: mongoose.Types.ObjectId;
    showtimeId: mongoose.Types.ObjectId;
    seats: { row: string; number: number }[];
    totalAmount: number;
    paymentStatus: 'pending' | 'completed' | 'failed';
}

const bookingSchema = new Schema<IBooking>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    seats: [
        {
            row: { type: String, required: true },
            number: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, {
    timestamps: true,
});

const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
export default Booking;
