import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { TratamientoService } from '../service/TratamientoService';
import SelectHistorialModal from './SelectHistorialModal';
import SuccessModal from './SuccessModal';
import { 
    FaCalendarAlt, 
    FaClipboardList, 
    FaUserInjured, 
    FaCalendarCheck, 
    FaCalendarPlus, 
    FaTimes, 
    FaSave, 
    FaPlus 
} from 'react-icons/fa';

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
    const [errors, setErrors] = useState<Record<string, string>>({});

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
            setErrors({});
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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.historial_id && !tratamientoToEdit) {
            newErrors.historial_id = 'Debe seleccionar un historial médico';
        }
        
        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es requerida';
        }
        
        const fechaInicio = new Date(formData.fechainicio);
        const fechaFin = new Date(formData.fechafin);
        
        if (fechaFin < fechaInicio) {
            newErrors.fechafin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
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
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-8"
                        >
                            {/* Header */}
                            <div className="bg-[#5FAAD9] px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    {tratamientoToEdit ? (
                                        <>
                                            <FaClipboardList className="mr-2" />
                                            Editar Tratamiento
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus className="mr-2" />
                                            Registrar Nuevo Tratamiento
                                        </>
                                    )}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Historial Médico Section */}
                                    <div className="bg-[#F8FAFC] p-5 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <FaUserInjured className="text-[#5FAAD9] mr-2" />
                                            Información del Paciente
                                        </h3>
                                        
                                        <div>
                                            <label className=" text-sm font-medium text-gray-700 mb-2">
                                                Historial Médico
                                            </label>
                                            {tratamientoToEdit ? (
                                                <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                    <div className="flex items-center">
                                                        <FaUserInjured className="text-[#5FAAD9] mr-2" />
                                                        <span className="font-medium">{displayFormData.pacienteNombre}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        El historial médico no se puede cambiar al editar un tratamiento
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {displayFormData.historial_id ? (
                                                        <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                                                            <div className="flex items-center">
                                                                <FaUserInjured className="text-[#5FAAD9] mr-2" />
                                                                <span className="font-medium">{displayFormData.pacienteNombre}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsSelectHistorialModalOpen(true)}
                                                                className="text-[#5FAAD9] hover:text-[#035AA6] font-medium text-sm"
                                                            >
                                                                Cambiar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsSelectHistorialModalOpen(true)}
                                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg text-left text-gray-500 hover:bg-gray-50 hover:border-[#5FAAD9] transition-all flex items-center justify-between shadow-sm"
                                                        >
                                                            <span>Seleccionar historial médico...</span>
                                                            <FaUserInjured className="text-gray-400" />
                                                        </button>
                                                    )}
                                                    {errors.historial_id && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.historial_id}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Descripción Section */}
                                    <div className="bg-[#F8FAFC] p-5 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <FaClipboardList className="text-[#5FAAD9] mr-2" />
                                            Detalles del Tratamiento
                                        </h3>
                                        
                                        <div>
                                            <label className=" text-sm font-medium text-gray-700 mb-2">
                                                Descripción
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    value={displayFormData.descripcion}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, descripcion: e.target.value });
                                                        setDisplayFormData({ ...displayFormData, descripcion: e.target.value });
                                                    }}
                                                    placeholder="Describa el tratamiento, medicamentos, dosis, frecuencia, etc."
                                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent shadow-sm ${
                                                        errors.descripcion ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                                    rows={4}
                                                />
                                            </div>
                                            {errors.descripcion && (
                                                <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Fechas Section */}
                                    <div className="bg-[#F8FAFC] p-5 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <FaCalendarAlt className="text-[#5FAAD9] mr-2" />
                                            Período del Tratamiento
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                    <FaCalendarPlus className="text-[#5FAAD9] mr-2" />
                                                    Fecha de Inicio
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={displayFormData.fechainicio}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, fechainicio: e.target.value });
                                                            setDisplayFormData({ ...displayFormData, fechainicio: e.target.value });
                                                        }}
                                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent shadow-sm bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                    <FaCalendarCheck className="text-[#5FAAD9] mr-2" />
                                                    Fecha de Fin
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={displayFormData.fechafin}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, fechafin: e.target.value });
                                                            setDisplayFormData({ ...displayFormData, fechafin: e.target.value });
                                                        }}
                                                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent shadow-sm bg-white ${
                                                            errors.fechafin ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                                        }`}
                                                    />
                                                </div>
                                                {errors.fechafin && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.fechafin}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end space-x-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center"
                                        >
                                            <FaTimes className="mr-2" />
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`px-6 py-3 text-white bg-[#5FAAD9] rounded-lg hover:bg-[#035AA6] transition-colors font-medium shadow-md flex items-center ${
                                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    {tratamientoToEdit ? 'Actualizando...' : 'Registrando...'}
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave className="mr-2" />
                                                    {tratamientoToEdit ? 'Actualizar' : 'Registrar'}
                                                </>
                                            )}
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