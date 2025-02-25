import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { createCita,updateCita } from '../service/citeService';
import { FaTimes, FaClock, FaMapMarkerAlt, FaClipboardList, FaUser, FaUserMd } from 'react-icons/fa';
import SelectPersonaModal from './SelectPatientModal';
import SelectProfesionalModal from './SelectProfesionalModal';
import SuccessModal from './SuccessModal';

interface Cita {
    cod_cita?: number;
    fechahora: Date;
    lugar: string;
    motivo: string;
    persona_id: number;
    profesional_id: number;
    persona?: {
        nombre: string;
        apellido: string;
    };
    profesional?: {
        nombre: string;
        apellido: string;
    };
}

interface CitaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    cita?: Cita | null;
}

const CitaModal: React.FC<CitaModalProps> = ({ isOpen, onClose, onSubmit, cita }) => {
    const [formData, setFormData] = useState({
        fechahora: '',
        lugar: '',
        motivo: '',
        persona_id: 0,
        profesional_id: 0
    });

    const toLocalISOString = (dateString: string) => {
        const date = new Date(dateString);
        date.setHours(date.getHours() - 5); 
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    

    const [displayData, setDisplayData] = useState({
        paciente: '',
        profesional: ''
    });

    const [showSelectPersonaModal, setShowSelectPersonaModal] = useState(false);
    const [showSelectProfesionalModal, setShowSelectProfesionalModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (cita) {
            setFormData({
                fechahora: new Date(cita.fechahora).toISOString().slice(0, 16),
                lugar: cita.lugar,
                motivo: cita.motivo,
                persona_id: cita.persona_id,
                profesional_id: cita.profesional_id
            });
            setDisplayData({
                paciente: cita.persona ? `${cita.persona.nombre} ${cita.persona.apellido}` : '',
                profesional: cita.profesional ? `${cita.profesional.nombre} ${cita.profesional.apellido}` : ''
            });
        }
    }, [cita]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
    
        if (!formData.persona_id || !formData.profesional_id) {
            setError('Por favor seleccione un paciente y un profesional');
            return;
        }
    
        const adjustedDate = new Date(formData.fechahora);
        adjustedDate.setHours(adjustedDate.getHours()); 
    
        const citaData = { ...formData, fechahora: adjustedDate.toISOString() };
    
        try {
            setIsLoading(true);
            if (cita?.cod_cita) {
                await updateCita(cita.cod_cita, citaData);
            } else {
                await createCita(citaData);
            }
            setShowSuccessModal(true);
        } catch (error) {
            toast.error('Error al guardar la cita');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };
    

    interface Persona {
        cod_paciente: number;
        nombre: string;
        apellido: string;
    }

    const handlePersonaSelect = (persona: Persona) => {
        setFormData(prev => ({
            ...prev,
            persona_id: persona.cod_paciente
        }));
        setDisplayData(prev => ({
            ...prev,
            paciente: `${persona.nombre} ${persona.apellido}`
        }));
        setShowSelectPersonaModal(false);
    };

    interface Profesional {
        cod_profesional: string; 
        nombre: string;
        apellido: string;
        CID: string; 
    }
    
    const handleProfesionalSelect = (profesional: Profesional) => {
        setFormData(prev => ({
            ...prev,
            profesional_id: parseInt(profesional.cod_profesional) 
        }));
        setDisplayData(prev => ({
            ...prev,
            profesional: `${profesional.nombre} ${profesional.apellido}`
        }));
        setShowSelectProfesionalModal(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border-t-4 border-[#5FAAD9]"
                    >
                        <div className="bg-[#5FAAD9] px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="bg-white p-2 rounded-full shadow-lg">
                                    <FaClock className="w-5 h-5 text-[#035AA6]" />
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    {cita ? 'Editar Cita' : 'Nueva Cita'}
                                </h2>
                            </div>
                            <button onClick={onClose} className="text-white hover:text-gray-200">
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <div className="bg-white rounded-lg p-4 border border-[#5FAAD9] shadow-sm">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="bg-[#5FAAD9] p-1.5 rounded-full shadow">
                                                <FaClock className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-base font-semibold text-[#035AA6]">Fecha y Hora</h3>
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={formData.fechahora ? toLocalISOString(formData.fechahora):''}
                                            onChange={(e) => setFormData(prev => ({...prev, fechahora: e.target.value}))}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <div className="bg-white rounded-lg p-4 border border-[#5FAAD9] shadow-sm">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="bg-[#5FAAD9] p-1.5 rounded-full shadow">
                                                <FaUser className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-base font-semibold text-[#035AA6]">Paciente</h3>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={displayData.paciente}
                                                className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50"
                                                placeholder="Seleccione un paciente"
                                                readOnly
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSelectPersonaModal(true)}
                                                disabled={cita !== null}
                                                className={`px-3 py-2 rounded-lg text-white transition-colors ${
                                                    cita ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5FAAD9] hover:bg-[#035AA6]'
                                                }`}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <div className="bg-white rounded-lg p-4 border border-[#5FAAD9] shadow-sm">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="bg-[#5FAAD9] p-1.5 rounded-full shadow">
                                                <FaUserMd className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-base font-semibold text-[#035AA6]">Profesional</h3>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={displayData.profesional}
                                                className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50"
                                                placeholder="Seleccione un profesional"
                                                readOnly
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSelectProfesionalModal(true)}
                                                className="bg-[#5FAAD9] text-white px-3 py-2 rounded-lg hover:bg-[#035AA6] transition-colors"
                                            >
                                            +    
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="bg-white rounded-lg p-4 border border-[#5FAAD9] shadow-sm">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="bg-[#5FAAD9] p-1.5 rounded-full shadow">
                                                <FaMapMarkerAlt className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-base font-semibold text-[#035AA6]">Lugar</h3>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.lugar}
                                            onChange={(e) => setFormData(prev => ({...prev, lugar: e.target.value}))}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                            placeholder="Ingrese el lugar de la cita"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="bg-white rounded-lg p-4 border border-[#5FAAD9] shadow-sm">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="bg-[#5FAAD9] p-1.5 rounded-full shadow">
                                                <FaClipboardList className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-base font-semibold text-[#035AA6]">Motivo</h3>
                                        </div>
                                        <textarea
                                            value={formData.motivo}
                                            onChange={(e) => setFormData(prev => ({...prev, motivo: e.target.value}))}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                            placeholder="Ingrese el motivo de la cita"
                                            rows={2}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#5FAAD9] text-white px-4 py-2 rounded-lg hover:bg-[#035AA6] transition-colors flex items-center space-x-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <span>Guardar</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    <SelectPersonaModal
                        isOpen={showSelectPersonaModal}
                        onClose={() => setShowSelectPersonaModal(false)}
                        onSelect={handlePersonaSelect}
                    />

                    <SelectProfesionalModal
                        isOpen={showSelectProfesionalModal}
                        onClose={() => setShowSelectProfesionalModal(false)}
                        onSelect={handleProfesionalSelect}
                    />

                    <SuccessModal
                        isOpen={showSuccessModal}
                        onClose={() => {
                            setShowSuccessModal(false);
                            onSubmit();
                            onClose();
                        }}
                        message={cita ? "Cita actualizada exitosamente" : "Cita creada exitosamente"}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export default CitaModal;