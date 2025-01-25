import React, { useState, useEffect } from 'react';
import { FaTrash, FaClock, FaPlus, FaUser, FaCalendar, FaIdCard, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as RecetaService from '../service/RecetaService';
import { motion } from 'framer-motion';
import SuccessModal from './SuccessModal';

interface Medicamento {
    cod_medicamento?: number;
    nombre: string;
    descripcion: string;
    frecuenciamin: number;
    cantidadtotal: number;
    recordatorio: {
        fechahora: string;
        estado: boolean;
    };
    recordatorioModificado?: boolean;
}

interface RecetaData {
    cod_receta: number;
    fecha: string;
    persona_id: number;
    profesional_id: number;
    status: boolean;
    persona: {
        cod_paciente: number;
        nombre: string;
        apellido: string;
        CID: string;
        telefono: string;
        fecha_nac: string;
        genero: string;
        direccion: string;
    };
    profesional: {
        cod_usuario: number;
        nombre: string;
        apellido: string;
        CID: string;
        telefono: string;
    };
    medicamentos: Medicamento[]; 
}

interface EditRecetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    recetaId: number;
}

const EditRecetaModal: React.FC<EditRecetaModalProps> = ({ isOpen, onClose, recetaId }) => {
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [loading, setLoading] = useState(false);
    const [recetaInfo, setRecetaInfo] = useState<RecetaData | null>(null);
    const [medicamentosEliminados, setMedicamentosEliminados] = useState<number[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            fetchMedicamentos();
        }
    }, [isOpen]);

    const minutosToTime = (minutos: number): string => {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };

    const timeToMinutos = (time: string): number => {
        const [horas, minutos] = time.split(':').map(Number);
        return horas * 60 + minutos;
    };

    const fetchMedicamentos = async () => {
        try {
            setLoading(true);
            const receta = await RecetaService.getRecetaConMedicamentos(recetaId);
            if (receta) {
                setRecetaInfo(receta);
                if (receta.medicamento) {
                    setMedicamentos(
                        receta.medicamento.map((med: Medicamento) => ({
                            ...med,
                            cod_medicamento: med.cod_medicamento,
                            recordatorio: {
                                fechahora: '',
                                estado: true
                            },
                            recordatorioModificado: false
                        }))
                    );
                }
            }
        } catch (error) {
            toast.error('Error al cargar los medicamentos');
            console.error('Error al cargar los medicamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicamento = () => {
        const nuevoMedicamento: Medicamento = {
            nombre: '',
            descripcion: '',
            frecuenciamin: 0,
            cantidadtotal: 0,
            recordatorio: {
                fechahora: '',
                estado: true
            },
            recordatorioModificado: true
        };
        setMedicamentos([...medicamentos, nuevoMedicamento]);
    };

    const handleMedicamentoChange = (index: number, field: string, value: string) => {
        const newMedicamentos = [...medicamentos];
        newMedicamentos[index] = {
            ...newMedicamentos[index],
            [field]: field === 'frecuenciamin' ? timeToMinutos(value) : value
        };
        setMedicamentos(newMedicamentos);
    };

    const handleRecordatorioChange = (index: number, value: string) => {
        const newMedicamentos = [...medicamentos];
        newMedicamentos[index] = {
            ...newMedicamentos[index],
            recordatorioModificado: true,
            recordatorio: {
                ...newMedicamentos[index].recordatorio,
                fechahora: value
            }
        };
        setMedicamentos(newMedicamentos);
    };

    const handleRemoveMedicamento = (index: number) => {
        const medicamentoAEliminar = medicamentos[index];
        if (medicamentoAEliminar.cod_medicamento) {
            setMedicamentosEliminados([...medicamentosEliminados, medicamentoAEliminar.cod_medicamento]);
        }

        const newMedicamentos = medicamentos.filter((_, i) => i !== index);
        setMedicamentos(newMedicamentos);
    };

    const handleSubmit = async () => {
        try {
            if (medicamentos.length === 0) {
                toast.error('La receta debe tener al menos un medicamento');
                return;
            }

            setLoading(true);
            if (!recetaInfo) {
                toast.error('No se encontró información de la receta');
                return;
            }

            const isValid = medicamentos.every(med =>
                med.nombre &&
                med.descripcion &&
                med.frecuenciamin > 0 &&
                med.cantidadtotal > 0
            );

            if (!isValid) {
                toast.error('Por favor, complete todos los campos de los medicamentos');
                return;
            }


            const recetaData = {
                persona_id: recetaInfo.persona_id,
                profesional_id: recetaInfo.profesional_id
            };

            const medicamentosActualizados = medicamentos.map(med => {
                return {
                    ...med,
                    cod_medicamento: med.cod_medicamento,
                    nombre: med.nombre,
                    descripcion: med.descripcion,
                    frecuenciamin: med.frecuenciamin,
                    cantidadtotal: Number(med.cantidadtotal),
                    recordatorioModificado: med.recordatorioModificado,
                    recordatorio: {
                        fechahora: med.recordatorio.fechahora ? new Date(med.recordatorio.fechahora).toISOString() : '',
                        estado: med.recordatorio.estado
                    }
                };
            });


            const recordatorios = medicamentosActualizados
                .filter(med => med.recordatorio.fechahora)
                .map(med => ({
                    fechahora: new Date(med.recordatorio.fechahora),
                    persona_id: recetaInfo.persona_id,
                    estado: true
                }));


            if (medicamentosEliminados.length > 0) {
                await Promise.all(
                    medicamentosEliminados.map(async (medId) => {
                        try {
                            await RecetaService.deleteMedicamento(medId);
                        } catch (error) {
                            console.error(`Error al eliminar medicamento ${medId}:`, error);
                            throw error;
                        }
                    })
                );
            }

            await RecetaService.updateReceta(
                recetaId,
                recetaData,
                medicamentosActualizados,
                recordatorios
            );

            setMedicamentosEliminados([]);
            setSuccessMessage('Receta actualizada exitosamente');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error completo:', error);
            toast.error('Error al actualizar la receta');
        } finally {
            setLoading(false);
        }
    };
const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose();
};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6 my-8 overflow-y-auto max-h-screen"
            >
                <div className="bg-[#5FAAD9] text-white p-4 rounded-t-xl -mx-6 -mt-6 mb-6">
                    <h2 className="text-2xl font-bold">
                        Receta Médica #{recetaInfo?.cod_receta}
                    </h2>
                    <p className="mt-1 flex items-center">
                        <FaCalendar className="mr-2" />
                        Fecha: {recetaInfo?.fecha && new Date(recetaInfo.fecha).toLocaleDateString()}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5FAAD9] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando información...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="bg-[#C4E5F2] p-6 rounded-xl w-full">
                                <h3 className="text-lg font-semibold text-[#035AA6] mb-4 flex items-center">
                                    <FaUser className="mr-2" />
                                    Información del Paciente
                                </h3>
                                <div className="bg-white rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center">
                                        <FaIdCard className="mr-3 text-[#5FAAD9]" />
                                        <div>
                                            <p className="text-sm text-gray-500">Nombre completo</p>
                                            <p className="font-medium">{recetaInfo?.persona.nombre} {recetaInfo?.persona.apellido}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaIdCard className="mr-3 text-[#5FAAD9]" />
                                        <div>
                                            <p className="text-sm text-gray-500">CID</p>
                                            <p className="font-medium">{recetaInfo?.persona.CID}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaPhone className="mr-3 text-[#5FAAD9]" />
                                        <div>
                                            <p className="text-sm text-gray-500">Teléfono</p>
                                            <p className="font-medium">{recetaInfo?.persona.telefono}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaBirthdayCake className="mr-3 text-[#5FAAD9]" />
                                        <div>
                                            <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                                            <p className="font-medium">{new Date(recetaInfo?.persona.fecha_nac || '').toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaVenusMars className="mr-3 text-[#5FAAD9]" />
                                        <div>
                                            <p className="text-sm text-gray-500">Género</p>
                                            <p className="font-medium">{recetaInfo?.persona.genero}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaMapMarkerAlt className="mr-3 text-[#5FAAD9]" />
                                        <div>
                                            <p className="text-sm text-gray-500">Dirección</p>
                                            <p className="font-medium">{recetaInfo?.persona.direccion}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-[#035AA6]">Medicamentos</h3>
                                <button
                                    type="button"
                                    onClick={handleAddMedicamento}
                                    className="w-fit px-6 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors flex items-center"
                                >
                                    <FaPlus className="mr-2" />
                                    Agregar Medicamento
                                </button>
                            </div>
                            {medicamentos.map((medicamento, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-md font-medium text-gray-700">
                                            Medicamento {index + 1} {medicamento.cod_medicamento ? ' (Existente)' : ' (Nuevo)'}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMedicamento(index)}
                                            className="text-red-500 hover:text-red-600 flex items-center"
                                        >
                                            <FaTrash className="mr-1" />
                                            Eliminar
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nombre del Medicamento
                                            </label>
                                            <input
                                                type="text"
                                                value={medicamento.nombre}
                                                onChange={(e) => handleMedicamentoChange(index, 'nombre', e.target.value)}
                                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Descripción
                                            </label>
                                            <input
                                                type="text"
                                                value={medicamento.descripcion}
                                                onChange={(e) => handleMedicamentoChange(index, 'descripcion', e.target.value)}
                                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Frecuencia
                                            </label>
                                            <input
                                                type="time"
                                                value={minutosToTime(medicamento.frecuenciamin)}
                                                onChange={(e) => handleMedicamentoChange(index, 'frecuenciamin', e.target.value)}
                                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Cantidad Total
                                            </label>
                                            <input
                                                type="number"
                                                value={medicamento.cantidadtotal}
                                                onChange={(e) => handleMedicamentoChange(index, 'cantidadtotal', e.target.value)}
                                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9]"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FaClock className="mr-2" />
                                            Recordatorio
                                        </h5>
                                        <input
                                            type="datetime-local"
                                            value={medicamento.recordatorio.fechahora}
                                            onChange={(e) => handleRecordatorioChange(index, e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors"
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
            <SuccessModal
            isOpen={showSuccessModal}
            onClose={handleSuccessModalClose}
            message={successMessage}
        />
        </div>
    );
};

export default EditRecetaModal;