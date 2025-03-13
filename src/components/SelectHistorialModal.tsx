import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { HistoryService } from '../service/HistoryService';
import { 
    FaSearch, 
    FaUserInjured, 
    FaCalendarAlt, 
    FaTimes, 
    FaClipboardList, 
    FaHeartbeat, 
    FaWeight, 
    FaRuler, 
    FaCheck 
} from 'react-icons/fa';

interface HistorialMedico {
    cod_historial: number;
    descripcion?: string;
    fecha: Date | string;
    presion_arterial?: string;
    peso?: number;
    estatura?: number;
    persona?: {
        nombre: string;
        apellido: string;
        CID?: string;
    };
}

interface SelectHistorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (historial: HistorialMedico) => void;
}

const SelectHistorialModal: React.FC<SelectHistorialModalProps> = ({
    isOpen,
    onClose,
    onSelect
}) => {
    const [historiales, setHistoriales] = useState<HistorialMedico[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedHistorial, setSelectedHistorial] = useState<number | null>(null);

    const fetchHistoriales = async () => {
        setIsLoading(true);
        try {
            const data = await HistoryService.getAllHistories();
            setHistoriales(data);
        } catch (error) {
            console.error('Error al obtener historiales:', error);
            toast.error('Error al cargar los historiales médicos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistoriales();
            setSearchTerm('');
            setSelectedHistorial(null);
        }
    }, [isOpen]);

    const filteredHistoriales = historiales.filter(historial => {
        if (!historial.persona) return false;
        
        const nombreCompleto = `${historial.persona?.nombre} ${historial.persona?.apellido}`.toLowerCase();
        const cid = historial.persona?.CID?.toLowerCase() || '';
        return nombreCompleto.includes(searchTerm.toLowerCase()) || cid.includes(searchTerm.toLowerCase());
    });

    const formatDate = (dateString: string | Date) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const handleSelect = (historial: HistorialMedico) => {
        setSelectedHistorial(historial.cod_historial);
        // Pequeña pausa para mostrar la selección antes de cerrar
        setTimeout(() => {
            onSelect(historial);
            onClose();
        }, 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#5FAAD9] px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <FaClipboardList className="mr-2" />
                                Seleccionar Historial Médico
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre o CDI del paciente..."
                                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent bg-gray-50"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Historiales List */}
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FAAD9] mb-4"></div>
                                    <p className="text-gray-600">Cargando historiales médicos...</p>
                                </div>
                            ) : (
                                <div className="max-h-96 overflow-y-auto pr-2 -mr-2">
                                    {filteredHistoriales.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {filteredHistoriales.map(historial => (
                                                <motion.div
                                                    key={historial.cod_historial}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                                        selectedHistorial === historial.cod_historial
                                                            ? 'border-[#5FAAD9] bg-blue-50 shadow-md'
                                                            : 'border-gray-200 hover:border-[#5FAAD9] hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => handleSelect(historial)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800 flex items-center">
                                                                <FaUserInjured className="text-[#5FAAD9] mr-2" />
                                                                {historial.persona?.nombre} {historial.persona?.apellido}
                                                            </h3>
                                                            {historial.persona?.CID && (
                                                                <p className="text-sm text-gray-500 mt-1 ml-6">
                                                                    CDI: {historial.persona.CID}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                                                                <FaCalendarAlt className="mr-1" size={10} />
                                                                {formatDate(historial.fecha)}
                                                            </span>
                                                            {selectedHistorial === historial.cod_historial && (
                                                                <div className="ml-2 bg-green-500 text-white p-1 rounded-full">
                                                                    <FaCheck size={12} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Signos vitales */}
                                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                                        {historial.presion_arterial && (
                                                            <div className="bg-gray-50 p-2 rounded border border-gray-100 flex items-center">
                                                                <FaHeartbeat className="text-red-500 mr-2" size={12} />
                                                                <div>
                                                                    <p className="text-xs text-gray-500">Presión</p>
                                                                    <p className="text-sm font-medium">{historial.presion_arterial}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {historial.peso && (
                                                            <div className="bg-gray-50 p-2 rounded border border-gray-100 flex items-center">
                                                                <FaWeight className="text-blue-500 mr-2" size={12} />
                                                                <div>
                                                                    <p className="text-xs text-gray-500">Peso</p>
                                                                    <p className="text-sm font-medium">{historial.peso} kg</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {historial.estatura && (
                                                            <div className="bg-gray-50 p-2 rounded border border-gray-100 flex items-center">
                                                                <FaRuler className="text-blue-500 mr-2" size={12} />
                                                                <div>
                                                                    <p className="text-xs text-gray-500">Estatura</p>
                                                                    <p className="text-sm font-medium">{historial.estatura} cm</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                            <FaClipboardList className="mx-auto text-gray-300 text-4xl mb-3" />
                                            <p className="text-gray-600 font-medium">No se encontraron historiales médicos</p>
                                            <p className="text-gray-500 text-sm mt-1">
                                                {searchTerm 
                                                    ? "Intenta con otro término de búsqueda" 
                                                    : "No hay historiales médicos registrados en el sistema"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                >
                                    <FaTimes className="mr-2" />
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SelectHistorialModal;