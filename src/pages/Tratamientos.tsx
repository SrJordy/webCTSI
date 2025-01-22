import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
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

    const itemsPerPage = 8;

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
        return tratamientos.filter(tratamiento =>
            tratamiento.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
            } catch (error) {
                console.error('Error al eliminar tratamiento:', error);
            }
        }
    };

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-full p-8"
            >
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Tratamientos Médicos
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({filteredTratamientos.length} registros)
                        </span>
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center gap-2"
                        onClick={() => {
                            setTratamientoToEdit(null);
                            setIsFormModalOpen(true);
                        }}
                    >
                        <FaPlus className="mr-2" />
                        Nuevo Tratamiento
                    </motion.button>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex items-center">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por tratamiento..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="loader">Loading...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedTratamientos.map((tratamiento) => (
                            <motion.div
                                key={tratamiento.cod_tratamiento}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
                            >
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        {tratamiento.descripcion}
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600">
                                            <strong>Paciente:</strong> {tratamiento.historial?.persona?.nombre} {tratamiento.historial?.persona?.apellido}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Fecha Inicio:</strong> {new Date(tratamiento.fechainicio).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Fecha Fin:</strong> {new Date(tratamiento.fechafin).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex justify-end mt-4 space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => {
                                                setTratamientoToEdit(tratamiento);
                                                setIsFormModalOpen(true);
                                            }}
                                        >
                                            <FaEdit size={20} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => {
                                                setSelectedTratamiento(tratamiento.cod_tratamiento);
                                                setIsDeleteModalOpen(true);
                                            }}
                                        >
                                            <FaTrashAlt size={20} />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
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