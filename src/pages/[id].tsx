import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import { HistoryService } from '../service/HistoryService';
import { toast } from 'react-hot-toast';
import {  FaArrowLeft, FaUser, FaHeartbeat, FaStethoscope, FaPills, FaFlask, FaIdCard, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars} from 'react-icons/fa';


export interface HistorialMedico {
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
        especialidad?: string;
    };
    persona?: {
        cod_paciente: number;
        nombre: string;
        apellido: string;
        fecha_nacimiento: Date;
        genero: string;
        direccion: string;
        telefono: string;
        email: string;
    };
    tratamientos?: Array<{
        cod_tratamiento: number;
        descripcion: string;
        fecha_inicio: Date;
        fecha_fin?: Date;
        estado: boolean;
    }>;
    diagnosticos?: Array<{
        cod_diagnostico: number;
        descripcion: string;
        fecha: Date;
        estado: boolean;
    }>;
    examenes?: Array<{
        cod_examen: number;
        tipo: string;
        descripcion: string;
        fecha: Date;
        resultados?: string;
        estado: boolean;
    }>;
}

const HistorialView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [historial, setHistorial] = useState<HistorialMedico | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            if (id) {
                try {
                    const data = await HistoryService.getHistory(Number(id));
                    setHistorial(data);
                } catch (error) {
                    console.error('Error al obtener el historial:', error);
                    toast.error('Error al cargar el historial médico');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchHistorial();
    }, [id]);

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
                </div>
            </MainLayout>
        );
    }

    if (!historial) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Historial no encontrado</h1>
                    <button onClick={() => navigate('/History')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <FaArrowLeft />
                        <span>Volver a Historiales</span>
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="h-full flex flex-col bg-[#C4E5F2] p-6 overflow-hidden"
            >
                <div className="flex justify-between items-center mb-6">
                    <button 
                        onClick={() => navigate('/History')} 
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        <FaArrowLeft className="text-lg" />
                        <span>Volver</span>
                    </button>
                </div>
                <div 
                    className="flex-1 overflow-y-auto custom-scrollbar"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#94A3B8 #F1F5F9'
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto mb-6">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
                            <h1 className="text-3xl font-bold">Historial Médico</h1>
                            <p className="mt-2 opacity-90">Fecha: {formatDate(historial.fecha)}</p>
                            <p className="opacity-90">Código: #{historial.cod_historial}</p>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FaUser className="mr-2 text-indigo-600" />
                                    Información del Paciente
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <FaIdCard className="text-indigo-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Identificación</p>
                                                    <p className="font-semibold text-gray-800">{historial.persona.CID}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <FaUser className="text-indigo-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Nombre completo</p>
                                                    <p className="font-semibold text-gray-800">{historial.persona.nombre} {historial.persona.apellido}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <FaBirthdayCake className="text-indigo-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Fecha de nacimiento</p>
                                                    <p className="font-semibold text-gray-800">{formatDate(historial.persona.fecha_nac)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <FaVenusMars className="text-indigo-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Género</p>
                                                    <p className="font-semibold text-gray-800">{historial.persona.genero}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <FaPhone className="text-indigo-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Teléfono</p>
                                                    <p className="font-semibold text-gray-800">{historial.persona.telefono}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <FaMapMarkerAlt className="text-indigo-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Dirección</p>
                                                    <p className="font-semibold text-gray-800">{historial.persona.direccion || 'No especificada'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FaHeartbeat className="mr-2 text-red-600" />
                                    Signos Vitales
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-sm text-gray-600">Presión Arterial</p>
                                        <p className="font-semibold text-gray-800">{historial.presion_arterial}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-sm text-gray-600">Tipo de Sangre</p>
                                        <p className="font-semibold text-gray-800">{historial.tipo_sangre}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-sm text-gray-600">Peso</p>
                                        <p className="font-semibold text-gray-800">{historial.peso} kg</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-sm text-gray-600">Estatura</p>
                                        <p className="font-semibold text-gray-800">{historial.estatura} cm</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-sm text-gray-600">Temperatura</p>
                                        <p className="font-semibold text-gray-800">{historial.temperatura}°C</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <p className="text-sm text-gray-600">Nivel de Glucosa</p>
                                        <p className="font-semibold text-gray-800">{historial.nivel_glucosa} mg/dL</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FaStethoscope className="mr-2 text-purple-600" />
                                    Diagnósticos
                                </h2>
                                {historial.diagnostico && historial.diagnostico.length > 0 ? (
                                    <div className="space-y-4">
                                        {historial.diagnostico.map((diagnostico) => (
                                            <div key={diagnostico.cod_diagnostico} className="bg-white p-4 rounded-lg shadow-sm">
                                                <p className="font-semibold text-gray-800">{diagnostico.descripcion}</p>
                                                <p className="text-sm text-gray-500 mt-2">{formatDate(diagnostico.fecha_diagnostico)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic bg-white p-4 rounded-lg shadow-sm">No hay diagnósticos registrados</p>
                                )}
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FaPills className="mr-2 text-green-600" />
                                    Tratamientos
                                </h2>
                                {historial.tratamiento && historial.tratamiento.length > 0 ? (
                                    <div className="space-y-4">
                                        {historial.tratamiento.map((tratamiento) => (
                                            <div key={tratamiento.cod_tratamiento} className="bg-white p-4 rounded-lg shadow-sm">
                                                <p className="font-semibold text-gray-800">{tratamiento.descripcion}</p>
                                                <p className="text-sm text-gray-500 mt-2">{formatDate(tratamiento.fechainicio)} - {formatDate(tratamiento.fechafin)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic bg-white p-4 rounded-lg shadow-sm">No hay tratamientos registrados</p>
                                )}
                            </div>
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <FaFlask className="mr-2 text-yellow-600" />
                                    Exámenes
                                </h2>
                                {historial.examenes && historial.examenes.length > 0 ? (
                                    <div className="space-y-4">
                                        {historial.examenes.map((examen) => (
                                            <div key={examen.cod_examen} className="bg-white p-4 rounded-lg shadow-sm">
                                                <p className="font-semibold text-gray-800">{examen.tipo}</p>
                                                <p className="text-sm text-gray-600 mt-2">Resultados: {examen.resultados}</p>
                                                <p className="text-sm text-gray-500 mt-1">{formatDate(examen.fecha)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic bg-white p-4 rounded-lg shadow-sm">No hay exámenes registrados</p>
                                )}
                            </div>
                            {historial.descripcion && (
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <FaStethoscope className="mr-2 text-gray-600" />
                                        Descripción
                                    </h2>
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <p className="text-gray-700 whitespace-pre-line">{historial.descripcion}</p>
                                    </div>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-6 mt-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Código de Historial</p>
                                        <p className="font-semibold text-gray-800">#{historial.cod_historial}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Atendido por</p>
                                        <p className="font-semibold text-gray-800">Dr. {historial.profesional?.nombre} {historial.profesional?.apellido}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </MainLayout>
    );
};

export default HistorialView;