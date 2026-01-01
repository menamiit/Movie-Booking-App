import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, MapPin } from 'lucide-react';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState<any>(null);
    const [showtimes, setShowtimes] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieRes = await axios.get(`http://localhost:5000/api/movies/${id}`);
                setMovie(movieRes.data);

                const showtimeRes = await axios.get(`http://localhost:5000/api/showtimes?movieId=${id}`);
                setShowtimes(showtimeRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    if (!movie) return <div className="p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-8">
                <img src={movie.poster} alt={movie.title} className="w-full md:w-1/3 rounded-lg shadow-lg" />
                <div className="md:w-2/3">
                    <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                    <p className="text-gray-600 text-lg mb-4">{movie.description}</p>
                    <div className="flex gap-4 mb-6">
                        <span className="bg-gray-200 px-3 py-1 rounded text-sm">{movie.duration} min</span>
                        {movie.genre.map((g: string) => (
                            <span key={g} className="bg-gray-200 px-3 py-1 rounded text-sm">{g}</span>
                        ))}
                    </div>

                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Showtimes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {showtimes.length === 0 ? <p>No showtimes available.</p> : showtimes.map(st => (
                            <Link key={st._id} to={`/booking/${st._id}`} className="block border rounded p-4 hover:border-red-500 hover:shadow-md transition">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="flex items-center gap-2 font-bold mb-1"><MapPin size={16} /> {st.theater}</span>
                                        <span className="flex items-center gap-2 text-sm text-gray-600"><Clock size={16} /> {new Date(st.startTime).toLocaleString()}</span>
                                    </div>
                                    <span className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold">Book</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
