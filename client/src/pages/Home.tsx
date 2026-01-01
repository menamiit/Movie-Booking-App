import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Movie {
    _id: string;
    title: string;
    poster: string;
    genre: string[];
}

const Home = () => {
    const [movies, setMovies] = useState<Movie[]>([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/movies');
                setMovies(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMovies();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Now Showing</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {movies.map((movie) => (
                    <Link key={movie._id} to={`/movie/${movie._id}`} className="group block h-full">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                            <img src={movie.poster} alt={movie.title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform" />
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 flex-grow">{movie.genre.join(', ')}</p>
                                <div className="mt-auto">
                                    <span className="text-red-500 font-medium">Book Now &rarr;</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
