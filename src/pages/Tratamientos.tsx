import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaSearch, 
    FaEdit, 
    FaTrashAlt, 
    FaPlus, 
    FaCalendarAlt, 
    FaUser, 
    FaClipboardList, 
    FaCalendarCheck, 
    FaCalendarDay, 
    FaChevronLeft, 
    FaChevronRight,
    FaFilter,
    FaDownload,
    FaTimes,
} from 'react-icons/fa';
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

type FilterType = 'todos' | 'enProgreso' | 'completados';

const TratamientosListPage = () => {
    const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTratamiento, setSelectedTratamiento] = useState<number | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [tratamientoToEdit, setTratamientoToEdit] = useState<Tratamiento | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('todos');
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const fetchTratamientos = async () => {
        setIsLoading(true);
        try {
            const data = await TratamientoService.getAllTratamientos() as Tratamiento[];
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

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchTerm]);

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getTratamientoStatus = (fechaInicio: Date | string, fechaFin: Date | string) => {
        const now = new Date();
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        if (now < inicio) return { 
            status: 'Pendiente', 
            color: 'bg-yellow-100 text-yellow-800', 
            icon: <FaCalendarDay className="text-yellow-600" /> 
        };
        if (now > fin) return { 
            status: 'Completado', 
            color: 'bg-green-100 text-green-800', 
            icon: <FaCalendarCheck className="text-green-600" /> 
        };
        return { 
            status: 'En progreso', 
            color: 'bg-blue-100 text-blue-800', 
            icon: <FaCalendarAlt className="text-blue-600" /> 
        };
    };

    const getDaysInfo = (fechaInicio: Date | string, fechaFin: Date | string) => {
        const now = new Date();
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now < inicio) {
            const daysUntilStart = Math.round(Math.abs((inicio.getTime() - now.getTime()) / oneDay));
            return { 
                text: `Comienza en ${daysUntilStart} día${daysUntilStart !== 1 ? 's' : ''}`, 
                color: 'text-yellow-600' 
            };
        }
        
        if (now > fin) {
            const daysSinceEnd = Math.round(Math.abs((now.getTime() - fin.getTime()) / oneDay));
            return { 
                text: `Finalizado hace ${daysSinceEnd} día${daysSinceEnd !== 1 ? 's' : ''}`, 
                color: 'text-green-600' 
            };
        }
        
        const daysLeft = Math.round(Math.abs((fin.getTime() - now.getTime()) / oneDay));
        return { 
            text: `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`, 
            color: 'text-blue-600' 
        };
    };

    const exportToCSV = () => {
        const headers = ["ID", "Paciente", "Descripción", "Fecha Inicio", "Fecha Fin", "Estado"];
        const csvContent = [
            headers.join(","),
            ...filteredTratamientos.map((tratamiento) =>
                [
                    tratamiento.cod_tratamiento,
                    `"${tratamiento.historial?.persona?.nombre || ''} ${tratamiento.historial?.persona?.apellido || ''}"`,
                    `"${tratamiento.descripcion}"`,
                    `"${formatDate(tratamiento.fechainicio)}"`,
                    `"${formatDate(tratamiento.fechafin)}"`,
                    `"${getTratamientoStatus(tratamiento.fechainicio, tratamiento.fechafin).status}"`
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `tratamientos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        toast.success("Archivo CSV generado exitosamente");
    };
    const filteredTratamientos = useMemo(() => {
        const now = new Date();
        
        const searchFiltered = tratamientos.filter(tratamiento => {
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
        
        if (activeFilter === 'completados') {
            return searchFiltered.filter(tratamiento => {
                const fin = new Date(tratamiento.fechafin);
                return now > fin;
            });
        } else if (activeFilter === 'enProgreso') {
            return searchFiltered.filter(tratamiento => {
                const inicio = new Date(tratamiento.fechainicio);
                const fin = new Date(tratamiento.fechafin);
                return now >= inicio && now <= fin;
            });
        }
        
        return searchFiltered;
    }, [tratamientos, searchTerm, activeFilter]);

    const totalPages = Math.ceil(filteredTratamientos.length / itemsPerPage);
    
    const currentTratamientos = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredTratamientos.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredTratamientos, currentPage, itemsPerPage]);

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
    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-full"
            >
                {/* Header y Filtros */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
                >
                    <div className="bg-[#5FAAD9] px-6 py-4">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-white">Gestión de Tratamientos</h1>
                            <div className="flex items-center space-x-2">
                                <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                                    {filteredTratamientos.length} registros
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 flex items-center">
                            <FaClipboardList className="mr-2 text-[#5FAAD9]" />
                            Administración de tratamientos médicos
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
                                onClick={() => {
                                    setTratamientoToEdit(null);
                                    setIsFormModalOpen(true);
                                }}
                            >
                                <FaPlus className="mr-2" />
                                Nuevo Tratamiento
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Panel de Filtros */}
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
                                        Buscar tratamiento
                                    </label>
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                            placeholder="Paciente o descripción..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <FaCalendarAlt className="mr-2 text-[#5FAAD9]" />
                                        Estado del tratamiento
                                    </label>
                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveFilter('todos')}
                                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 flex-1 justify-center ${
                                                activeFilter === 'todos'
                                                    ? 'bg-[#5FAAD9] text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <FaClipboardList size={14} />
                                            Todos
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveFilter('enProgreso')}
                                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 flex-1 justify-center ${
                                                activeFilter === 'enProgreso'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                            }`}
                                        >
                                            <FaCalendarAlt size={14} />
                                            En Progreso
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveFilter('completados')}
                                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 flex-1 justify-center ${
                                                activeFilter === 'completados'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                            }`}
                                        >
                                            <FaCalendarCheck size={14} />
                                            Completados
                                        </motion.button>
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
                                        disabled={filteredTratamientos.length === 0}
                                    >
                                        <FaDownload />
                                        <span>Exportar a CSV</span>
                                    </motion.button>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setActiveFilter('todos');
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                >
                                    <FaTimes className="mr-2" />
                                    Limpiar filtros
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Contenido Principal */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FAAD9]"></div>
                    </div>
                ) : filteredTratamientos.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <FaClipboardList className="text-gray-300 text-6xl mb-4" />
                            <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron tratamientos</h3>
                            <p className="text-gray-500 mb-6">
                                {activeFilter !== 'todos' 
                                    ? `No hay tratamientos ${activeFilter === 'completados' ? 'completados' : 'en progreso'} que coincidan con tu búsqueda`
                                    : 'No hay tratamientos que coincidan con tu búsqueda'}
                            </p>
                            <div className="flex space-x-4">
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Limpiar búsqueda
                                    </button>
                                )}
                                {activeFilter !== 'todos' && (
                                    <button 
                                        onClick={() => setActiveFilter('todos')}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        Ver todos los tratamientos
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                {activeFilter === 'completados' ? (
                                    <>
                                        <FaCalendarCheck className="text-green-600 mr-2" />
                                        Tratamientos Completados
                                    </>
                                ) : activeFilter === 'enProgreso' ? (
                                    <>
                                        <FaCalendarAlt className="text-blue-600 mr-2" />
                                        Tratamientos en Progreso
                                    </>
                                ) : (
                                    <>
                                        <FaClipboardList className="text-gray-700 mr-2" />
                                        Todos los Tratamientos
                                    </>
                                )}
                                <span className="ml-2 text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                    {filteredTratamientos.length}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {currentTratamientos.map(tratamiento => {
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
                                                    {tratamiento.descripcion}
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
                            
                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-8 space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg ${
                                            currentPage === 1 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-[#5FAAD9] text-white hover:bg-[#035AA6]'
                                        } transition-colors`}
                                    >
                                        <FaChevronLeft size={16} />
                                    </button>
                                    
                                    <div className="flex space-x-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                                    currentPage === page
                                                        ? 'bg-[#5FAAD9] text-white font-medium'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg ${
                                            currentPage === totalPages 
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                : 'bg-[#5FAAD9] text-white hover:bg-[#035AA6]'
                                        } transition-colors`}
                                    >
                                        <FaChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modales */}
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
