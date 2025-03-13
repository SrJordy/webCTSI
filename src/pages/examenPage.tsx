import { useEffect, useState, useMemo } from "react";
import { ExamenService } from "../service/examService";
import { 
    FaEdit, 
    FaTrashAlt, 
    FaSearch, 
    FaDownload, 
    FaPlus, 
    FaEye, 
    FaFilter, 
    FaChevronLeft, 
    FaChevronRight, 
    FaFileMedical, 
    FaCalendarAlt, 
    FaUserAlt, 
    FaUserMd,
    FaTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import ConfirmModal from "../components/ConfirmModal";
import ExamenModal from "../components/examenModal";
import ViewExamenModal from "../components/ViewExamenModal"; 
import { toast } from "react-hot-toast";

interface Examen {
    cod_examen: number;
    tipo: string;
    resultados: string;
    fecha: string;
    historial_id: number;
    historial?: {
        persona: {
            nombre: string;
            apellido: string;
        };
        profesional: {
            nombre: string;
            apellido: string;
        };
    };
}

const ExamenesPage = () => {
    const [exams, setExams] = useState<Examen[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false); 
    const [examToDelete, setExamToDelete] = useState<number | null>(null);
    const [examToEdit, setExamToEdit] = useState<Examen | null>(null);
    const [examToView, setExamToView] = useState<Examen | null>(null); 
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [filterDate, setFilterDate] = useState("");
    const itemsPerPage = 10;

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const fetchExams = async () => {
        setIsLoading(true);
        try {
            const data = await ExamenService.getAllExamenes();
            setExams(data);
            toast.success("Exámenes cargados exitosamente");
        } catch (error) {
            console.error("Error al obtener los exámenes", error);
            toast.error("Error al cargar los exámenes");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredExams = useMemo(() => {
        return exams.filter((exam) => {
            try {
                const searchTermLower = searchTerm.toLowerCase().trim();

                const matchesSearch =
                    (exam?.tipo?.toLowerCase() || "").includes(searchTermLower) ||
                    (exam?.resultados?.toLowerCase() || "").includes(searchTermLower) ||
                    (exam?.historial?.persona?.nombre?.toLowerCase() || "").includes(searchTermLower) ||
                    (exam?.historial?.persona?.apellido?.toLowerCase() || "").includes(searchTermLower);

                let matchesDate = true;
                if (filterDate) {
                    const examDate = new Date(exam.fecha);
                    matchesDate = examDate.toISOString().split('T')[0] === filterDate;
                }

                return matchesSearch && matchesDate;
            } catch (error) {
                console.error("Error al filtrar examen:", error);
                return false;
            }
        });
    }, [exams, searchTerm, filterDate]);

    const paginatedExams = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredExams.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredExams, currentPage]);

    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

    const handleEdit = (exam: Examen) => {
        setExamToEdit(exam);
        setIsModalOpen(true);
    };

    const handleView = (exam: Examen) => {
        setExamToView(exam);
        setIsViewModalOpen(true);
    };

    const handleDelete = async () => {
        if (examToDelete !== null) {
            try {
                await ExamenService.deleteExamen(examToDelete);
                setExams(exams.filter((exam) => exam.cod_examen !== examToDelete));
                toast.success("Examen eliminado exitosamente");
                setIsDeleteModalOpen(false);
            } catch (error) {
                console.error("Error al eliminar el examen", error);
                toast.error("Error al eliminar el examen");
            }
        }
    };

    const exportToCSV = () => {
        const headers = ["Tipo", "Resultados", "Fecha", "Paciente", "Profesional"];
        const csvContent = [
            headers.join(","),
            ...filteredExams.map((exam) =>
                [
                    `"${exam.tipo || ''}"`,
                    `"${exam.resultados || ''}"`,
                    `"${formatDate(exam.fecha) || ''}"`,
                    `"${exam.historial?.persona ? `${exam.historial.persona.nombre} ${exam.historial.persona.apellido}` : ''}"`,
                    `"${exam.historial?.profesional ? `${exam.historial.profesional.nombre} ${exam.historial.profesional.apellido}` : ''}"`,
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `examenes_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        toast.success("Archivo CSV generado exitosamente");
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterDate("");
    };

    useEffect(() => {
        fetchExams();
    }, []);

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
                                <h1 className="text-2xl font-bold text-white">Gestión de Exámenes</h1>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                                        {filteredExams.length} registros
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-600 flex items-center">
                                <FaFileMedical className="mr-2 text-[#5FAAD9]" />
                                Administración de exámenes médicos y resultados
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
                                    Nuevo Examen
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
                                            Buscar examen
                                        </label>
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                                placeholder="Tipo, resultados o paciente..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <FaCalendarAlt className="mr-2 text-[#5FAAD9]" />
                                            Filtrar por fecha
                                        </label>
                                        <div className="relative">
                                            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="date"
                                                value={filterDate}
                                                onChange={(e) => setFilterDate(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                            />
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
                                            disabled={filteredExams.length === 0}
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
                                <p className="mt-4 text-gray-600">Cargando exámenes...</p>
                            </div>
                        ) : filteredExams.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                                <FaFileMedical className="mx-auto text-gray-300 text-5xl mb-4" />
                                <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron exámenes</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || filterDate
                                        ? 'No hay exámenes que coincidan con los filtros aplicados'
                                        : 'No hay exámenes registrados en el sistema'}
                                </p>
                                {(searchTerm || filterDate) ? (
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
                                        <FaPlus /> Registrar primer examen
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedExams.map((exam) => (
                                    <motion.div
                                        key={exam.cod_examen}
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
                                                    <FaFileMedical className="mr-2" />
                                                    {exam.tipo}
                                                </h3>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                                                    <FaCalendarAlt className="mr-1" size={10} />
                                                    {formatDate(exam.fecha)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Contenido de la tarjeta */}
                                        <div className="p-5">
                                            {/* Información del paciente */}
                                            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <FaUserAlt className="text-[#5FAAD9] mr-2" size={14} />
                                                    <p className="text-xs text-gray-500">Paciente</p>
                                                </div>
                                                <p className="font-medium text-gray-800">
                                                    {exam.historial?.persona
                                                        ? `${exam.historial.persona.nombre} ${exam.historial.persona.apellido}`
                                                        : "No disponible"}
                                                </p>
                                            </div>
                                            
                                            {/* Información del profesional */}
                                            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <FaUserMd className="text-[#5FAAD9] mr-2" size={14} />
                                                    <p className="text-xs text-gray-500">Profesional</p>
                                                </div>
                                                <p className="font-medium text-gray-800">
                                                    {exam.historial?.profesional
                                                        ? `${exam.historial.profesional.nombre} ${exam.historial.profesional.apellido}`
                                                        : "No disponible"}
                                                </p>
                                            </div>
                                            
                                            {/* Resultados (preview) */}
                                            <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <p className="text-xs text-gray-600 mb-1">Resultados (resumen)</p>
                                                <p className="text-sm text-gray-800 line-clamp-2">
                                                    {exam.resultados || "Sin resultados registrados"}
                                                </p>
                                            </div>
                                            
                                            {/* Botones de acción */}
                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="text-[#5FAAD9] hover:text-[#035AA6] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center text-sm"
                                                    onClick={() => handleView(exam)}
                                                >
                                                    <FaEye className="mr-1" />
                                                    Ver detalles
                                                </motion.button>
                                                
                                                <div className="flex space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-yellow-500 hover:text-yellow-700 bg-yellow-50 p-2 rounded-lg transition-colors"
                                                        onClick={() => handleEdit(exam)}
                                                        title="Editar examen"
                                                    >
                                                        <FaEdit size={16} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
                                                        onClick={() => {
                                                            setExamToDelete(exam.cod_examen);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        title="Eliminar examen"
                                                    >
                                                        <FaTrashAlt size={16} />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
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
                    message="¿Está seguro que desea eliminar este examen? Esta acción no se puede deshacer."
                />

                <ExamenModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setExamToEdit(null);
                    }}
                    onSubmit={() => {
                        fetchExams();
                        setIsModalOpen(false);
                        setExamToEdit(null);
                    }}
                    examen={examToEdit}
                />

                <ViewExamenModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    examen={examToView}
                />
            </motion.div>
        </MainLayout>
    );
};

export default ExamenesPage;