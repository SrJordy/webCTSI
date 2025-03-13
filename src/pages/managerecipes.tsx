import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCalendar, FaUser, FaIdCard, FaUserMd, FaPills, FaEye, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as RecetaService from '../service/RecetaService';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import RecetaDetailModal from '../components/ModalReceta';
import EditRecetaModal from '../components/EditRecetaModal';

interface Medicamento {
    cod_medicamento: number;
    nombre: string;
    descripcion: string;
    frecuenciamin: number;
    cantidadtotal: number;
    receta_id: number;
    personaId: number;
}

interface Receta {
    cod_receta: number;
    fecha: string;
    persona: {
        cod_persona: number;
        nombre: string;
        apellido: string;
        CID: string;
        telefono: string;
    };
    profesional: {
        cod_profesional: number;
        nombre: string;
        apellido: string;
    };
    medicamentos: Medicamento[];
}

export const RecetasListPage = () => {
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedReceta, setSelectedReceta] = useState<Receta | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(9);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRecetaId, setSelectedRecetaId] = useState<number | null>(null);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchRecetas();
    }, []);

    const fetchRecetas = async () => {
        try {
            setLoading(true);
            const response = await RecetaService.getAllRecetas();
            setRecetas(response as unknown as Receta[] || []);
        } catch (error) {
            console.error('Error al cargar las recetas:', error);
            toast.error('Error al cargar las recetas');
            setRecetas([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEditReceta = (recetaId: number) => {
        setSelectedRecetaId(recetaId);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (recetaId: number) => {
        try {
            await RecetaService.deleteReceta(recetaId);
            toast.success('Receta eliminada exitosamente');
            fetchRecetas();
        } catch (error) {
            console.error('Error al eliminar las recetas:', error);
            toast.error('Error al eliminar las recetas');
            setRecetas([]);
        } finally {
            setLoading(false);
        }
        setShowDeleteModal(false);
        setSelectedReceta(null);
    };

    const filteredRecetas = recetas.filter(receta => {
        if (!receta || !receta.persona) return false;

        const nombreCompleto = `${receta.persona.nombre} ${receta.persona.apellido}`.toLowerCase();
        const matchesSearch = nombreCompleto.includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (dateFilter) {
            const recetaDate = new Date(receta.fecha);
            if (isNaN(recetaDate.getTime())) {
                console.error(`Fecha inválida para receta con ID ${receta.cod_receta}: ${receta.fecha}`);
                matchesDate = false;
            } else {
                matchesDate = recetaDate.toISOString().split('T')[0] === dateFilter;
            }
        }

        return matchesSearch && matchesDate;
    });

    const indexOfLastReceta = currentPage * itemsPerPage;
    const indexOfFirstReceta = indexOfLastReceta - itemsPerPage;
    const currentRecetas = filteredRecetas.slice(indexOfFirstReceta, indexOfLastReceta);
    const totalPages = Math.ceil(filteredRecetas.length / itemsPerPage);

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDateFilter('');
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
                                <h1 className="text-2xl font-bold text-white">Recetas Médicas</h1>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                                        {filteredRecetas.length} recetas
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-600 flex items-center">
                                <FaPills className="mr-2 text-[#5FAAD9]" />
                                Gestión de recetas médicas y medicamentos
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
                                    onClick={() => navigate('/Receta')}
                                >
                                    <FaPlus className="mr-2" />
                                    Nueva Receta
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className=" text-sm font-medium text-gray-700 flex items-center">
                                            <FaUser className="mr-2 text-[#5FAAD9]" />
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
                                                value={dateFilter}
                                                onChange={(e) => setDateFilter(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                    >
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
                        className="bg-white rounded-xl shadow-lg p-6 mb-8"
                    >
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FAAD9] mx-auto"></div>
                                <p className="mt-4 text-gray-600">Cargando recetas...</p>
                            </div>
                        ) : filteredRecetas.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <FaPills className="mx-auto text-gray-300 text-5xl mb-4" />
                                <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron recetas</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || dateFilter 
                                        ? 'No hay recetas que coincidan con los filtros aplicados' 
                                        : 'Aún no hay recetas registradas en el sistema'}
                                </p>
                                {(searchTerm || dateFilter) && (
                                    <button 
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        ) : (
                            <AnimatePresence>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentRecetas.map((receta) => (
                                        <motion.div
                                            key={receta.cod_receta}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                                        >
                                            {/* Encabezado de la tarjeta */}
                                            <div className="bg-[#5FAAD9] bg-opacity-10 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                                <h3 className="font-semibold text-[#035AA6] flex items-center">
                                                    <FaPills className="mr-2" />
                                                    Receta #{receta.cod_receta}
                                                </h3>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                    {formatDate(receta.fecha)}
                                                </span>
                                            </div>
                                            
                                            {/* Contenido de la tarjeta */}
                                            <div className="p-4">
                                                {/* Información del paciente */}
                                                <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-center mb-2">
                                                        <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                                                            <FaUser className="text-blue-600 text-sm" />
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {`${receta.persona.nombre} ${receta.persona.apellido}`}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FaIdCard className="text-gray-400 mr-2 text-sm" />
                                                        <p className="text-xs text-gray-600">CID: {receta.persona.CID}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Información del doctor */}
                                                <div className="mb-4">
                                                    <div className="flex items-center">
                                                        <FaUserMd className="text-gray-400 mr-2 text-sm" />
                                                        <p className="text-xs text-gray-600">
                                                            Dr. {`${receta.profesional.nombre} ${receta.profesional.apellido}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* Botones de acción */}
                                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="text-[#5FAAD9] hover:text-[#035AA6] bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center text-sm"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const recetaConMedicamentos = await RecetaService.getRecetaConMedicamentos(receta.cod_receta);
                                                            setSelectedReceta(recetaConMedicamentos as unknown as Receta);
                                                            setShowDetailModal(true);
                                                        }}
                                                    >
                                                        <FaEye className="mr-1" />
                                                        Ver detalles
                                                    </motion.button>
                                                    
                                                    <div className="flex space-x-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="text-yellow-500 hover:text-yellow-700 bg-yellow-50 p-2 rounded-lg transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditReceta(receta.cod_receta);
                                                            }}
                                                            title="Editar receta"
                                                        >
                                                            <FaEdit size={16} />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedReceta(receta);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            title="Eliminar receta"
                                                        >
                                                            <FaTrash size={16} />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
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
            <RecetaDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedReceta(null);
                }}
                receta={selectedReceta}
            />
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    if (selectedReceta) {
                        handleDelete(selectedReceta.cod_receta);
                    }
                }}
                title="Confirmar Eliminación"
                message="¿Está seguro que desea eliminar esta receta? Esta acción no se puede deshacer."
            />
            <EditRecetaModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                recetaId={selectedRecetaId || 0}
            />
        </MainLayout>
    );
};

export default RecetasListPage;