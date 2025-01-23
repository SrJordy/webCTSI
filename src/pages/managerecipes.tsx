import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCalendar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as RecetaService from '../service/RecetaService';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import RecetaDetailModal from '../components/ModalReceta';

interface Medicamento {
    cod_medicamento: number;
    nombre: string;
    descripcion: string;
    frecuenciamin: number;
    cantidadtotal: number;
    receta_id: number;
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
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecetas();
    }, []);

    const fetchRecetas = async () => {
        try {
            setLoading(true);
            const response = await RecetaService.getAllRecetas();
            setRecetas(response || []);
        } catch (error) {
            console.error('Error al cargar las recetas:', error);
            toast.error('Error al cargar las recetas');
            setRecetas([]);
        } finally {
            setLoading(false);
        }
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

    // Paginación
    const indexOfLastReceta = currentPage * itemsPerPage;
    const indexOfFirstReceta = indexOfLastReceta - itemsPerPage;
    const currentRecetas = filteredRecetas.slice(indexOfFirstReceta, indexOfLastReceta);
    const totalPages = Math.ceil(filteredRecetas.length / itemsPerPage);

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen  -m-8 p-8"
            >
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="flex justify-between items-center mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-800">Recetas Médicas</h1>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#5FAAD9] text-white px-6 py-2 rounded-lg hover:bg-[#035AA6] transition-colors duration-300 flex items-center gap-2"
                            onClick={() => navigate('/Receta')}
                        >
                            <FaPlus className="mr-2" />
                            Nueva Receta
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg p-6 mb-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FaSearch className="inline mr-2" />
                                    Buscar por paciente
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                    placeholder="Nombre del paciente..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FaCalendar className="inline mr-2" />
                                    Filtrar por fecha
                                </label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Cargando recetas...</p>
                            </div>
                        ) : filteredRecetas.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">No se encontraron recetas</p>
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
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={async () => {
                                                const recetaConMedicamentos = await RecetaService.getRecetaConMedicamentos(receta.cod_receta);
                                                setSelectedReceta(recetaConMedicamentos);
                                                setShowDetailModal(true);
                                            }}
                                        >
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {`Receta# ${receta.cod_receta}`}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Paciente: {`${receta.persona.nombre} ${receta.persona.apellido}`}
                                                </p>
                                                <p className="text-sm text-gray-600">CID: {receta.persona.CID}</p>
                                                <p className="text-sm text-gray-600">
                                                    Fecha: {new Date(receta.fecha).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Doctor: {`${receta.profesional.nombre} ${receta.profesional.apellido}`}
                                                </p>
                                                <div className="flex justify-end mt-4">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-yellow-500 hover:text-yellow-700 mr-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/receta/${receta.cod_receta}`);
                                                        }}
                                                    >
                                                        <FaEdit size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedReceta(receta);
                                                            setShowDeleteModal(true);
                                                        }}
                                                    >
                                                        <FaTrash size={20}/>
                                                    </motion.button>
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
                        <div className="flex justify-center mt-4">
                            <nav className="flex gap-2">
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={`px-4 py-2 rounded-lg ${currentPage === index + 1
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </motion.div>
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
        </MainLayout>
    );
};

export default RecetasListPage;