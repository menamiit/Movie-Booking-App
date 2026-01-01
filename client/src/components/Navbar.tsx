import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { LogOut, User, Film } from 'lucide-react';

const Navbar = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 text-white p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold flex items-center gap-2 text-red-500">
                    <Film /> Popcorn
                </Link>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="flex items-center gap-2">
                                <User size={18} /> {user.name} ({user.role})
                            </span>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="hover:text-red-400">Dashboard</Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-red-400">Login</Link>
                            <Link to="/signup" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
