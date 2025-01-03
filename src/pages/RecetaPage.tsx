import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { FaPlus, FaTrash, FaClock, FaPills, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as RecetaService from '../service/RecetaService';
import SelectPatientModal from '../components/SelectPatientModal';
import axios from 'axios';

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
                    console.log('Profesional ID establecido:', user.cod_usuario);
                } else {
                    console.error('No se encontró cod_profesional en los datos del usuario');
                    toast.error('Error al obtener datos del profesional');
                }
            } catch (error) {
                console.error('Error al parsear datos del usuario:', error);
                toast.error('Error al obtener datos del profesional');
            }
        } else {
            console.error('No se encontraron datos del usuario en localStorage');
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
                frecuenciamin: parseInt(med.frecuenciamin),
                cantidadtotal: parseInt(med.cantidadtotal)
            }));
    
            const recordatorios: Omit<Recordatorio, 'medicamento_id'>[] = [];
            medicamentos.forEach((med) => {
                const { frecuenciamin, cantidadtotal } = med;
                
                // Obtener la hora actual y ajustarla a Colombia (UTC-5)
                const now = new Date();
                const colombiaOffset = -5 * 60; // -5 horas en minutos
                const userOffset = now.getTimezoneOffset();
                const offsetDiff = userOffset + colombiaOffset;
                
                // Ajustar la hora inicial a la zona horaria de Colombia
                const startTime = new Date(now.getTime() + offsetDiff * 60 * 1000);
    
                for (let i = 0; i < cantidadtotal; i++) {
                    const nextReminder = new Date(startTime.getTime() + i * frecuenciamin * 60 * 1000);
                    recordatorios.push({
                        fechahora: nextReminder,
                        persona_id: parseInt(formData.persona_id),
                        estado: true
                    });
                }
            });
    
            console.log('=== DATOS A ENVIAR ===');
            console.log('Receta:', recetaData);
            console.log('Medicamentos:', medicamentos);
            console.log('Recordatorios generados:', recordatorios.map(r => ({
                ...r,
                fechahora: r.fechahora.toLocaleString('es-CO', { 
                    timeZone: 'America/Bogota',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
            })));
            console.log('==================');
    
            const isValid = medicamentos.every(med => 
                med.nombre && 
                med.descripcion && 
                !isNaN(med.frecuenciamin) && 
                !isNaN(med.cantidadtotal) && 
                med.frecuenciamin > 0 && 
                med.cantidadtotal > 0
            );
    
            if (!isValid) {
                toast.error('Por favor complete todos los campos de medicamentos correctamente');
                return;
            }
    
            const result = await RecetaService.createReceta(recetaData, medicamentos, recordatorios);
            console.log('Respuesta del servidor:', result);
            toast.success('Receta registrada exitosamente');
            
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
            console.error('Error detallado al crear la receta:', error);
            if (axios.isAxiosError(error)) {
                console.error('Respuesta del servidor:', error.response?.data);
                console.error('Estado de la respuesta:', error.response?.status);
            }
            toast.error('Error al registrar la receta. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-full bg-gradient-to-br from-red-50 to-pink-50 -m-8 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Nueva Receta Médica</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <FaUser className="mr-2" />
                                        Datos del Paciente
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setIsPatientModalOpen(true)}
                                        className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center"
                                    >
                                        Seleccionar Paciente
                                    </button>
                                </div>

                                {selectedPatient ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm">
                                        <div>
                                            <p className="text-sm text-gray-600">Nombre completo</p>
                                            <p className="font-medium">{`${selectedPatient.nombre} ${selectedPatient.apellido}`}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">CID</p>
                                            <p className="font-medium">{selectedPatient.CID}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Teléfono</p>
                                            <p className="font-medium">{selectedPatient.telefono}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Género</p>
                                            <p className="font-medium">{selectedPatient.genero}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Fecha de nacimiento</p>
                                            <p className="font-medium">{new Date(selectedPatient.fecha_nac).toLocaleDateString()}</p>
                                        </div>
                                        {selectedPatient.direccion && (
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-600">Dirección</p>
                                                <p className="font-medium">{selectedPatient.direccion}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">
                                        Seleccione un paciente para continuar
                                    </p>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <FaPills className="mr-2" />
                                        Medicamentos
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddMedicamento}
                                        className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center"
                                    >
                                        <FaPlus className="mr-2" />
                                        Agregar Medicamento
                                    </button>
                                </div>

                                {formData.medicamentos.map((medicamento, index) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-xl space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-md font-medium text-gray-700">Medicamento {index + 1}</h4>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedicamento(index)}
                                                    className="text-red-500 hover:text-red-600 flex items-center"
                                                >
                                                    <FaTrash className="mr-1" />
                                                    Eliminar
                                                </button>
                                            )}
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
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Frecuencia (minutos)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={medicamento.frecuenciamin}
                                                    onChange={(e) => handleMedicamentoChange(index, 'frecuenciamin', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
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
                                                    Fecha y Hora
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={medicamento.recordatorio.fechahora}
                                                    onChange={(e) => handleRecordatorioChange(index, e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={loading || !selectedPatient}
                                    className={`px-6 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center ${(loading || !selectedPatient) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {loading ? 'Registrando...' : 'Registrar Receta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <SelectPatientModal
                isOpen={isPatientModalOpen}
                onClose={() => setIsPatientModalOpen(false)}
                onSelect={handlePatientSelect}
            />
        </MainLayout>
    );
};

export default RecetaPage;