import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaEdit, FaTrashAlt, FaPlus, FaCalendarAlt, FaUser, FaClipboardList, FaCalendarCheck, FaCalendarDay } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import { TratamientoService } from '../service/TratamientoService';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import TratamientoFormModal from '../components/TratamientoFormModal';

export interface Tratamiento {
    cod_tratamiento: number;
    descripcion: string;
    fechainicio: Date | string;
    fechafin: Date | string;
    persona_id?: number;
    estado?: boolean;
    historial_id: number;
    historial?: {
        persona?: {
            cod_paciente: number;
            nombre: string;
            apellido: string;
        };
    };
}

const TratamientosListPage = () => {
    const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTratamiento, setSelectedTratamiento] = useState<number | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [tratamientoToEdit, setTratamientoToEdit] = useState<Tratamiento | null>(null);

    const itemsPerPage = 6; // Reducido para mostrar tarjetas más grandes

    const fetchTratamientos = async () => {
        setIsLoading(true);
        try {
            const data = await TratamientoService.getAllTratamientos() as Tratamiento[];
            console.log('Tratamientos obtenidos:', data);
            setTratamientos(data);
            toast.success('Tratamientos cargados exitosamente');
        } catch (error) {
            console.error('Error al obtener tratamientos:', error);
            toast.error('Error al cargar los tratamientos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTratamientos();
    }, []);

    const filteredTratamientos = useMemo(() => {
        return tratamientos.filter(tratamiento => {
            const pacienteNombre = tratamiento.historial?.persona?.nombre.toLowerCase() || '';
            const pacienteApellido = tratamiento.historial?.persona?.apellido.toLowerCase() || '';
            const descripcion = tratamiento.descripcion.toLowerCase();
            const searchTermLower = searchTerm.toLowerCase();

            return (
                descripcion.includes(searchTermLower) ||
                pacienteNombre.includes(searchTermLower) ||
                pacienteApellido.includes(searchTermLower)
            );
        });
    }, [tratamientos, searchTerm]);

    const paginatedTratamientos = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTratamientos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTratamientos, currentPage]);

    const totalPages = Math.ceil(filteredTratamientos.length / itemsPerPage);

    const handleDelete = async () => {
        if (selectedTratamiento) {
            try {
                await TratamientoService.deleteTratamiento(selectedTratamiento);
                await fetchTratamientos();
                setIsDeleteModalOpen(false);
                toast.success('Tratamiento eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar tratamiento:', error);
                toast.error('Error al eliminar el tratamiento');
            }
        }
    };

    // Función para calcular el estado del tratamiento
    const getTratamientoStatus = (fechaInicio: Date | string, fechaFin: Date | string) => {
        const now = new Date();
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        if (now < inicio) return { status: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: <FaCalendarDay className="text-yellow-600" /> };
        if (now > fin) return { status: 'Completado', color: 'bg-green-100 text-green-800', icon: <FaCalendarCheck className="text-green-600" /> };
        return { status: 'En progreso', color: 'bg-blue-100 text-blue-800', icon: <FaCalendarAlt className="text-blue-600" /> };
    };

    // Función para formatear fechas
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Calcular días restantes o días transcurridos
    const getDaysInfo = (fechaInicio: Date | string, fechaFin: Date | string) => {
        const now = new Date();
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        const oneDay = 24 * 60 * 60 * 1000; // horas*minutos*segundos*milisegundos
        
        if (now < inicio) {
            const daysUntilStart = Math.round(Math.abs((inicio.getTime() - now.getTime()) / oneDay));
            return { text: `Comienza en ${daysUntilStart} día${daysUntilStart !== 1 ? 's' : ''}`, color: 'text-yellow-600' };
        }
        
        if (now > fin) {
            const daysSinceEnd = Math.round(Math.abs((now.getTime() - fin.getTime()) / oneDay));
            return { text: `Finalizado hace ${daysSinceEnd} día${daysSinceEnd !== 1 ? 's' : ''}`, color: 'text-green-600' };
        }
        
        const daysLeft = Math.round(Math.abs((fin.getTime() - now.getTime()) / oneDay));
        return { text: `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`, color: 'text-blue-600' };
    };

    // Función para truncar texto largo
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-full p-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Tratamientos Médicos
                        </h1>
                        <p className="text-gray-600">
                            Gestión de tratamientos para pacientes
                            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {filteredTratamientos.length} registros
                            </span>
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#5FAAD9] text-white px-6 py-3 rounded-lg hover:bg-[#035AA6] transition-colors duration-300 flex items-center gap-2 shadow-md"
                        onClick={() => {
                            setTratamientoToEdit(null);
                            setIsFormModalOpen(true);
                        }}
                    >
                        <FaPlus className="mr-2" />
                        Nuevo Tratamiento
                    </motion.button>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-md mb-8">
                    <div className="flex items-center">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por paciente o descripción..."
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FAAD9]"></div>
                    </div>
                ) : paginatedTratamientos.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <FaClipboardList className="text-gray-300 text-6xl mb-4" />
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron tratamientos</h3>
                            <p className="text-gray-500 mb-6">No hay tratamientos que coincidan con tu búsqueda</p>
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Limpiar búsqueda
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {paginatedTratamientos.map((tratamiento) => {
                            const statusInfo = getTratamientoStatus(tratamiento.fechainicio, tratamiento.fechafin);
                            const daysInfo = getDaysInfo(tratamiento.fechainicio, tratamiento.fechafin);
                            
                            return (
                                <motion.div
                                    key={tratamiento.cod_tratamiento}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 h-full flex flex-col"
                                >
                                    {/* Encabezado con estado */}
                                    <div className={`${statusInfo.color} px-4 py-3 flex items-center justify-between`}>
                                        <div className="flex items-center">
                                            <div className="mr-2">
                                                {statusInfo.icon}
                                            </div>
                                            <span className="font-medium">{statusInfo.status}</span>
                                        </div>
                                        <span className={`text-xs font-medium ${daysInfo.color} bg-white bg-opacity-50 px-2 py-1 rounded-full`}>
                                            {daysInfo.text}
                                        </span>
                                    </div>
                                    
                                    {/* Contenido principal */}
                                    <div className="p-6 flex-grow">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4 line-clamp-2">
                                            {truncateText(tratamiento.descripcion, 100)}
                                        </h3>
                                        
                                        {/* Información del paciente */}
                                        <div className="flex items-center mb-5 bg-gray-50 p-3 rounded-lg">
                                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                                <FaUser className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Paciente</p>
                                                <p className="font-medium text-gray-800">
                                                    {tratamiento.historial?.persona?.nombre} {tratamiento.historial?.persona?.apellido}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Fechas */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Fecha Inicio</p>
                                                <p className="font-medium text-gray-800 flex items-center">
                                                    <FaCalendarAlt className="text-gray-400 mr-2" size={14} />
                                                    {formatDate(tratamiento.fechainicio)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Fecha Fin</p>
                                                <p className="font-medium text-gray-800 flex items-center">
                                                    <FaCalendarAlt className="text-gray-400 mr-2" size={14} />
                                                    {formatDate(tratamiento.fechafin)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Pie de tarjeta con acciones */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                            ID: {tratamiento.cod_tratamiento}
                                        </span>
                                        <div className="flex space-x-3">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="text-[#5FAAD9] hover:text-[#035AA6] bg-blue-50 p-2 rounded-lg transition-colors"
                                                onClick={() => {
                                                    setTratamientoToEdit(tratamiento);
                                                    setIsFormModalOpen(true);
                                                }}
                                                title="Editar tratamiento"
                                            >
                                                <FaEdit size={18} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
                                                onClick={() => {
                                                    setSelectedTratamiento(tratamiento.cod_tratamiento);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                title="Eliminar tratamiento"
                                            >
                                                <FaTrashAlt size={18} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <nav className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Anterior
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 rounded-lg ${
                                        currentPage === page
                                            ? 'bg-[#5FAAD9] text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Siguiente
                            </button>
                        </nav>
                    </div>
                )}

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    message="¿Estás seguro de que quieres eliminar este tratamiento?"
                />
                <TratamientoFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={() => {
                        fetchTratamientos();
                        setIsFormModalOpen(false);
                    }}
                    tratamientoToEdit={tratamientoToEdit || undefined}
                />
            </motion.div>
        </MainLayout>
    );
};

export default TratamientosListPage;