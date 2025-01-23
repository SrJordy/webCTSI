import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ExamenService } from '../service/examService';
import SelectHistorialModal from './SelectHistorialModal';
import SuccessModal from './SuccessModal';

interface ExamenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    examen?: {
        cod_examen?: number;
        tipo: string;
        resultados: string;
        fecha: string;
        historial_id: number;
        historial?: {
            persona?: {
                nombre: string;
                apellido: string;
            };
        };
    } | null;
}

const ExamenModal = ({ isOpen, onClose, onSubmit, examen }: ExamenModalProps) => {
    const [formData, setFormData] = useState({
        tipo: '',
        resultados: '',
        fecha: new Date().toISOString().split('T')[0],
        historial_id: 0,
    });

    const [displayFormData, setDisplayFormData] = useState({
        tipo: '',
        resultados: '',
        fecha: new Date().toISOString().split('T')[0],
        historial_id: 0,
        pacienteNombre: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSelectHistorialModalOpen, setIsSelectHistorialModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (examen) {
                setFormData({
                    tipo: examen.tipo || '',
                    resultados: examen.resultados || '',
                    fecha: new Date(examen.fecha).toISOString().split('T')[0],
                    historial_id: examen.historial_id,
                });
                setDisplayFormData({
                    tipo: examen.tipo || '',
                    resultados: examen.resultados || '',
                    fecha: new Date(examen.fecha).toISOString().split('T')[0],
                    historial_id: examen.historial_id,
                    pacienteNombre: `${examen.historial?.persona?.nombre} ${examen.historial?.persona?.apellido}`
                });
            } else {
                resetForm();
            }
        }
    }, [isOpen, examen]);

    const resetForm = () => {
        setFormData({
            tipo: '',
            resultados: '',
            fecha: new Date().toISOString().split('T')[0],
            historial_id: 0,
        });
        setDisplayFormData({
            tipo: '',
            resultados: '',
            fecha: new Date().toISOString().split('T')[0],
            historial_id: 0,
            pacienteNombre: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
                fecha: formData.fecha
            };

            if (examen?.cod_examen) {
                await ExamenService.updateExamen(examen.cod_examen, dataToSubmit);
                setSuccessMessage('Examen actualizado exitosamente');
                toast.success('Examen actualizado exitosamente');
            } else {
                if (!formData.historial_id) {
                    toast.error('Debe seleccionar un historial médico');
                    return;
                }
                await ExamenService.createExamen(dataToSubmit);
                setSuccessMessage('Examen creado exitosamente');
                toast.success('Examen creado exitosamente');
            }
            setShowSuccessModal(true);
            onSubmit();
            onClose();
        } catch (error: unknown) {
            console.error('Error en handleSubmit:', error);
            if (error instanceof Error) {
                const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || error.message || 'Error al procesar el examen';
                toast.error(errorMessage);
            } else {
                toast.error('Error al procesar el examen');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        onSubmit();
        onClose();
    };

    return (
        <>
            <AnimatePresence mode="wait">
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
                                <h2 className="text-2xl font-bold mb-4">
                                    {examen ? 'Editar Examen' : 'Registrar Nuevo Examen'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Historial Médico
                                        </label>
                                        <div className="flex justify-between items-center">
                                            <button
                                                type="button"
                                                onClick={() => setIsSelectHistorialModalOpen(true)}
                                                className={`w-full p-2 border rounded-lg text-left text-gray-500 hover:bg-gray-50 ${examen ? 'cursor-not-allowed opacity-50' : ''}`}
                                                disabled={!!examen}
                                            >
                                                {displayFormData.historial_id ? `Historial de: ${displayFormData.pacienteNombre}` : 'Seleccionar historial...'}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo de Examen
                                        </label>
                                        <input
                                            type="text"
                                            value={displayFormData.tipo}
                                            onChange={(e) => {
                                                setFormData({ ...formData, tipo: e.target.value });
                                                setDisplayFormData({ ...displayFormData, tipo: e.target.value });
                                            }}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Resultados
                                        </label>
                                        <textarea
                                            value={displayFormData.resultados}
                                            onChange={(e) => {
                                                setFormData({ ...formData, resultados: e.target.value });
                                                setDisplayFormData({ ...displayFormData, resultados: e.target.value });
                                            }}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha
                                        </label>
                                        <input
                                            type="date"
                                            value={displayFormData.fecha}
                                            onChange={(e) => {
                                                setFormData({ ...formData, fecha: e.target.value });
                                                setDisplayFormData({ ...displayFormData, fecha: e.target.value });
                                            }}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isLoading ? 'Guardando...' : examen ? 'Actualizar' : 'Registrar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SelectHistorialModal
                isOpen={isSelectHistorialModalOpen}
                onClose={() => setIsSelectHistorialModalOpen(false)}
                onSelect={(historial) => {
                    setFormData((prev) => ({
                        ...prev,
                        historial_id: historial.cod_historial
                    }));
                    setDisplayFormData((prev) => ({
                        ...prev,
                        historial_id: historial.cod_historial,
                        pacienteNombre: `${historial.persona?.nombre} ${historial.persona?.apellido}`
                    }));
                    setIsSelectHistorialModalOpen(false);
                }}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                message={successMessage}
            />
        </>
    );
};

export default ExamenModal;