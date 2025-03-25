import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { createCita, updateCita } from '../service/citeService';
import { FaTimes, FaClock, FaMapMarkerAlt, FaClipboardList, FaUser, FaUserMd } from 'react-icons/fa';
import SelectPersonaModal from './SelectPatientModal';
import SelectProfesionalModal from './SelectProfesionalModal';
import SuccessModal from './SuccessModal';

export interface Cita {
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
    const initialFormState = {
        fechahora: '',
        lugar: '',
        motivo: '',
        persona_id: 0,
        profesional_id: 0
    };

    const [formData, setFormData] = useState(initialFormState);

    const lugaresQuevedo = [
        "Hospital IESS Quevedo",
        "Hospital Sagrado Corazón de Jesús",
        "Clínica San Antonio",
        "Clínica Metropolitana",
        "Centro Médico Quevedo",
        "Hospital General Quevedo",
        "Clínica Santa Marianita",
        "Centro de Salud Quevedo Norte",
        "Centro de Salud Quevedo Sur",
        "Clínica San José",
        "Hospital Básico Quevedo",
        "Centro Médico Familiar",
        "Policlínico Municipal de Quevedo",
        "Clínica Vida Sana",
        "Centro de Especialidades Médicas"
    ];

    const [showLugaresSugeridos, setShowLugaresSugeridos] = useState(false);
    const [lugaresFiltrados, setLugaresFiltrados] = useState<string[]>([]);
    const [correccionSugerida, setCorreccionSugerida] = useState<string | null>(null);
    const lugarInputRef = useRef<HTMLInputElement>(null);
    const [mostrarCorreccion, setMostrarCorreccion] = useState(false);

    
    const initialDisplayState = {
        paciente: '',
        profesional: ''
    };

    const [displayData, setDisplayData] = useState(initialDisplayState);

