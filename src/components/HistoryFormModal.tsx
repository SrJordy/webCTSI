import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWeight, FaRuler, FaThermometerHalf, FaTint, FaHeartbeat, FaNotesMedical } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { HistoryService } from '../service/HistoryService';
import SelectPatientModal from './SelectPatientModal';
import SuccessModal from './SuccessModal';

interface Paciente {
    cod_paciente: number;
    nombre: string;
    apellido: string;
    CID: string;
}

interface HistorialMedico {
    cod_historial: number;
    descripcion?: string;
    tipo_sangre?: string;
    presion_arterial: string;
    peso: number;
    estatura: number;
    temperatura?: number;
    nivel_glucosa?: number;
    fecha: Date;
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
        CID: string;
    };
}

interface HistoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    historialToEdit?: HistorialMedico | null;
}

const HistoryFormModal: React.FC<HistoryFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    historialToEdit
}) => {
    const getProfesionalId = (): number => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                return user.cod_usuario;
            }
            return 0;
        } catch (error) {
            console.error('Error al obtener el ID del profesional:', error);
            return 0;
        }
    };

    const [formData, setFormData] = useState({
        descripcion: '',
        tipo_sangre: '',
        presion_arterial: '',
        peso: '',
        estatura: '',
        temperatura: '',
        nivel_glucosa: '',
        fecha: new Date().toISOString().split('T')[0],
        profesional_id: getProfesionalId(),
        persona_id: 0
    });

    const resetForm = useCallback(() => {
        const profesionalId = getProfesionalId();
        setFormData({
            descripcion: '',
            tipo_sangre: '',
            presion_arterial: '',
            peso: '',
            estatura: '',
            temperatura: '',
            nivel_glucosa: '',
            fecha: new Date().toISOString().split('T')[0],
            profesional_id: profesionalId,
            persona_id: 0
        });
        setSelectedPatient(null);
    }, []);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSelectPatientModalOpen, setIsSelectPatientModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            const profesionalId = getProfesionalId();

            if (historialToEdit) {
                setFormData({
                    descripcion: historialToEdit.descripcion || '',
                    tipo_sangre: historialToEdit.tipo_sangre || '',
                    presion_arterial: historialToEdit.presion_arterial || '',
                    peso: historialToEdit.peso?.toString() || '',
                    estatura: historialToEdit.estatura?.toString() || '',
                    temperatura: historialToEdit.temperatura?.toString() || '',
                    nivel_glucosa: historialToEdit.nivel_glucosa?.toString() || '',
                    fecha: new Date(historialToEdit.fecha).toISOString().split('T')[0],
                    profesional_id: profesionalId,
                    persona_id: historialToEdit.persona_id
                });
                setSelectedPatient(historialToEdit.persona || null);
            } else {
                resetForm();
            }
        }
    }, [isOpen, historialToEdit,resetForm]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.profesional_id) {
                toast.error('No se pudo identificar al profesional');
                return;
            }

            const dataToSubmit = {
                ...formData,
                peso: Number(formData.peso),
                estatura: Number(formData.estatura),
                temperatura: formData.temperatura ? Number(formData.temperatura) : undefined,
                nivel_glucosa: formData.nivel_glucosa ? Number(formData.nivel_glucosa) : undefined,
                persona_id: selectedPatient?.cod_paciente || formData.persona_id,
                fecha: new Date(formData.fecha)
            };

            console.log('Datos a enviar:', dataToSubmit);

            if (historialToEdit) {
                await HistoryService.updateHistory(historialToEdit.cod_historial, dataToSubmit);
                setSuccessMessage('Historial médico actualizado exitosamente');
                toast.success('Historial médico actualizado exitosamente');

            } else {
                if (!selectedPatient) {
                    toast.error('Debe seleccionar un paciente');
                    return;
                }
                await HistoryService.createHistory(dataToSubmit);
                setSuccessMessage('Historial médico creado exitosamente');
                toast.success('Historial médico creado exitosamente');
            }
            setShowSuccessModal(true);

            onSubmit();
            onClose();
        } catch (error: unknown) {
            console.error('Error en handleSubmit:', error);
            if (error instanceof Error) {
                const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || error.message || 'Error al procesar el historial médico';
                toast.error(errorMessage);
            } else {
                toast.error('Error al procesar el historial médico');
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

    const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <>
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        key="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    >
                        <motion.div
                            key="modal-content"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-4">
                                    {historialToEdit ? 'Editar Historial Médico' : 'Registrar Nuevo Historial Médico'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Paciente
                                        </label>
                                        {historialToEdit ? (
                                            <div className="p-2 border rounded-lg bg-gray-50">
                                                <p className="font-medium">
                                                    {historialToEdit.persona?.nombre} {historialToEdit.persona?.apellido}
                                                </p>
                                                <p className="text-sm text-gray-500">CID: {historialToEdit.persona?.CID}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                {selectedPatient ? (
                                                    <div className="p-2 border rounded-lg bg-gray-50 flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium">
                                                                {selectedPatient.nombre} {selectedPatient.apellido}
                                                            </p>
                                                            <p className="text-sm text-gray-500">CID: {selectedPatient.CID}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsSelectPatientModalOpen(true)}
                                                            className="text-primary hover:text-primary-dark"
                                                        >
                                                            Cambiar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsSelectPatientModalOpen(true)}
                                                        className="w-full p-2 border rounded-lg text-left text-gray-500 hover:bg-gray-50"
                                                    >
                                                        Seleccionar paciente...
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.fecha}
                                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Sangre
                                            </label>
                                            <select
                                                value={formData.tipo_sangre}
                                                onChange={(e) => setFormData({ ...formData, tipo_sangre: e.target.value })}
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">Seleccionar tipo</option>
                                                {tiposSangre.map((tipo) => (
                                                    <option key={tipo} value={tipo}>
                                                        {tipo}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Presión Arterial
                                            </label>
                                            <div className="relative">
                                                <FaHeartbeat className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.presion_arterial}
                                                    onChange={(e) => setFormData({ ...formData, presion_arterial: e.target.value })}
                                                    placeholder="Ej: 120/80"
                                                    className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Peso (kg)
                                            </label>
                                            <div className="relative">
                                                <FaWeight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={formData.peso}
                                                    onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                                                    placeholder="Peso en kg"
                                                    className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                                    required
                                                    min="0"
                                                    max="500"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Estatura (cm)
                                            </label>
                                            <div className="relative">
                                                <FaRuler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={formData.estatura}
                                                    onChange={(e) => setFormData({ ...formData, estatura: e.target.value })}
                                                    placeholder="Estatura en cm"
                                                    className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                                    required
                                                    min="0"
                                                    max="300"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Temperatura (°C)
                                            </label>
                                            <div className="relative">
                                                <FaThermometerHalf className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={formData.temperatura}
                                                    onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
                                                    placeholder="Temperatura en °C"
                                                    className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                                    step="0.1"
                                                    min="35"
                                                    max="42"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nivel de Glucosa
                                            </label>
                                            <div className="relative">
                                                <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={formData.nivel_glucosa}
                                                    onChange={(e) => setFormData({ ...formData, nivel_glucosa: e.target.value })}
                                                    placeholder="Nivel de glucosa"
                                                    className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <div className="relative">
                                            <FaNotesMedical className="absolute left-3 top-3 text-gray-400" />
                                            <textarea
                                                value={formData.descripcion}
                                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                                placeholder="Observaciones y notas adicionales"
                                                className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                                rows={4}
                                            />
                                        </div>
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
                                            className={`px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {isLoading ? 'Guardando...' : historialToEdit ? 'Actualizar' : 'Registrar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                <SelectPatientModal
                    key="select-patient-modal"
                    isOpen={isSelectPatientModalOpen}
                    onClose={() => setIsSelectPatientModalOpen(false)}
                    onSelect={(paciente) => {
                        setSelectedPatient(paciente);
                        setFormData((prev) => ({ ...prev, persona_id: paciente.cod_paciente }));
                        setIsSelectPatientModalOpen(false);
                    }}
                />
            </AnimatePresence>
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                message={successMessage}
            />
        </>
    );
};

export default HistoryFormModal;