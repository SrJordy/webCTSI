import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaDownload, FaEye, FaEdit, FaTrashAlt, FaCalendar, FaPlus } from 'react-icons/fa';
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

    const itemsPerPage = 8;
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
            } catch (error) {
                console.error('Error al eliminar historial:', error);
            }
        }
    };

    const exportToCSV = () => {
        const headers = ['Fecha', 'Paciente', 'Profesional', 'Presión Arterial', 'Peso', 'Estatura', 'IMC', 'Temperatura', 'Glucosa'];
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

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col overflow-hidden"
            >
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Historiales Médicos
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({filteredHistories.length} registros)
                        </span>
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#5FAAD9] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#035AA6] transition-colors flex items-center "
                        onClick={() => {
                            setHistorialToEdit(null);
                            setIsFormModalOpen(true);
                        }}
                    >
                        <FaPlus className="mr-2" />
                        Nuevo Historial
                    </motion.button>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por paciente o profesional..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaCalendar className="text-gray-400" />
                            <input
                                type="date"
                                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-[#5FAAD9] text-white font-semibold rounded-lg hover:bg-[#035AA6] transition-colors"
                        >
                            <FaDownload />
                            <span>Exportar CSV</span>
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center flex-1">
                        <div className="loader">Cargando...</div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                                {paginatedHistories.map((history) => (
                                    <motion.div
                                        key={history.cod_historial}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white rounded-lg shadow-md overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {history.persona?.nombre} {history.persona?.apellido}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {typeof history.fecha === 'string' ? new Date(history.fecha).toISOString().split('T')[0] : history.fecha.toISOString().split('T')[0]} {/* Formato YYYY-MM-DD */}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-blue-500 hover:text-blue-700"
                                                        onClick={() => navigate(`/${history.cod_historial}`)}
                                                    >
                                                        <FaEye size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-yellow-500 hover:text-yellow-700"
                                                        onClick={() => handleEdit(history)}
                                                    >
                                                        <FaEdit size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => {
                                                            setSelectedHistory(history.cod_historial);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                    >
                                                        <FaTrashAlt size={20} />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Presión Arterial</p>
                                                    <p className="font-semibold">{history.presion_arterial}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Tipo de Sangre</p>
                                                    <p className="font-semibold">{history.tipo_sangre || 'No especificado'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Peso</p>
                                                    <p className="font-semibold">{history.peso} kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Estatura</p>
                                                    <p className="font-semibold">{history.estatura} cm</p>
                                                </div>
                                            </div>

                                            <div className="border-t pt-4">
                                                <p className="text-sm text-gray-500">Atendido por</p>
                                                <p className="font-semibold">
                                                    Dr. {history.profesional?.nombre} {history.profesional?.apellido}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                            </div>

                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-center pb-6">
                                    <nav className="flex gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 rounded-lg ${currentPage === page
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    message="¿Estás seguro de que quieres eliminar este historial médico?"
                />
                <HistoryFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={() => {
                        fetchHistories();
                        setIsFormModalOpen(false);
                    }}
                    historialToEdit={historialToEdit}
                />
            </motion.div>
        </MainLayout>
    );
};

export default HistoryPage;