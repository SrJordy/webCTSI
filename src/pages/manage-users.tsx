import { useEffect, useState, useMemo, useCallback } from "react";
import { getAllUsers, deleteUser } from "../service/UserService";
import {
    FaEdit,
    FaTrashAlt,
    FaSearch,
    FaFilter,
    FaDownload,
    FaPlus,
    FaChevronLeft,
    FaChevronRight,
    FaUserCog,
    FaSync,
    FaExclamationTriangle,
    FaUsers,
    FaTimes
} from "react-icons/fa";
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

// Definir el tipo que espera UserFormModal para userToEdit
interface UserToEdit {
    nombre?: string;
    apellido?: string;
    CID?: string | number;
    telefono?: string | number;
    email?: string;
    rol?: string;
    cod_usuario?: string | number;
}

const ManageUsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [userToEdit, setUserToEdit] = useState<UserToEdit | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("TODOS");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const itemsPerPage = 10;

    const fetchUsers = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);

        setError(null);

        try {
            const data = await getAllUsers();
            setUsers(data);
            if (!showRefreshing) {
                toast.success('Usuarios cargados exitosamente');
            }
        } catch (error) {
            console.error("Error al obtener los usuarios", error);
            setError("No se pudieron cargar los usuarios. Intente nuevamente.");
            toast.error('Error al cargar los usuarios');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    const refreshUsers = () => {
        fetchUsers(true);
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

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole]);

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
        try {
            const headers = ['Nombre', 'Apellido', 'CDI', 'Correo', 'Teléfono', 'Rol'];
            const csvContent = [
                headers.join(','),
                ...filteredUsers.map(user =>
                    [
                        `"${user.nombre || ''}"`,
                        `"${user.apellido || ''}"`,
                        `"${user.CID || ''}"`,
                        `"${user.email || ''}"`,
                        `"${user.telefono || ''}"`,
                        `"${user.rol || ''}"`
                    ].join(',')
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            toast.success('Archivo CSV generado exitosamente');
        } catch (error) {
            console.error("Error al exportar a CSV", error);
            toast.error('Error al generar el archivo CSV');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUserSubmit = async (userData: any) => {
        try {
            if (userToEdit) {
                // Update existing user in the list
                setUsers(users.map(user =>
                    user.cod_usuario === userToEdit.cod_usuario
                        ? { ...user, ...userData, cod_usuario: userToEdit.cod_usuario }
                        : user
                ));
            } else {
                // For new users, we'll refresh the list to get the server-assigned ID
                refreshUsers();
            }
            setIsModalOpen(false);
            setUserToEdit(undefined);
        } catch (error) {
            console.error("Error al procesar el usuario", error);
            toast.error('Error al procesar el usuario');
        }
    };

    // Función para convertir User a UserToEdit
    const prepareUserForEdit = (user: User): UserToEdit => {
        return {
            nombre: user.nombre,
            apellido: user.apellido,
            CID: user.CID,
            telefono: user.telefono,
            email: user.email,
            rol: user.rol,
            cod_usuario: user.cod_usuario
        };
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterRole("TODOS");
    };

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-b from-[#C4E5F2] to-[#E6F4F9] -m-8 p-8"
            >
                <div className="max-w-7xl mx-auto">
                    {/* Encabezado */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
                    >
                        <div className="bg-[#5FAAD9] px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                                        {filteredUsers.length} registros
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-600 flex items-center">
                                <FaUsers className="mr-2 text-[#5FAAD9]" />
                                Administración de usuarios y asignación de roles
                            </p>
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center"
                                    onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                                >
                                    <FaFilter className="mr-2" />
                                    {isFiltersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-[#5FAAD9] text-white px-6 py-2 rounded-lg hover:bg-[#035AA6] transition-colors duration-300 flex items-center shadow-md"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <FaPlus className="mr-2" />
                                    Nuevo Usuario
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filtros */}
                    <AnimatePresence>
                        {isFiltersVisible && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-lg p-6 mb-8 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <FaSearch className="mr-2 text-[#5FAAD9]" />
                                            Buscar usuario
                                        </label>
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                                placeholder="Nombre, apellido, email o CDI..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <FaUserCog className="mr-2 text-[#5FAAD9]" />
                                            Filtrar por rol
                                        </label>
                                        <div className="relative">
                                            <FaUserCog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <select
                                                value={filterRole}
                                                onChange={(e) => setFilterRole(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent appearance-none"
                                            >
                                                <option value="TODOS">Todos los roles</option>
                                                <option value="CUIDADOR">Cuidador</option>
                                                <option value="PROFESIONAL">Profesional</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <FaDownload className="mr-2 text-[#5FAAD9]" />
                                            Exportar datos
                                        </label>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={exportToCSV}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5FAAD9] text-white font-medium rounded-lg hover:bg-[#035AA6] transition-colors"
                                            disabled={filteredUsers.length === 0}
                                        >
                                            <FaDownload />
                                            <span>Exportar a CSV</span>
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                    >
                                        <FaTimes className="mr-2" />
                                        Limpiar filtros
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 mb-6 rounded-lg">
                            <div className="flex items-center">
                                <FaExclamationTriangle className="text-red-400 mr-3" />
                                <p className="text-red-600">{error}</p>
                            </div>
                            <button
                                onClick={refreshUsers}
                                className="mt-2 text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                            >
                                <FaSync /> Intentar nuevamente
                            </button>
                        </div>
                    )}

                    {/* Contenido principal */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8"
                    >
                        {isLoading ? (
                            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FAAD9] mx-auto"></div>
                                <p className="mt-4 text-gray-600">Cargando usuarios...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                                <FaUsers className="mx-auto text-gray-300 text-5xl mb-4" />
                                <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron usuarios</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || filterRole !== "TODOS"
                                        ? 'No hay usuarios que coincidan con los filtros aplicados'
                                        : 'No hay usuarios registrados en el sistema'}
                                </p>
                                {(searchTerm || filterRole !== "TODOS") ? (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <FaPlus /> Crear primer usuario
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-[#5FAAD9] bg-opacity-10">
                                            <tr>
                                                {['Nombre', 'Apellido', 'C.D.I', 'Correo', 'Teléfono', 'Rol', 'Acciones'].map((header) => (
                                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            <AnimatePresence mode="popLayout">
                                                {paginatedUsers.map((user) => (
                                                    <motion.tr
                                                        key={user.cod_usuario}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="hover:bg-[#F9FBFF]"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{user.nombre || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{user.apellido || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{user.CID || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-[#5FAAD9] hover:underline">
                                                            {user.email ? (
                                                                <a href={`mailto:${user.email}`}>{user.email}</a>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {user.telefono ? (
                                                                <a href={`tel:${user.telefono}`} className="text-[#5FAAD9] hover:underline">
                                                                    {user.telefono}
                                                                </a>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                                                ${user.rol === 'PROFESIONAL' 
                                                                    ? 'bg-blue-100 text-blue-800' 
                                                                    : user.rol === 'CUIDADOR' 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {user.rol || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex space-x-3">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="text-yellow-500 hover:text-yellow-700 bg-yellow-50 p-2 rounded-lg transition-colors"
                                                                    onClick={() => {
                                                                        setUserToEdit(prepareUserForEdit(user));
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    title="Editar usuario"
                                                                >
                                                                    <FaEdit size={16} />
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
                                                                    onClick={() => {
                                                                        setUserToDelete(user.cod_usuario);
                                                                        setIsDeleteModalOpen(true);
                                                                    }}
                                                                    title="Eliminar usuario"
                                                                >
                                                                    <FaTrashAlt size={16} />
                                                                </motion.button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 mb-4">
                            <nav className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-2 rounded-lg flex items-center ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <FaChevronLeft className="mr-1" size={14} />
                                    Anterior
                                </button>
                                
                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                                                currentPage === index + 1
                                                    ? 'bg-[#5FAAD9] text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-2 rounded-lg flex items-center ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Siguiente
                                    <FaChevronRight className="ml-1" size={14} />
                                </button>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Modales */}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message="¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer."
                />

                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setUserToEdit(undefined);
                    }}
                    onSubmit={handleUserSubmit}
                    userToEdit={userToEdit}
                />
            </motion.div>
        </MainLayout>
    );
};

export default ManageUsersPage;