import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaSearch, FaDownload, FaEye, FaEdit, FaTrashAlt, FaCalendar, 
    FaPlus, FaFilter, FaHeartbeat, FaTint, FaWeight, FaRuler, 
    FaThermometerHalf, FaStethoscope, FaChevronLeft, 
    FaChevronRight, FaFileMedical, FaTimes
} from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import { HistoryService } from '../service/HistoryService';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import HistoryFormModal from '../components/HistoryFormModal';
import { useNavigate } from 'react-router-dom';

interface HistorialMedico {
    cod_historial: number;
    descripcion?: string;
    tipo_sangre?: string;
    presion_arterial: string;
    peso: number;
    estatura: number;
    temperatura?: number;
    nivel_glucosa?: number;
    fecha: Date | string;
    profesional_id: number;
    persona_id: number;
    estado: boolean;
    profesional?: {
        cod_usuario: number;
        nombre: string;
        apellido: string;
    };
    persona?: {
        cod_paciente: number;
        nombre: string;
        apellido: string;
        fecha_nacimiento?: Date;
        genero?: string;
        direccion?: string;
        telefono?: string;
        email?: string;
    };
}

const HistoryPage = () => {
    const [histories, setHistories] = useState<HistorialMedico[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<number | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [historialToEdit, setHistorialToEdit] = useState<HistorialMedico | null>(null);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);

    const itemsPerPage = 9;
    const navigate = useNavigate();
    
    const handleEdit = (historial: HistorialMedico) => {
        setHistorialToEdit({
            ...historial,
            fecha: typeof historial.fecha === 'string' ? new Date(historial.fecha) : historial.fecha
        });
        setIsFormModalOpen(true);
    };

    const fetchHistories = async () => {
        setIsLoading(true);
        try {
            const data = await HistoryService.getAllHistories();
            const transformedData = data.map(history => ({
                ...history,
                fecha: new Date(history.fecha),
                persona: history.persona ? {
                    ...history.persona,
                    cod_paciente: history.persona.cod_paciente || 0
                } : undefined
            }));
            setHistories(transformedData);
            toast.success('Historiales médicos cargados exitosamente');
        } catch (error) {
            console.error('Error al obtener historiales:', error);
            toast.error('Error al cargar los historiales médicos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistories();
    }, []);

    const filteredHistories = useMemo(() => {
        return histories.filter(history => {
            if (!history || !history.persona) return false;

            const nombreCompleto = `${history.persona.nombre} ${history.persona.apellido}`.toLowerCase();
            const matchesSearch = nombreCompleto.includes(searchTerm.toLowerCase());

            let matchesDate = true;
            if (filterDate) {
                let recetaDate: Date;
                if (typeof history.fecha === 'string') {
                    recetaDate = new Date(history.fecha);
                } else {
                    recetaDate = history.fecha;
                }

                if (isNaN(recetaDate.getTime())) {
                    console.error(`Fecha inválida para historial con ID ${history.cod_historial}: ${history.fecha}`);
                    matchesDate = false;
                } else {
                    matchesDate = recetaDate.toISOString().split('T')[0] === filterDate;
                }
            }

            return matchesSearch && matchesDate;
        });
    }, [histories, searchTerm, filterDate]);

    const paginatedHistories = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredHistories.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredHistories, currentPage]);

    const totalPages = Math.ceil(filteredHistories.length / itemsPerPage);

    const handleDelete = async () => {
        if (selectedHistory) {
            try {
                await HistoryService.deleteHistory(selectedHistory);
                await fetchHistories();
                setIsDeleteModalOpen(false);
                toast.success('Historial médico eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar historial:', error);
                toast.error('Error al eliminar el historial médico');
            }
        }
    };

    const exportToCSV = () => {
        const headers = ['Fecha', 'Paciente', 'Profesional', 'Presión Arterial', 'Peso', 'Estatura', 'Tipo Sangre', 'Temperatura', 'Glucosa'];
        const csvContent = [
            headers.join(','),
            ...filteredHistories.map(history => {
                const fecha = typeof history.fecha === 'string' ? new Date(history.fecha) : history.fecha;
                return [
                    fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
                    `${history.persona?.nombre} ${history.persona?.apellido}`,
                    `${history.profesional?.nombre} ${history.profesional?.apellido}`,
                    history.presion_arterial,
                    history.peso,
                    history.estatura,
                    history.tipo_sangre || 'N/A',
                    history.temperatura || 'N/A',
                    history.nivel_glucosa || 'N/A'
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'historiales_medicos.csv';
        link.click();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterDate('');
    };

    // Calcular IMC
    const calculateIMC = (peso: number, estatura: number): number => {
        // Estatura en metros (convertir de cm a m)
        const estaturaMetros = estatura / 100;
        return Number((peso / (estaturaMetros * estaturaMetros)).toFixed(2));
    };

    // Obtener clasificación de IMC
    const getIMCClassification = (imc: number): { text: string; color: string } => {
        if (imc < 18.5) return { text: 'Bajo peso', color: 'text-blue-600' };
        if (imc < 25) return { text: 'Normal', color: 'text-green-600' };
        if (imc < 30) return { text: 'Sobrepeso', color: 'text-yellow-600' };
        if (imc < 35) return { text: 'Obesidad I', color: 'text-orange-600' };
        if (imc < 40) return { text: 'Obesidad II', color: 'text-red-600' };
        return { text: 'Obesidad III', color: 'text-red-800' };
    };

    // Formatear fecha
    const formatDate = (date: Date | string): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                                <h1 className="text-2xl font-bold text-white">Historiales Médicos</h1>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                                        {filteredHistories.length} registros
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-600 flex items-center">
                                <FaFileMedical className="mr-2 text-[#5FAAD9]" />
                                Gestión de historiales médicos y registros de pacientes
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
                                        setHistorialToEdit(null);
                                        setIsFormModalOpen(true);
                                    }}
                                >
                                    <FaPlus className="mr-2" />
                                    Nuevo Historial
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
                                        <label className=" text-sm font-medium text-gray-700 flex items-center">
                                            <FaSearch className="mr-2 text-[#5FAAD9]" />
                                            Buscar por paciente
                                        </label>
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                                placeholder="Nombre del paciente..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className=" text-sm font-medium text-gray-700 flex items-center">
                                            <FaCalendar className="mr-2 text-[#5FAAD9]" />
                                            Filtrar por fecha
                                        </label>
                                        <div className="relative">
                                            <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="date"
                                                value={filterDate}
                                                onChange={(e) => setFilterDate(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className=" text-sm font-medium text-gray-700 flex items-center">
                                            <FaDownload className="mr-2 text-[#5FAAD9]" />
                                            Exportar datos
                                        </label>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={exportToCSV}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5FAAD9] text-white font-medium rounded-lg hover:bg-[#035AA6] transition-colors"
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

                    {/* Contenido principal */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8"
                    >
                        {isLoading ? (
                            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FAAD9] mx-auto"></div>
                                <p className="mt-4 text-gray-600">Cargando historiales médicos...</p>
                            </div>
                        ) : filteredHistories.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                                <FaFileMedical className="mx-auto text-gray-300 text-5xl mb-4" />
                                <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron historiales médicos</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || filterDate 
                                        ? 'No hay historiales que coincidan con los filtros aplicados' 
                                        : 'Aún no hay historiales médicos registrados en el sistema'}
                                </p>
                                {(searchTerm || filterDate) && (
                                    <button 
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedHistories.map((history) => {
                                    const imc = calculateIMC(history.peso, history.estatura);
                                    const imcClass = getIMCClassification(imc);
                                    
                                    return (
                                        <motion.div
                                            key={history.cod_historial}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                                        >
                                            {/* Encabezado de la tarjeta */}
                                            <div className="bg-[#5FAAD9] bg-opacity-10 px-4 py-3 border-b border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-semibold text-[#035AA6] flex items-center">
                                                        <FaStethoscope className="mr-2" />
                                                        Historial #{history.cod_historial}
                                                    </h3>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {formatDate(history.fecha)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Contenido de la tarjeta */}
                                            <div className="p-5">
                                                {/* Información del paciente */}
                                                <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                                    <h4 className="font-medium text-gray-800 mb-1">
                                                        {history.persona?.nombre} {history.persona?.apellido}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Atendido por Dr. {history.profesional?.nombre} {history.profesional?.apellido}
                                                    </p>
                                                </div>
                                                
                                                {/* Signos vitales */}
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center mb-1">
                                                            <FaHeartbeat className="text-red-500 mr-2" size={14} />
                                                            <p className="text-xs text-gray-500">Presión Arterial</p>
                                                        </div>
                                                        <p className="font-semibold text-gray-800">{history.presion_arterial}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center mb-1">
                                                            <FaTint className="text-red-500 mr-2" size={14} />
                                                            <p className="text-xs text-gray-500">Tipo de Sangre</p>
                                                        </div>
                                                        <p className="font-semibold text-gray-800">{history.tipo_sangre || 'No especificado'}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center mb-1">
                                                            <FaWeight className="text-blue-500 mr-2" size={14} />
                                                            <p className="text-xs text-gray-500">Peso</p>
                                                        </div>
                                                        <p className="font-semibold text-gray-800">{history.peso} kg</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center mb-1">
                                                            <FaRuler className="text-blue-500 mr-2" size={14} />
                                                            <p className="text-xs text-gray-500">Estatura</p>
                                                        </div>
                                                        <p className="font-semibold text-gray-800">{history.estatura} cm</p>
                                                    </div>
                                                </div>
                                                
                                                {/* IMC */}
                                                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Índice de Masa Corporal (IMC)</p>
                                                            <p className="font-semibold text-gray-800">{imc}</p>
                                                        </div>
                                                        <span className={`text-sm font-medium ${imcClass.color} bg-gray-100 px-2 py-1 rounded-full`}>
                                                            {imcClass.text}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Temperatura y glucosa */}
                                                {(history.temperatura || history.nivel_glucosa) && (
                                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                                        {history.temperatura && (
                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                <div className="flex items-center mb-1">
                                                                    <FaThermometerHalf className="text-red-500 mr-2" size={14} />
                                                                    <p className="text-xs text-gray-500">Temperatura</p>
                                                                </div>
                                                                <p className="font-semibold text-gray-800">{history.temperatura} °C</p>
                                                            </div>
                                                        )}
                                                        {history.nivel_glucosa && (
                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                <div className="flex items-center mb-1">
                                                                    <FaTint className="text-blue-500 mr-2" size={14} />
                                                                    <p className="text-xs text-gray-500">Nivel de Glucosa</p>
                                                                </div>
                                                                <p className="font-semibold text-gray-800">{history.nivel_glucosa} mg/dL</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* Descripción */}
                                                {history.descripcion && (
                                                    <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
                                                        <p className="text-xs text-gray-600 mb-1">Observaciones</p>
                                                        <p className="text-sm text-gray-800">{history.descripcion}</p>
                                                    </div>
                                                )}
                                                
                                                {/* Botones de acción */}
                                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="text-[#5FAAD9] hover:text-[#035AA6] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center text-sm"
                                                        onClick={() => navigate(`/${history.cod_historial}`)}
                                                    >
                                                        <FaEye className="mr-1" />
                                                        Ver detalles
                                                    </motion.button>
                                                    
                                                    <div className="flex space-x-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="text-yellow-500 hover:text-yellow-700 bg-yellow-50 p-2 rounded-lg transition-colors"
                                                            onClick={() => handleEdit(history)}
                                                            title="Editar historial"
                                                        >
                                                            <FaEdit size={16} />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
                                                            onClick={() => {
                                                                setSelectedHistory(history.cod_historial);
                                                                setIsDeleteModalOpen(true);
                                                            }}
                                                            title="Eliminar historial"
                                                        >
                                                            <FaTrashAlt size={16} />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
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
            </motion.div>
            
            {/* Modales */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
                message="¿Está seguro que desea eliminar este historial médico? Esta acción no se puede deshacer."
            />
            <HistoryFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={() => {
                    fetchHistories();
                    setIsFormModalOpen(false);
                }}
                historialToEdit={historialToEdit as any}
            />
        </MainLayout>
    );
};

export default HistoryPage;