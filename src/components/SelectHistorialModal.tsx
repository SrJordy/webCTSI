import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { HistoryService } from '../service/HistoryService';
import { FaSearch } from 'react-icons/fa';

interface HistorialMedico {
    cod_historial: number;
    descripcion?: string;
    fecha: Date | string;
    persona?: {
        nombre: string;
        apellido: string;
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
        }
    }, [isOpen]);

    const filteredHistoriales = historiales.filter(historial => {
        const nombreCompleto = `${historial.persona?.nombre} ${historial.persona?.apellido}`.toLowerCase();
        return nombreCompleto.includes(searchTerm.toLowerCase());
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Seleccionar Historial Médico</h2>
                            <div className="relative mb-4">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por paciente..."
                                    className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {isLoading ? (
                                <p>Cargando historiales...</p>
                            ) : (
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredHistoriales.length > 0 ? (
                                        filteredHistoriales.map(historial => (
                                            <div
                                                key={historial.cod_historial}
                                                className="p-4 border-b cursor-pointer hover:bg-gray-100"
                                                onClick={() => {
                                                    onSelect(historial);
                                                    onClose();
                                                }}
                                            >
                                                <h3 className="font-semibold">
                                                    Historial de: {historial.persona?.nombre} {historial.persona?.apellido}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Fecha: {new Date(historial.fecha).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No se encontraron historiales.</p>
                                    )}
                                </div>
                            )}
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cerrar
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