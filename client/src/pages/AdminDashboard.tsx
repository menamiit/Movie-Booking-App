import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const AdminDashboard = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [poster, setPoster] = useState('');
    const [duration, setDuration] = useState(120);
    const [movies, setMovies] = useState<any[]>([]);

    // Showtime Form
    const [selectedMovie, setSelectedMovie] = useState('');
    const [theater, setTheater] = useState('Screen 1');
    const [startTime, setStartTime] = useState('');

    const token = user?.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        const res = await axios.get('http://localhost:5000/api/movies');
        setMovies(res.data);
    };

    const handleAddMovie = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/movies', {
                title, description, poster, genre: ['Action'], duration
            }, config);
            alert('Movie Added');
            fetchMovies();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddShowtime = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/showtimes', {
                movieId: selectedMovie,
                theater,
                startTime,
                rows: 5,
                cols: 8
            }, config);
            alert('Showtime Added');
        } catch (err) {
            console.error(err);
        }
    };

    if (user?.role !== 'admin') return <div>Access Denied</div>;

    return (
        <div className="container mx-auto p-4 flex gap-8">
            <div className="w-1/2 p-4 bg-white rounded shadow">
                <h2 className="text-xl font-bold mb-4">Add Movie</h2>
                <form onSubmit={handleAddMovie} className="flex flex-col gap-3">
                    <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="border p-2" required />
                    <input placeholder="Image URL" value={poster} onChange={e => setPoster(e.target.value)} className="border p-2" required />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="border p-2" required />
                    <input type="number" placeholder="Duration (min)" value={duration} onChange={e => setDuration(Number(e.target.value))} className="border p-2" required />
                    <button type="submit" className="bg-blue-600 text-white p-2 rounded">Add Movie</button>
                </form>
            </div>

            <div className="w-1/2 p-4 bg-white rounded shadow">
                <h2 className="text-xl font-bold mb-4">Add Showtime</h2>
                <form onSubmit={handleAddShowtime} className="flex flex-col gap-3">
                    <select value={selectedMovie} onChange={e => setSelectedMovie(e.target.value)} className="border p-2" required>
                        <option value="">Select Movie</option>
                        {movies.map(m => (
                            <option key={m._id} value={m._id}>{m.title}</option>
                        ))}
                    </select>
                    <input placeholder="Theater Name" value={theater} onChange={e => setTheater(e.target.value)} className="border p-2" required />
                    <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="border p-2" required />
                    <button type="submit" className="bg-green-600 text-white p-2 rounded">Create Showtime</button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
