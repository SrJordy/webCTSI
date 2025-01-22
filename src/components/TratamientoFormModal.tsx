import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { TratamientoService } from '../service/TratamientoService';
import SelectHistorialModal from './SelectHistorialModal';
import SuccessModal from './SuccessModal';

interface Tratamiento {
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

interface TratamientoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    tratamientoToEdit?: Tratamiento | null | undefined;
}

const TratamientoFormModal: React.FC<TratamientoFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    tratamientoToEdit
}) => {

    const [formData, setFormData] = useState({
        descripcion: '',
        fechainicio: new Date().toISOString().split('T')[0],
        fechafin: new Date().toISOString().split('T')[0],
        historial_id: 0,
    });

    const [displayFormData, setDisplayFormData] = useState({
        descripcion: '',
        fechainicio: new Date().toISOString().split('T')[0],
        fechafin: new Date().toISOString().split('T')[0],
        historial_id: 0,
        pacienteNombre: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSelectHistorialModalOpen, setIsSelectHistorialModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (isOpen) {

            if (tratamientoToEdit) {
                setFormData({
                    descripcion: tratamientoToEdit.descripcion || '',
                    fechainicio: new Date(tratamientoToEdit.fechainicio).toISOString().split('T')[0],
                    fechafin: new Date(tratamientoToEdit.fechafin).toISOString().split('T')[0],
                    historial_id: tratamientoToEdit.historial_id,
                });
                setDisplayFormData({
                    descripcion: tratamientoToEdit.descripcion || '',
                    fechainicio: new Date(tratamientoToEdit.fechainicio).toISOString().split('T')[0],
                    fechafin: new Date(tratamientoToEdit.fechafin).toISOString().split('T')[0],
                    historial_id: tratamientoToEdit.historial_id,
                    pacienteNombre: `${tratamientoToEdit.historial?.persona?.nombre} ${tratamientoToEdit.historial?.persona?.apellido}`
                });
            } else {
                resetForm();
            }
        }
    }, [isOpen, tratamientoToEdit]);

    const resetForm = () => {
        setFormData({
            descripcion: '',
            fechainicio: new Date().toISOString().split('T')[0],
            fechafin: new Date().toISOString().split('T')[0],
            historial_id: 0,
        });
        setDisplayFormData({
            descripcion: '',
            fechainicio: new Date().toISOString().split('T')[0],
            fechafin: new Date().toISOString().split('T')[0],
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
                fechainicio: new Date(formData.fechainicio),
                fechafin: new Date(formData.fechafin)
            };

            console.log('Datos a enviar:', dataToSubmit);

            if (tratamientoToEdit) {
                await TratamientoService.updateTratamiento(tratamientoToEdit.cod_tratamiento!, dataToSubmit);
                setSuccessMessage('Tratamiento actualizado exitosamente');
                toast.success('Tratamiento actualizado exitosamente');
            } else {
                if (!formData.historial_id) {
                    toast.error('Debe seleccionar un historial médico');
                    return;
                }
                await TratamientoService.createTratamiento(dataToSubmit);
                setSuccessMessage('Tratamiento creado exitosamente');
                toast.success('Tratamiento creado exitosamente');
            }
            setShowSuccessModal(true);

            onSubmit();
            onClose();
        } catch (error: unknown) {
            console.error('Error en handleSubmit:', error);
            if (error instanceof Error) {
                const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || error.message || 'Error al procesar el tratamiento';
                toast.error(errorMessage);
            } else {
                toast.error('Error al procesar el tratamiento');
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
                                    {tratamientoToEdit ? 'Editar Tratamiento' : 'Registrar Nuevo Tratamiento'}
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
                                                className={`w-full p-2 border rounded-lg text-left text-gray-500 hover:bg-gray-50 ${tratamientoToEdit ? 'cursor-not-allowed opacity-50' : ''}`}
                                                disabled={!!tratamientoToEdit}
                                            >
                                                {displayFormData.historial_id ? `Historial de: ${displayFormData.pacienteNombre}` : 'Seleccionar historial...'}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={displayFormData.descripcion}
                                            onChange={(e) => {
                                                setFormData({ ...formData, descripcion: e.target.value });
                                                setDisplayFormData({ ...displayFormData, descripcion: e.target.value });
                                            }}
                                            placeholder="Descripción del tratamiento"
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fecha de Inicio
                                            </label>
                                            <input
                                                type="date"
                                                value={displayFormData.fechainicio}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, fechainicio: e.target.value });
                                                    setDisplayFormData({ ...displayFormData, fechainicio: e.target.value });
                                                }}
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Fecha de Fin
                                            </label>
                                            <input
                                                type="date"
                                                value={displayFormData.fechafin}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, fechafin: e.target.value });
                                                    setDisplayFormData({ ...displayFormData, fechafin: e.target.value });
                                                }}
                                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
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
                                            {isLoading ? 'Guardando...' : tratamientoToEdit ? 'Actualizar' : 'Registrar'}
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

export default TratamientoFormModal;