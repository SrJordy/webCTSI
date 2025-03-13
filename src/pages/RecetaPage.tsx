import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { FaPlus, FaTrash, FaClock, FaPills, FaUser, FaArrowLeft, FaCalendarAlt, FaClipboardList, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as RecetaService from '../service/RecetaService';
import SelectPatientModal from '../components/SelectPatientModal';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SuccessModal from '../components/SuccessModal';
import { useNavigate } from 'react-router-dom';

interface Paciente {
    cod_paciente: number;
    nombre: string;
    apellido: string;
    CID: string;
    telefono: string;
    fecha_nac: string;
    genero: string;
    direccion?: string;
}
interface RecetaData {
    persona_id: number;
    profesional_id: number;
}

interface Recordatorio {
    medicamento_id: number;
    fechahora: Date;
    persona_id: number;
    estado: boolean;
}

const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
};

export const RecetaPage = () => {
    const [formData, setFormData] = useState({
        persona_id: '',
        profesional_id: '',
        medicamentos: [{
            nombre: '',
            descripcion: '',
            frecuenciamin: '',
            cantidadtotal: '',
            recordatorio: {
                fechahora: '',
                estado: true
            }
        }]
    });

    const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                if (user && user.cod_usuario) {
                    setFormData(prev => ({
                        ...prev,
                        profesional_id: String(user.cod_usuario)
                    }));
                } else {
                    toast.error('Error al obtener datos del profesional');
                }
            } catch {
                toast.error('Error al obtener datos del profesional');
            }
        } else {
            toast.error('No se encontraron datos del profesional');
        }
    }, []);

    const handlePatientSelect = (paciente: Paciente) => {
        setSelectedPatient(paciente);
        setFormData(prev => ({
            ...prev,
            persona_id: paciente.cod_paciente.toString()
        }));
        setIsPatientModalOpen(false);
    };

    const handleAddMedicamento = () => {
        setFormData({
            ...formData,
            medicamentos: [...formData.medicamentos, {
                nombre: '',
                descripcion: '',
                frecuenciamin: '',
                cantidadtotal: '',
                recordatorio: {
                    fechahora: '',
                    estado: true
                }
            }]
        });
    };

    const handleRemoveMedicamento = (index: number) => {
        const newMedicamentos = formData.medicamentos.filter((_, i) => i !== index);
        setFormData({ ...formData, medicamentos: newMedicamentos });
    };

    const handleMedicamentoChange = (index: number, field: string, value: string) => {
        const newMedicamentos = [...formData.medicamentos];
        newMedicamentos[index] = {
            ...newMedicamentos[index],
            [field]: value
        };
        setFormData({ ...formData, medicamentos: newMedicamentos });
    };

    const handleFrecuenciaChange = (index: number, value: string) => {
        // Limitar la entrada a solo horas y minutos (formato 24 horas)
        const newMedicamentos = [...formData.medicamentos];
        newMedicamentos[index] = {
            ...newMedicamentos[index],
            frecuenciamin: value
        };
        setFormData({ ...formData, medicamentos: newMedicamentos });
    };

    const handleRecordatorioChange = (index: number, value: string) => {
        const newMedicamentos = [...formData.medicamentos];
        newMedicamentos[index] = {
            ...newMedicamentos[index],
            recordatorio: {
                ...newMedicamentos[index].recordatorio,
                fechahora: value
            }
        };
        setFormData({ ...formData, medicamentos: newMedicamentos });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.profesional_id || !formData.persona_id) {
            toast.error('Faltan datos necesarios para crear la receta');
            return;
        }

        setLoading(true);

        try {
            const recetaData: RecetaData = {
                persona_id: parseInt(formData.persona_id),
                profesional_id: parseInt(formData.profesional_id)
            };

            const medicamentos = formData.medicamentos.map(med => ({
                nombre: med.nombre,
                descripcion: med.descripcion,
                frecuenciamin: timeToMinutes(med.frecuenciamin), // Convierte HH:mm a minutos
                cantidadtotal: parseInt(med.cantidadtotal)
            }));

            const recordatorios: Omit<Recordatorio, 'medicamento_id'>[] = [];
            medicamentos.forEach((med, index) => {
                const { frecuenciamin, cantidadtotal } = med;

                const fechaInicial = new Date(formData.medicamentos[index].recordatorio.fechahora);

                for (let i = 0; i < cantidadtotal; i++) {
                    const nextReminder = new Date(fechaInicial.getTime() + i * frecuenciamin * 60 * 1000);
                    recordatorios.push({
                        fechahora: nextReminder,
                        persona_id: parseInt(formData.persona_id),
                        estado: true
                    });
                }
            });

            const isValid = medicamentos.every(med =>
                med.nombre &&
                med.descripcion &&
                med.frecuenciamin > 0 &&
                med.cantidadtotal > 0
            );

            if (!isValid) {
                toast.error('Por favor complete todos los campos de medicamentos correctamente');
                return;
            }

            await RecetaService.createReceta(recetaData, medicamentos, recordatorios);
            toast.success('Receta registrada exitosamente');

            setSuccessMessage('Receta registrada exitosamente');
            setShowSuccessModal(true);
            setFormData({
                persona_id: '',
                profesional_id: formData.profesional_id,
                medicamentos: [{
                    nombre: '',
                    descripcion: '',
                    frecuenciamin: '',
                    cantidadtotal: '',
                    recordatorio: {
                        fechahora: '',
                        estado: true
                    }
                }]
            });
            setSelectedPatient(null);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Respuesta del servidor:', error.response?.data);
                console.error('Estado de la respuesta:', error.response?.status);
            }
            toast.error('Error al registrar la receta. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessModalClose = () => {
        navigate('/managerecipes');
        setShowSuccessModal(false);
    };

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="min-h-full bg-gradient-to-b from-[#C4E5F2] to-[#E6F4F9] -m-8 p-8">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-6xl mx-auto">
                    
                    {/* Encabezado */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                        <div className="bg-[#5FAAD9] px-6 py-4">
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/managerecipes')}
                                    className="mr-4 text-white hover:text-gray-200 transition-colors"
                                >
                                    <FaArrowLeft size={20} />
                                </button>
                                <h2 className="text-2xl font-bold text-white">Nueva Receta Médica</h2>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex items-center text-gray-600 mb-2">
                                <FaClipboardList className="mr-2" />
                                <span>Complete el formulario para crear una nueva receta médica</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Sección de datos del paciente */}
                        <motion.div 
                            className="bg-white rounded-xl shadow-lg overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="bg-[#5FAAD9] bg-opacity-10 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FaUser className="mr-2 text-[#5FAAD9]" />
                                    Datos del Paciente
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => setIsPatientModalOpen(true)}
                                    className="px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors flex items-center shadow-sm"
                                >
                                    <FaUser className="mr-2" />
                                    Seleccionar Paciente
                                </motion.button>
                            </div>
                            
                            <div className="p-6">
                                {selectedPatient ? (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                        <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                                            <h4 className="font-medium text-blue-800">Información del Paciente</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">Nombre completo</p>
                                                <p className="font-medium text-gray-800">{`${selectedPatient.nombre} ${selectedPatient.apellido}`}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">CID</p>
                                                <p className="font-medium text-gray-800">{selectedPatient.CID}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">Teléfono</p>
                                                <p className="font-medium text-gray-800">{selectedPatient.telefono}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">Género</p>
                                                <p className="font-medium text-gray-800">{selectedPatient.genero}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                                                <p className="font-medium text-gray-800 flex items-center">
                                                    <FaCalendarAlt className="mr-2 text-gray-400" size={14} />
                                                    {new Date(selectedPatient.fecha_nac).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {selectedPatient.direccion && (
                                                <div className="col-span-1 md:col-span-2 space-y-1">
                                                    <p className="text-sm text-gray-500">Dirección</p>
                                                    <p className="font-medium text-gray-800">{selectedPatient.direccion}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <FaUser className="mx-auto text-gray-300 text-4xl mb-3" />
                                        <p className="text-gray-500 mb-2">No se ha seleccionado ningún paciente</p>
                                        <p className="text-sm text-gray-400 mb-4">Seleccione un paciente para continuar con la receta</p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            type="button"
                                            onClick={() => setIsPatientModalOpen(true)}
                                            className="px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors inline-flex items-center"
                                        >
                                            <FaUser className="mr-2" />
                                            Seleccionar Paciente
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                        
                        {/* Sección de medicamentos */}
                        <motion.div 
                            className="bg-white rounded-xl shadow-lg overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="bg-[#5FAAD9] bg-opacity-10 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <FaPills className="mr-2 text-[#5FAAD9]" />
                                    Medicamentos
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={handleAddMedicamento}
                                    className="px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors flex items-center shadow-sm"
                                >
                                    <FaPlus className="mr-2" />
                                    Agregar Medicamento
                                </motion.button>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {formData.medicamentos.map((medicamento, index) => (
                                            <motion.div 
                                                key={index}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                                            >
                                                <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <div className="bg-[#5FAAD9] text-white rounded-full w-7 h-7 flex items-center justify-center mr-3">
                                                            <span className="font-medium text-sm">{index + 1}</span>
                                                        </div>
                                                        <h4 className="font-medium text-blue-800">Medicamento {index + 1}</h4>
                                                    </div>
                                                    {index > 0 && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            type="button"
                                                            onClick={() => handleRemoveMedicamento(index)}
                                                            className="text-red-500 hover:text-red-600 bg-red-50 px-3 py-1 rounded-lg flex items-center transition-colors"
                                                        >
                                                            <FaTrash className="mr-1" size={12} />
                                                            <span className="text-sm">Eliminar</span>
                                                        </motion.button>
                                                    )}
                                                </div>
                                                
                                                <div className="p-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                                        <div className="space-y-2">
                                                            <label className=" text-sm font-medium text-gray-700 flex items-center">
                                                                <FaPills className="mr-2 text-[#5FAAD9]" size={14} />
                                                                Nombre del Medicamento
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={medicamento.nombre}
                                                                onChange={(e) => handleMedicamentoChange(index, 'nombre', e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-colors"
                                                                placeholder="Ej: Paracetamol"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className=" text-sm font-medium text-gray-700 flex items-center">
                                                                <FaInfoCircle className="mr-2 text-[#5FAAD9]" size={14} />
                                                                Descripción
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={medicamento.descripcion}
                                                                onChange={(e) => handleMedicamentoChange(index, 'descripcion', e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-colors"
                                                                placeholder="Ej: 500mg, 1 tableta"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                                <FaClock className="mr-2 text-[#5FAAD9]" size={14} />
                                                                Frecuencia
                                                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">hh:mm</span>
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    placeholder="00:00"
                                                                    pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                                                                    value={medicamento.frecuenciamin}
                                                                    onChange={(e) => handleFrecuenciaChange(index, e.target.value)}
                                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-colors"
                                                                    required
                                                                    title="Formato de hora: HH:MM (24 horas)"
                                                                />
                                                                <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                            </div>
                                                            <small className="text-xs text-gray-500  mt-1">Formato 24 horas (ej: 08:30 o 14:45)</small>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                                <FaPills className="mr-2 text-[#5FAAD9]" size={14} />
                                                                Cantidad Total
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={medicamento.cantidadtotal}
                                                                    onChange={(e) => handleMedicamentoChange(index, 'cantidadtotal', e.target.value)}
                                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-colors"
                                                                    placeholder="Ej: 30"
                                                                    required
                                                                />
                                                                <FaPills className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                            </div>
                                                            <small className="text-xs text-gray-500  mt-1">Número de dosis totales</small>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                        <h5 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                                                            <FaClock className="mr-2 text-blue-600" />
                                                            Configuración de Recordatorio
                                                        </h5>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                                                <FaCalendarAlt className="mr-2 text-[#5FAAD9]" size={14} />
                                                                Fecha y Hora Inicial
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="datetime-local"
                                                                    value={medicamento.recordatorio.fechahora}
                                                                    onChange={(e) => handleRecordatorioChange(index, e.target.value)}
                                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent bg-white transition-colors"
                                                                    required
                                                                />
                                                                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                            </div>
                                                            <small className="text-xs text-gray-600  mt-1">
                                                                A partir de esta fecha y hora se programarán los recordatorios según la frecuencia
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Botón de envío */}
                        <motion.div 
                            className="flex justify-end pt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={loading || !selectedPatient}
                                className={`px-6 py-3 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors flex items-center shadow-md ${(loading || !selectedPatient) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                        Registrando...
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="mr-2" />
                                        Registrar Receta
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
            
            <SelectPatientModal
                isOpen={isPatientModalOpen}
                onClose={() => setIsPatientModalOpen(false)}
                onSelect={handlePatientSelect}
            />
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                message={successMessage}
            />
        </MainLayout>
    );
};

export default RecetaPage;