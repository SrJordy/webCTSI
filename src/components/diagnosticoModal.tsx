import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { DiagnosticoService } from '../service/diagnosticoService';
import SelectHistorialModal from './SelectHistorialModal';
import SuccessModal from './SuccessModal';

interface DiagnosticoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    diagnostico?: {
        cod_diagnostico?: number;
        descripcion: string;
        fecha_diagnostico: string;
        historial_id: number;
        historial?: {
            persona?: {
                nombre: string;
                apellido: string;
            };
        };
    } | null;
}

const DiagnosticoModal: React.FC<DiagnosticoModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    diagnostico
}) => {
    const [formData, setFormData] = useState({
        descripcion: '',
        fecha_diagnostico: new Date().toLocaleDateString('en-CA'),
        historial_id: 0
    });

    const [selectedHistorial, setSelectedHistorial] = useState<Historial | null>(null);
    const [isSelectHistorialOpen, setIsSelectHistorialOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (diagnostico) {
            setFormData({
                descripcion: diagnostico.descripcion,
                fecha_diagnostico: new Date(diagnostico.fecha_diagnostico).toLocaleDateString('en-CA'),
                historial_id: diagnostico.historial_id
            });
            if (diagnostico.historial) {
                setSelectedHistorial({
                    cod_historial: diagnostico.historial_id,
                    persona: diagnostico.historial?.persona || { nombre: '', apellido: '' }
                });
            }
        } else {
            resetForm();
        }
    }, [diagnostico]);

    const resetForm = () => {
    setFormData({
        descripcion: '',
        fecha_diagnostico: new Date().toLocaleDateString('en-CA'),
        historial_id: 0
    });
    setSelectedHistorial(null);
    setErrors({});
};

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!selectedHistorial) {
            newErrors.historial_id = 'Debe seleccionar un historial médico';
        }
        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es requerida';
        }
        if (!formData.fecha_diagnostico) {
            newErrors.fecha_diagnostico = 'La fecha es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            if (diagnostico?.cod_diagnostico) {
                await DiagnosticoService.updateDiagnostico(diagnostico.cod_diagnostico, formData);
                toast.success('Diagnóstico actualizado exitosamente');
            } else {
                await DiagnosticoService.createDiagnostico(formData);
                toast.success('Diagnóstico creado exitosamente');
            }
            setIsSuccessModalOpen(true);
        } catch (error) {
            console.error('Error al guardar el diagnóstico:', error);
            toast.error('Error al guardar el diagnóstico');
        } finally {
            setIsLoading(false);
        }
    };

    interface Historial {
        cod_historial: number;
        persona?: {
            nombre: string;
            apellido: string;
        };
    }

    const handleSelectHistorial = (historial: Historial) => {
        setSelectedHistorial(historial);
        setFormData(prev => ({
            ...prev,
            historial_id: historial.cod_historial
        }));
        setIsSelectHistorialOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#5FAAD9] px-6 py-4 rounded-t-xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white">
                                    {diagnostico ? 'Editar' : 'Nuevo'} Diagnóstico
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Historial Médico Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Historial Médico
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 p-3 border rounded-lg bg-gray-50">
                                        {selectedHistorial ? (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-800">
                                                    {selectedHistorial.persona?.nombre} {selectedHistorial.persona?.apellido}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedHistorial(null)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">
                                                Ningún historial seleccionado
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsSelectHistorialOpen(true)}
                                        className="px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors"
                                    >
                                        Seleccionar
                                    </button>
                                </div>
                                {errors.historial_id && (
                                    <p className="text-red-500 text-sm">{errors.historial_id}</p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                    rows={4}
                                    placeholder="Ingrese la descripción del diagnóstico..."
                                />
                                {errors.descripcion && (
                                    <p className="text-red-500 text-sm">{errors.descripcion}</p>
                                )}
                            </div>

                            {/* Fecha */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha_diagnostico}
                                    onChange={(e) => setFormData({ ...formData, fecha_diagnostico: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                />
                                {errors.fecha_diagnostico && (
                                    <p className="text-red-500 text-sm">{errors.fecha_diagnostico}</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-[#5FAAD9] hover:bg-[#035AA6] font-semibold text-white rounded-lg transition-all duration-300 transform hover:scale-105 "
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Guardando...
                                        </span>
                                    ) : (
                                        'Guardar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Modales adicionales */}
                    <SelectHistorialModal
                        isOpen={isSelectHistorialOpen}
                        onClose={() => setIsSelectHistorialOpen(false)}
                        onSelect={handleSelectHistorial}
                    />

                    <SuccessModal
                        isOpen={isSuccessModalOpen}
                        onClose={() => {
                            setIsSuccessModalOpen(false);
                            onSubmit();
                            onClose();
                            resetForm();
                        }}
                        message={diagnostico
                            ? "¡Diagnóstico actualizado exitosamente!"
                            : "¡Diagnóstico creado exitosamente!"}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export default DiagnosticoModal;