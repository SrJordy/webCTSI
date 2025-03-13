import { useEffect, useState, useMemo, useCallback } from "react";
import { getAllCitas, deleteCita } from "../service/citeService";
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
    FaCalendarAlt, 
    FaMapMarkerAlt, 
    FaUserAlt, 
    FaUserMd,
    FaClipboardList,
    FaTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import ConfirmModal from "../components/ConfirmModal";
import CitaModal from "../components/CitaModal";
import ViewCitaModal from "../components/ViewCitaModal";
import { toast } from "react-hot-toast";
import { Cita } from "../assets/Cita";

const CitasPage = () => {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [citaToDelete, setCitaToDelete] = useState<number | null>(null);
    const [citaToEdit, setCitaToEdit] = useState<Cita | null>(null);
    const [citaToView, setCitaToView] = useState<Cita | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const [filterDate, setFilterDate] = useState("");
    const itemsPerPage = 9;

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatDateForFilter = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const fetchCitas = async () => {
        setIsLoading(true);
        try {
            const data = await getAllCitas();
            setCitas(data);
            toast.success("Citas cargadas exitosamente");
        } catch (error) {
            console.error("Error al obtener las citas", error);
            toast.error("Error al cargar las citas");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCitas = useMemo(() => {
        return citas.filter((cita) => {
            const searchTermLower = searchTerm.toLowerCase().trim();
            
            const matchesSearch = 
                cita.motivo.toLowerCase().includes(searchTermLower) ||
                cita.lugar.toLowerCase().includes(searchTermLower) ||
                (cita.persona?.nombre?.toLowerCase() || "").includes(searchTermLower) ||
                (cita.persona?.apellido?.toLowerCase() || "").includes(searchTermLower) ||
                (cita.profesion?.nombre?.toLowerCase() || "").includes(searchTermLower) ||
                (cita.profesion?.apellido?.toLowerCase() || "").includes(searchTermLower);
            
            let matchesDate = true;
            if (filterDate) {
                matchesDate = formatDateForFilter(cita.fechahora) === filterDate;
            }
            
            return matchesSearch && matchesDate;
        });
    }, [citas, searchTerm, filterDate]);

    const paginatedCitas = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCitas.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCitas, currentPage]);

    const totalPages = Math.ceil(filteredCitas.length / itemsPerPage);

    // Función para abrir el modal de nueva cita
    const handleOpenNewCitaModal = useCallback(() => {
        setCitaToEdit(null);
        setIsModalOpen(true);
    }, []);

    // Función para abrir el modal de edición
    const handleEdit = useCallback((cita: Cita) => {
        setCitaToEdit({
            ...cita,
            fechahora: new Date(cita.fechahora).toISOString()
        });
        setIsModalOpen(true);
    }, []);

    // Función para abrir el modal de visualización
    const handleView = useCallback((cita: Cita) => {
        setCitaToView(cita);
        setIsViewModalOpen(true);
    }, []);

    // Función para cerrar el modal de cita y limpiar el estado
    const handleCloseCitaModal = useCallback(() => {
        setIsModalOpen(false);
        // Importante: Limpiar el estado después de un pequeño retraso
        // para evitar problemas de renderizado
        setTimeout(() => {
            setCitaToEdit(null);
        }, 100);
    }, []);

    const handleDelete = async () => {
        if (citaToDelete !== null) {
            try {
                await deleteCita(citaToDelete);
                setCitas(citas.filter((cita) => cita.cod_cita !== citaToDelete));
                toast.success("Cita eliminada exitosamente");
                setIsDeleteModalOpen(false);
            } catch (error) {
                console.error("Error al eliminar la cita", error);
                toast.error("Error al eliminar la cita");
            }
        }
    };

    const exportToCSV = () => {
        const headers = ["Fecha y Hora", "Lugar", "Motivo", "Paciente", "Profesional"];
        const csvContent = [
            headers.join(","),
            ...filteredCitas.map((cita) =>
                [
                    `"${formatDateTime(cita.fechahora)}"`,
                    `"${cita.lugar}"`,
                    `"${cita.motivo}"`,
                    `"${cita.persona?.nombre || ""} ${cita.persona?.apellido || ""}"`,
                    `"${cita.profesion?.nombre || ""} ${cita.profesion?.apellido || ""}"`,
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `citas_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        toast.success("Archivo CSV generado exitosamente");
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterDate("");
    };

    // Función para manejar el envío exitoso del formulario
    const handleCitaSubmit = useCallback(() => {
        fetchCitas();
        handleCloseCitaModal();
    }, [fetchCitas, handleCloseCitaModal]);

    useEffect(() => {
        fetchCitas();
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
                                <h1 className="text-2xl font-bold text-white">Gestión de Citas Médicas</h1>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                                        {filteredCitas.length} registros
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-600 flex items-center">
                                <FaCalendarAlt className="mr-2 text-[#5FAAD9]" />
                                Administración de citas médicas y agendamiento
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
                                    onClick={handleOpenNewCitaModal}
                                >
                                    <FaPlus className="mr-2" />
                                    Nueva Cita
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
                                            Buscar cita
                                        </label>
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                                placeholder="Motivo, lugar o paciente..."
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
                                            disabled={filteredCitas.length === 0}
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
                                <p className="mt-4 text-gray-600">Cargando citas...</p>
                            </div>
                        ) : filteredCitas.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                                <FaCalendarAlt className="mx-auto text-gray-300 text-5xl mb-4" />
                                <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron citas</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || filterDate
                                        ? 'No hay citas que coincidan con los filtros aplicados'
                                        : 'No hay citas registradas en el sistema'}
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
                                        onClick={handleOpenNewCitaModal}
                                        className="px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <FaPlus /> Agendar primera cita
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedCitas.map((cita) => (
                                    <motion.div
                                        key={cita.cod_cita}
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
                                                    <FaCalendarAlt className="mr-2" />
                                                    Cita #{cita.cod_cita}
                                                </h3>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                                                    <FaCalendarAlt className="mr-1" size={10} />
                                                    {formatDateTime(cita.fechahora)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Contenido de la tarjeta */}
                                        <div className="p-5">
                                            {/* Información del lugar */}
                                            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <FaMapMarkerAlt className="text-red-500 mr-2" size={14} />
                                                    <p className="text-xs text-gray-500">Lugar</p>
                                                </div>
                                                <p className="font-medium text-gray-800">{cita.lugar}</p>
                                            </div>
                                            
                                            {/* Información del paciente */}
                                            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center mb-2">
                                                    <FaUserAlt className="text-[#5FAAD9] mr-2" size={14} />
                                                    <p className="text-xs text-gray-500">Paciente</p>
                                                </div>
                                                <p className="font-medium text-gray-800">
                                                    {cita.persona
                                                        ? `${cita.persona.nombre} ${cita.persona.apellido}`
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
                                                    {cita.profesion
                                                        ? `${cita.profesion.nombre} ${cita.profesion.apellido}`
                                                        : "No disponible"}
                                                </p>
                                            </div>
                                            
                                            {/* Motivo */}
                                            <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <div className="flex items-center mb-2">
                                                    <FaClipboardList className="text-blue-500 mr-2" size={14} />
                                                    <p className="text-xs text-gray-600">Motivo</p>
                                                </div>
                                                <p className="text-sm text-gray-800 line-clamp-2">
                                                    {cita.motivo}
                                                </p>
                                            </div>
                                            
                                            {/* Botones de acción */}
                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="text-[#5FAAD9] hover:text-[#035AA6] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center text-sm"
                                                    onClick={() => handleView(cita)}
                                                >
                                                    <FaEye className="mr-1" />
                                                    Ver detalles
                                                </motion.button>
                                                
                                                <div className="flex space-x-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-yellow-500 hover:text-yellow-700 bg-yellow-50 p-2 rounded-lg transition-colors"
                                                        onClick={() => handleEdit(cita)}
                                                        title="Editar cita"
                                                    >
                                                        <FaEdit size={16} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
                                                        onClick={() => {
                                                            setCitaToDelete(cita.cod_cita);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        title="Eliminar cita"
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
                    message="¿Está seguro que desea eliminar esta cita? Esta acción no se puede deshacer."
                />

                {/* Usamos una clave única para forzar la recreación del componente */}
                <CitaModal
                    key={citaToEdit ? `edit-${citaToEdit.cod_cita}` : 'new-cita'}
                    isOpen={isModalOpen}
                    onClose={handleCloseCitaModal}
                    onSubmit={handleCitaSubmit}
                    cita={citaToEdit ? { ...citaToEdit, fechahora: new Date(citaToEdit.fechahora) } : null}
                />

                <ViewCitaModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    cita={citaToView}
                />
            </motion.div>
        </MainLayout>
    );
};

export default CitasPage;