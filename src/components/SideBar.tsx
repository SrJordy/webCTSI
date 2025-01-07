import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MdDashboard, 
    MdExitToApp, 
    MdPerson,
    MdLocalHospital,
    MdChevronLeft,
    MdChevronRight,
    MdHistoryEdu,
    MdReceipt,
    MdAssignmentAdd
} from 'react-icons/md';

interface MenuItem {
    title: string;
    path: string;
    icon: React.ElementType;
    badge?: number;
}

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const menuItems: MenuItem[] = [
        { title: 'Dashboard', path: '/dashboard', icon: MdDashboard },
        { title: 'Gestión de Usuarios', path: '/manage-users', icon: MdPerson},
        { title: 'Gestión de Pacientes', path: '/managepatient', icon: MdLocalHospital},
        { title: 'Historial Medico', path: '/History', icon: MdHistoryEdu },
        { title: 'Receta', path: '/managerecipes', icon: MdReceipt },
        { title: 'Tratamientos', path: '/Tratamientos', icon: MdAssignmentAdd},
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <motion.div
            initial={{ width: isOpen ? 256 : 80 }}
            animate={{ width: isOpen ? 256 : 80 }}
            transition={{ duration: 0.3 }}
            className="h-screen bg-gradient-to-b from-pastel-red to-red-600 text-white relative"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-red-400/30">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-pastel-red font-bold text-xl">C</span>
                    </div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="font-bold text-xl"
                            >
                                CTS+I
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                    {isOpen ? <MdChevronLeft size={24} /> : <MdChevronRight size={24} />}
                </button>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-red-400/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <MdPerson size={24} />
                    </div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <p className="font-medium">{user?.nombre}</p>
                                <p className="text-sm text-red-200">{user?.rol}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors relative
                                ${isActive 
                                    ? 'bg-white/20 text-white' 
                                    : 'hover:bg-red-500/30 text-red-100'}`}
                        >
                            <item.icon size={24} />
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex-1"
                                    >
                                        {item.title}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {item.badge && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="bg-white text-pastel-red text-xs font-bold px-2 py-1 rounded-full">
                                        {item.badge}
                                    </div>
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-0 w-full p-4 border-t border-red-400/30">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/30 transition-colors text-red-100"
                >
                    <MdExitToApp size={24} />
                    <AnimatePresence>
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                Cerrar sesión
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;