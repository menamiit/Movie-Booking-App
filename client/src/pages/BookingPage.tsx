import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { RootState } from '../store';
import clsx from 'clsx';

interface Seat {
    row: string;
    number: number;
    status: 'available' | 'booked' | 'locked';
    user?: string; // userId if locked/booked
}

interface Showtime {
    _id: string;
    movieId: { title: string };
    theater: string;
    seats: Seat[];
    price: number;
}

const BookingPage = () => {
    const { id: showtimeId } = useParams();
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const [showtime, setShowtime] = useState<Showtime | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

    useEffect(() => {
        // 1. Fetch initial state
        const fetchShowtime = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/showtimes/${showtimeId}`);
                setShowtime(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchShowtime();

        // 2. Connect Socket
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('join_showtime', showtimeId);

        newSocket.on('seat_locked', ({ row, number, userId }) => {
            setShowtime((prev) => {
                if (!prev) return null;
                const newSeats = prev.seats.map(s => {
                    if (s.row === row && s.number === number) {
                        return { ...s, status: 'locked', user: userId } as Seat;
                    }
                    return s;
                });
                return { ...prev, seats: newSeats };
            });
        });

        newSocket.on('seat_released', ({ row, number }) => {
            setShowtime((prev) => {
                if (!prev) return null;
                const newSeats = prev.seats.map(s => {
                    if (s.row === row && s.number === number) {
                        return { ...s, status: 'available', user: undefined } as Seat;
                    }
                    return s;
                });
                return { ...prev, seats: newSeats };
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, [showtimeId]);

    const handleSeatClick = (seat: Seat) => {
        if (!user) {
            alert('Please login to book tickets');
            navigate('/login');
            return;
        }
        if (!socket || !showtime) return;

        if (seat.status === 'available') {
            // Optimistic update? No, wait for socket or local lock?
            // Let's emit and wait for server broadcast (or simple local reflection)
            socket.emit('select_seat', { showtimeId, row: seat.row, number: seat.number, userId: user._id });
            // Locally select for booking list
            setSelectedSeats([...selectedSeats, seat]);
        } else if (seat.status === 'locked' && seat.user === user._id) {
            // Deselect
            socket.emit('release_seat', { showtimeId, row: seat.row, number: seat.number });
            setSelectedSeats(selectedSeats.filter(s => !(s.row === seat.row && s.number === seat.number)));
        }
    };

    const handleBook = async () => {
        if (!user || selectedSeats.length === 0) return;
        try {
            await axios.post('http://localhost:5000/api/bookings', {
                showtimeId,
                seats: selectedSeats.map(s => ({ row: s.row, number: s.number })),
                totalAmount: selectedSeats.length * 100 // Mock price
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('Booking Successful!');
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Booking Failed');
        }
    };

    if (!showtime) return <div>Loading...</div>;

    // Group seats by row
    const seatsRequests = showtime.seats.reduce((acc: any, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
    }, {});

    const rows = Object.keys(seatsRequests).sort();

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Select Seats for {showtime.movieId.title}</h2>
            <div className="flex flex-col items-center gap-2 mb-8">
                <div className="w-full h-12 bg-gray-300 rounded mb-4 text-center content-center text-gray-600 font-bold">SCREEN</div>
                {rows.map(row => (
                    <div key={row} className="flex gap-2">
                        <div className="w-8 flex items-center justify-center font-bold">{row}</div>
                        {seatsRequests[row].map((seat: Seat) => {
                            const isSelected = selectedSeats.some(s => s.row === seat.row && s.number === seat.number);
                            const isLockedByMe = seat.status === 'locked' && seat.user === user?._id;
                            const isLockedByOther = seat.status === 'locked' && seat.user !== user?._id;
                            const isBooked = seat.status === 'booked';

                            return (
                                <button
                                    key={`${seat.row}-${seat.number}`}
                                    disabled={isBooked || isLockedByOther}
                                    onClick={() => handleSeatClick(seat)}
                                    className={clsx(
                                        "w-8 h-8 rounded text-xs transition-colors",
                                        isBooked ? "bg-gray-500 cursor-not-allowed" :
                                            isLockedByOther ? "bg-yellow-500 cursor-not-allowed" :
                                                isSelected || isLockedByMe ? "bg-green-500 text-white" :
                                                    "bg-white border hover:bg-green-100"
                                    )}
                                >
                                    {seat.number}
                                </button>
                            )
                        })}
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-up flex justify-between items-center container mx-auto">
                <div>
                    <p className="font-bold">Selected: {selectedSeats.length} seats</p>
                    <p>Total: ${selectedSeats.length * 100}</p>
                </div>
                <button
                    onClick={handleBook}
                    disabled={selectedSeats.length === 0}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                    Pay Now
                </button>
            </div>
        </div>
    );
};

export default BookingPage;
