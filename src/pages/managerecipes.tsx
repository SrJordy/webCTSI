import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCalendar, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as RecetaService from '../service/RecetaService';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';

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
    fecha_creacion: string;
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

const RecetaDetailModal = ({ isOpen, onClose, receta }) => {
    if (!receta) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto pointer-events-auto"
                        >
                            {/* ... (contenido del modal igual al proporcionado anteriormente) ... */}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export const RecetasListPage = () => {
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedReceta, setSelectedReceta] = useState<Receta | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        fetchRecetas();
    }, []);



    const groupMedicamentosByReceta = (recetas: Receta[]) => {
        return recetas.map(receta => ({
            ...receta,
            medicamentos: receta.medicamentos.filter(med => med.cod_receta === receta.cod_receta)
        }));
    };

    const fetchRecetas = async () => {
        try {
            setLoading(true);
            const response = await RecetaService.getAllRecetas();
            console.log('Datos recibidos:', response);
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
            toast.error('Error al eliminar la receta');
        }
        setShowDeleteModal(false);
        setSelectedReceta(null);
    };

    const groupRecetas = (recetas: Receta[]) => {
        const grouped = recetas.reduce((acc, receta) => {
            // Si ya existe la receta, solo agregamos los medicamentos
            if (acc[receta.cod_receta]) {
                if (receta.medicamentos) {
                    acc[receta.cod_receta].medicamentos = [
                        ...acc[receta.cod_receta].medicamentos,
                        ...receta.medicamentos
                    ];
                }
            } else {
                // Si no existe, creamos una nueva entrada
                acc[receta.cod_receta] = {
                    ...receta,
                    medicamentos: receta.medicamentos || []
                };
            }
            return acc;
        }, {} as { [key: number]: Receta });

        return Object.values(grouped);
    };

    const filteredRecetas = groupRecetas(recetas).filter(receta => {
        if (!receta || !receta.persona) return false;

        const nombreCompleto = `${receta.persona.nombre} ${receta.persona.apellido}`.toLowerCase();
        const matchesSearch = nombreCompleto.includes(searchTerm.toLowerCase());

        // Formatear las fechas para comparación
        let matchesDate = true;
        if (dateFilter) {
            const recetaDate = new Date(receta.fecha_creacion).toISOString().split('T')[0];
            matchesDate = recetaDate === dateFilter;
        }

        return matchesSearch && matchesDate;
    });
    useEffect(() => {
        if (dateFilter) {
            console.log('Fecha filtro:', dateFilter);
            console.log('Recetas filtradas:', filteredRecetas);
        }
    }, [dateFilter, filteredRecetas]);


    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 -m-8 p-8"
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
                            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
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
                                    {filteredRecetas.map((receta) => (
                                        <motion.div
                                            key={receta.cod_receta}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => {
                                                console.log('Receta seleccionada:', receta);
                                                setSelectedReceta(receta);
                                                setShowDetailModal(true);
                                            }}
                                        >
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {`${receta.persona.nombre} ${receta.persona.apellido}`}
                                                    </h3>
                                                    <div className="flex space-x-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="text-blue-500 hover:text-blue-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/receta/${receta.cod_receta}`);
                                                            }}
                                                        >
                                                            <FaEdit />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="text-red-500 hover:text-red-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedReceta(receta);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        >
                                                            <FaTrash />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600">CID: {receta.persona.CID}</p>
                                                <p className="text-sm text-gray-600">
                                                    Fecha: {new Date(receta.fecha_creacion).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Doctor: {`${receta.profesional.nombre} ${receta.profesional.apellido}`}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        )}
                    </motion.div>
                </div>
            </motion.div>
            <RecetaDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    console.log('Receta pasada al modal:', selectedReceta);
                    setShowDetailModal(false);
                    setSelectedReceta(null);                    
                }}
                receta={selectedReceta}
            />
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => handleDelete(selectedReceta?.cod_receta!)}
                title="Confirmar Eliminación"
                message="¿Está seguro que desea eliminar esta receta? Esta acción no se puede deshacer."
            />
        </MainLayout>
    );
};

export default RecetasListPage;