    const [showSelectPersonaModal, setShowSelectPersonaModal] = useState(false);
    const [showSelectProfesionalModal, setShowSelectProfesionalModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (cita) {
            setFormData({
                fechahora: cita.fechahora ? new Date(cita.fechahora).toISOString().slice(0, 16) : '',
                lugar: cita.lugar,
                motivo: cita.motivo,
                persona_id: cita.persona_id,
                profesional_id: cita.profesional_id
            });
            setDisplayData({
                paciente: cita.persona ? `${cita.persona.nombre} ${cita.persona.apellido}` : '',
                profesional: cita.profesional ? `${cita.profesional.nombre} ${cita.profesional.apellido}` : ''
            });
        } else {
            setFormData(initialFormState);
            setDisplayData(initialDisplayState);
        }
    }, [cita, isOpen]);

    const handleClose = () => {
        setFormData(initialFormState);
        setDisplayData(initialDisplayState);
        setError('');
        setCorreccionSugerida(null);
        setMostrarCorreccion(false);
        setShowLugaresSugeridos(false);
        onClose();
    };

    const calcularSimilitud = (s1: string, s2: string): number => {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        
        const costos: number[] = new Array(s2.length + 1);
        for (let i = 0; i <= s1.length; i++) {
            let ultimoValor = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costos[j] = j;
                } else if (j > 0) {
                    let nuevoValor = costos[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        nuevoValor = Math.min(
                            nuevoValor,
                            ultimoValor,
                            costos[j]
                        ) + 1;
                    }
                    costos[j - 1] = ultimoValor;
                    ultimoValor = nuevoValor;
                }
            }
            if (i > 0) {
                costos[s2.length] = ultimoValor;
            }
        }
        return costos[s2.length];
    };

    const encontrarMejorCoincidencia = (texto: string): string | null => {
        if (!texto || texto.trim().length < 3) return null;
        
        let mejorCoincidencia = null;
        let menorDistancia = Infinity;
        
        for (const lugar of lugaresQuevedo) {
            if (lugar.toLowerCase().includes(texto.toLowerCase())) {
                return lugar;
            }
            
            const distancia = calcularSimilitud(texto, lugar);
            const umbralSimilitud = Math.floor(lugar.length * 0.3);
            
            if (distancia < menorDistancia && distancia <= umbralSimilitud) {
                menorDistancia = distancia;
                mejorCoincidencia = lugar;
            }
        }
        
        return mejorCoincidencia;
    };

    useEffect(() => {
        if (formData.lugar.trim() === '') {
            setLugaresFiltrados([]);
            setCorreccionSugerida(null);
            setMostrarCorreccion(false);
            return;
        }

        const filtrados = lugaresQuevedo.filter(lugar => 
            lugar.toLowerCase().includes(formData.lugar.toLowerCase())
        );
        setLugaresFiltrados(filtrados);
        
        if (filtrados.length === 0) {
            const mejorCoincidencia = encontrarMejorCoincidencia(formData.lugar);
            setCorreccionSugerida(mejorCoincidencia);
            setMostrarCorreccion(!!mejorCoincidencia);
        } else {
            setCorreccionSugerida(null);
            setMostrarCorreccion(false);
        }
    }, [formData.lugar]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (lugarInputRef.current && !lugarInputRef.current.contains(event.target as Node)) {
                setShowLugaresSugeridos(false);
                
                if (correccionSugerida && formData.lugar.trim() !== '') {
                    setMostrarCorreccion(true);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [correccionSugerida, formData.lugar]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
    
        if (!formData.persona_id || !formData.profesional_id) {
            setError('Por favor seleccione un paciente y un profesional');
            return;
        }
    
        try {
            setIsLoading(true);
            const fechaSeleccionada = new Date(formData.fechahora);
            const citaData = { 
                ...formData, 
                fechahora: fechaSeleccionada.toISOString() 
            };
            if (cita?.cod_cita) {
                await updateCita(cita.cod_cita, citaData);
            } else {
                console.log(citaData);
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

    const handleLugarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, lugar: e.target.value}));
        setShowLugaresSugeridos(true);
        setMostrarCorreccion(false);
    };

    const handleLugarSelect = (lugar: string) => {
        setFormData(prev => ({...prev, lugar}));
        setShowLugaresSugeridos(false);
        setMostrarCorreccion(false);
    };

    const aplicarCorreccion = () => {
        if (correccionSugerida) {
            setFormData(prev => ({...prev, lugar: correccionSugerida}));
            setMostrarCorreccion(false);
        }
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
                            <button onClick={handleClose} className="text-white hover:text-gray-200">
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
                                            value={formData.fechahora}
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
                                            <h3 className="text-base font-semibold text-[#035AA6]">Ubicación</h3>
                                        </div>
                                        <div className="relative" ref={lugarInputRef}>
                                            <input
                                                type="text"
                                                value={formData.lugar}
                                                onChange={handleLugarChange}
                                                onFocus={() => setShowLugaresSugeridos(true)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                                placeholder="Ingrese la ubicación de la cita"
                                                required
                                            />
                                            {showLugaresSugeridos && lugaresFiltrados.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {lugaresFiltrados.map((lugar, index) => (
                                                        <div 
                                                            key={index}
                                                            className="p-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => handleLugarSelect(lugar)}
                                                        >
                                                            {lugar}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Mensaje de corrección sugerida */}
                                            {mostrarCorreccion && correccionSugerida && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        ¿Quisiste decir?
                                                    </p>
                                                    <div 
                                                        className="p-2 bg-blue-50 text-blue-700 rounded-md cursor-pointer hover:bg-blue-100 flex justify-between items-center"
                                                        onClick={aplicarCorreccion}
                                                    >
                                                        <span className="font-medium">{correccionSugerida}</span>
                                                        <span className="text-xs bg-blue-200 px-2 py-1 rounded-full">
                                                            Aplicar
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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
                                    onClick={handleClose}
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
                            handleClose();
                        }}
                        message={cita ? "Cita actualizada exitosamente" : "Cita creada exitosamente"}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};

export default CitaModal;