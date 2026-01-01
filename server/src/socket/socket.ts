import { Server, Socket } from 'socket.io';
import Showtime from '../models/Showtime';

export const socketHandler = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`User Connected: ${socket.id}`);

        socket.on('join_showtime', (showtimeId: string) => {
            socket.join(showtimeId);
            console.log(`User ${socket.id} joined showtime ${showtimeId}`);
        });

        socket.on('select_seat', async ({ showtimeId, row, number, userId }) => {
            // Logic to lock seat
            try {
                const showtime = await Showtime.findById(showtimeId);
                if (!showtime) return;

                const seat = showtime.seats.find((s) => s.row === row && s.number === number);

                if (seat && seat.status === 'available') {
                    // Lock the seat
                    seat.status = 'locked';
                    // Optionally set a user to the seat or expire time
                    await showtime.save();

                    // Broadcast to room
                    io.to(showtimeId).emit('seat_locked', { row, number, userId });
                }
            } catch (error) {
                console.error(error);
            }
        });

        socket.on('release_seat', async ({ showtimeId, row, number }) => {
            try {
                const showtime = await Showtime.findById(showtimeId);
                if (!showtime) return;

                const seat = showtime.seats.find((s) => s.row === row && s.number === number);

                if (seat && seat.status === 'locked') {
                    seat.status = 'available';
                    await showtime.save();
                    io.to(showtimeId).emit('seat_released', { row, number });
                }
            } catch (error) {
                console.error(error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected', socket.id);
            // Enhanced logic could auto-release locked seats by this socket if tracked
        });
    });
};
