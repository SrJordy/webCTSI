import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDashboard, MdExitToApp, MdPerson } from 'react-icons/md'; 
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true); 
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className={`flex ${isOpen ? 'w-64' : 'w-20'} h-full bg-pastel-red text-white transition-all duration-300`}>
            <div className="flex flex-col w-full">

                <div className="flex items-center justify-between p-4 bg-red-600">
                    <h2 className="text-xl font-semibold">{isOpen ? 'CTS+I' : 'C'}</h2>
                    <button
                        onClick={toggleSidebar}
                        className="text-white p-2 bg-red-700 rounded-full"
                    >
                        {isOpen ? '◁' : '▷'}
                    </button>
                </div>

                {isOpen && user && (
                    <div className="flex items-center p-4">
                        <MdPerson className="w-6 h-6 mr-3" />
                        <p>{user.nombre}</p>
                    </div>
                )}

                <div className="flex-grow">
                    <nav className="flex flex-col space-y-4 p-4">
                        <Link to="/dashboard" className="flex items-center space-x-2 hover:bg-red-600 p-2 rounded-md">
                            <MdDashboard className="w-6 h-6" />
                            {isOpen && <span>Dashboard</span>}
                        </Link>
                        <Link to="/manage-users" className="flex items-center space-x-2 hover:bg-red-600 p-2 rounded-md">
                            <MdPerson className="w-6 h-6" />
                            {isOpen && <span>Gestión de Usuarios</span>}
                        </Link>

                        <Link to="/managepatient" className="flex items-center space-x-2 hover:bg-red-600 p-2 rounded-md">
                            <MdPerson className="w-6 h-6" />
                            {isOpen && <span>Gestión de Pacientes</span>}
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center justify-center p-4 hover:bg-red-600 mt-auto">
                    <button onClick={handleLogout} className="flex items-center space-x-2 w-full p-2 rounded-md text-left">
                        <MdExitToApp className="w-6 h-6" />
                        {isOpen && <span>Cerrar sesión</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
