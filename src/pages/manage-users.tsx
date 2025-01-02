import { useEffect, useState, useMemo } from "react";
import { getAllUsers, deleteUser } from "../service/UserService";
import { FaEdit, FaTrashAlt, FaSearch, FaFilter, FaDownload } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import ConfirmModal from "../components/ConfirmModal";
import UserFormModal from "../components/UserFormModal";
import { toast } from "react-hot-toast";

interface User {
    cod_usuario: number;
    nombre: string;
    apellido: string;
    CID: string;
    email: string;
    telefono: string;
    rol: string;
    estado: boolean;
}

const ManageUsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("TODOS");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
            toast.success('Usuarios cargados exitosamente');
        } catch (error) {
            console.error("Error al obtener los usuarios", error);
            toast.error('Error al cargar los usuarios');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            try {
                const searchTermLower = searchTerm.toLowerCase().trim();
                
                const matchesSearch = 
                    (user?.nombre?.toLowerCase() || '').includes(searchTermLower) ||
                    (user?.apellido?.toLowerCase() || '').includes(searchTermLower) ||
                    (user?.email?.toLowerCase() || '').includes(searchTermLower) ||
                    (user?.CID?.toString() || '').includes(searchTermLower);
                
                const matchesRole = filterRole === "TODOS" || user?.rol === filterRole;
                
                return matchesSearch && matchesRole;
            } catch (error) {
                console.error('Error al filtrar usuario:', error);
                return false;
            }
        });
    }, [users, searchTerm, filterRole]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleDelete = async () => {
        if (userToDelete !== null) {
            try {
                await deleteUser(userToDelete);
                setUsers(users.filter((user) => user.cod_usuario !== userToDelete));
                toast.success('Usuario eliminado exitosamente');
                setIsDeleteModalOpen(false);
            } catch (error) {
                console.error("Error al eliminar el usuario", error);
                toast.error('Error al eliminar el usuario');
            }
        }
    };

    const exportToCSV = () => {
        const headers = ['Nombre', 'Apellido', 'CDI', 'Correo', 'Teléfono', 'Rol'];
        const csvContent = [
            headers.join(','),
            ...filteredUsers.map(user => 
                [user.nombre, user.apellido, user.CID, user.email, user.telefono, user.rol].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'usuarios.csv';
        link.click();
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container mx-auto p-6"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Gestión de Usuarios
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({filteredUsers.length} usuarios)
                        </span>
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-pastel-red text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>Nuevo Usuario</span>
                        <span className="text-xl">+</span>
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar usuarios..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pastel-red focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-400" />
                            <select
                                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pastel-red focus:border-transparent"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="TODOS">Todos los roles</option>
                                <option value="CUIDADOR">Cuidador</option>
                                <option value="PROFESIONAL">Profesional</option>
                            </select>
                        </div>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <FaDownload />
                            <span>Exportar CSV</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Nombre', 'Apellido', 'C.D.I', 'Correo', 'Teléfono', 'Rol', 'Acciones'].map((header) => (
                                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {paginatedUsers.map((user) => (
                                        <motion.tr
                                            key={user.cod_usuario}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">{user.nombre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.apellido}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.CID}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{user.telefono}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                    ${user.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    user.rol === 'DOCTOR' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'}`}>
                                                    {user.rol}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        onClick={() => {
                                                            setUserToEdit(user);
                                                            setIsModalOpen(true);  
                                                        }}
                                                    >
                                                        <FaEdit size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-red-600 hover:text-red-900"
                                                        onClick={() => {
                                                            setUserToDelete(user.cod_usuario);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                    >
                                                        <FaTrashAlt size={20} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Siguiente
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                                    <span className="font-medium">
                                        {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                                    </span>{' '}
                                    de <span className="font-medium">{filteredUsers.length}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                ${currentPage === page
                                                    ? 'z-10 bg-pastel-red border-pastel-red text-white'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    message="¿Estás seguro de que quieres eliminar este usuario?"
                />

                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setUserToEdit(null);
                    }}
                    onSubmit={async (userData) => {
                        try {
                            if (userToEdit) {
                                setUsers(users.map(user => 
                                    user.cod_usuario === userToEdit.cod_usuario 
                                        ? { ...user, ...userData } 
                                        : user
                                ));
                                toast.success('Usuario actualizado exitosamente');
                            } else {
                                setUsers([...users, userData]);
                                toast.success('Usuario creado exitosamente');
                            }
                            setIsModalOpen(false);
                            setUserToEdit(null);
                        } catch (error) {
                            toast.error('Error al procesar el usuario');
                        }
                    }}
                    userToEdit={userToEdit}
                />
            </motion.div>
        </MainLayout>
    );
};

export default ManageUsersPage;