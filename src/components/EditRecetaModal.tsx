import React, { useState, useEffect } from 'react';
import { FaTrash, FaClock, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as RecetaService from '../service/RecetaService';
import { motion } from 'framer-motion';

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
    medicamento: Medicamento[];
}

interface EditRecetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    recetaId: number;
}

const EditRecetaModal: React.FC<EditRecetaModalProps> = ({ isOpen, onClose, recetaId }) => {
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [loading, setLoading] = useState(false);
    const [recetaInfo, setRecetaInfo] = useState<{
        persona_id: number;
        profesional_id: number;
    } | null>(null);

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
                setRecetaInfo({
                    persona_id: receta.persona_id,
                    profesional_id: receta.profesional_id
                });

                if (receta.medicamento) {
                    setMedicamentos(
                        receta.medicamento.map(med => ({
                            ...med,
                            cod_medicamento: med.cod_medicamento,
                            recordatorio: {
                                fechahora: new Date().toISOString().slice(0, 16),
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
                fechahora: new Date().toISOString().slice(0, 16),
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
        const newMedicamentos = medicamentos.filter((_, i) => i !== index);
        setMedicamentos(newMedicamentos);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            if (!recetaInfo) {
                toast.error('No se encontró información de la receta');
                return;
            }

            const isValid = medicamentos.every(med => 
                med.nombre && 
                med.descripcion && 
                med.frecuenciamin > 0 && 
                med.cantidadtotal > 0 && 
                med.recordatorio.fechahora
            );

            if (!isValid) {
                toast.error('Por favor, complete todos los campos de los medicamentos');
                return;
            }

            const recetaData: RecetaService.RecetaData = {
                persona_id: recetaInfo.persona_id,
                profesional_id: recetaInfo.profesional_id
            };

            const medicamentosActualizados = medicamentos.map(med => ({
                ...med,
                cod_medicamento: med.cod_medicamento,
                nombre: med.nombre,
                descripcion: med.descripcion,
                frecuenciamin: med.frecuenciamin,
                cantidadtotal: Number(med.cantidadtotal),
                recordatorioModificado: med.recordatorioModificado,
                recordatorio: {
                    fechahora: med.recordatorio.fechahora,
                    estado: med.recordatorio.estado
                }
            }));

            const recordatorios = medicamentosActualizados.map(med => ({
                fechahora: med.recordatorio.fechahora,
                persona_id: recetaInfo.persona_id,
                estado: true
            }));

            await RecetaService.updateReceta(recetaId, recetaData, medicamentosActualizados, recordatorios);
            toast.success('Receta actualizada exitosamente');
            onClose();
        } catch (error) {
            toast.error('Error al actualizar la receta');
            console.error('Error al actualizar la receta:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 my-8"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                    Editar Medicamentos y Recordatorios
                </h2>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando medicamentos...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {medicamentos.map((medicamento, index) => (
                            <div key={index} className="bg-gray-50 p-6 rounded-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-md font-medium text-gray-700">
                                        Medicamento {index + 1}
                                        {medicamento.cod_medicamento ? ' (Existente)' : ' (Nuevo)'}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre del Medicamento
                                        </label>
                                        <input
                                            type="text"
                                            value={medicamento.nombre}
                                            onChange={(e) => handleMedicamentoChange(index, 'nombre', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <input
                                            type="text"
                                            value={medicamento.descripcion}
                                            onChange={(e) => handleMedicamentoChange(index, 'descripcion', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Frecuencia (HH:mm)
                                        </label>
                                        <input
                                            type="time"
                                            value={minutosToTime(medicamento.frecuenciamin)}
                                            onChange={(e) => handleMedicamentoChange(index, 'frecuenciamin', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cantidad Total
                                        </label>
                                        <input
                                            type="number"
                                            value={medicamento.cantidadtotal}
                                            onChange={(e) => handleMedicamentoChange(index, 'cantidadtotal', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                        <FaClock className="mr-2" />
                                        Recordatorio
                                    </h5>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha y Hora Inicial
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={medicamento.recordatorio.fechahora}
                                            onChange={(e) => handleRecordatorioChange(index, e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <button
                            type="button"
                            onClick={handleAddMedicamento}
                            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                        >
                            <FaPlus className="mr-2" />
                            Agregar Medicamento
                        </button>

                        <div className="flex justify-end pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mr-2"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default EditRecetaModal;