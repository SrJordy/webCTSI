import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cita } from '../assets/Cita';
import { FaTimes, FaClock, FaMapMarkerAlt, FaClipboardList, FaUser, FaUserMd } from 'react-icons/fa';

interface ViewCitaModalProps {
    isOpen: boolean;
    onClose: () => void;
    cita: Cita | null;
}

const ViewCitaModal: React.FC<ViewCitaModalProps> = ({ isOpen, onClose, cita }) => {
    if (!cita) return null;

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="relative bg-[#5FAAD9] px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-white">
                                    Detalles de la Cita
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300"
                                >
                                    <FaTimes className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Info Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Fecha y Hora Card */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 p-3 rounded-lg">
                                            <FaClock className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500">Fecha y Hora</h4>
                                            <p className="text-lg font-medium text-gray-800">
                                                {formatDateTime(cita.fechahora)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Lugar Card */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-green-100 p-3 rounded-lg">
                                            <FaMapMarkerAlt className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500">Lugar</h4>
                                            <p className="text-lg font-medium text-gray-800">{cita.lugar}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Paciente Card */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-purple-100 p-3 rounded-lg">
                                            <FaUser className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500">Paciente</h4>
                                            <p className="text-lg font-medium text-gray-800">
                                                {cita.persona?.nombre} {cita.persona?.apellido}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profesional Card */}
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-yellow-100 p-3 rounded-lg">
                                            <FaUserMd className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500">Profesional</h4>
                                            <p className="text-lg font-medium text-gray-800">
                                                {cita.profesion?.nombre} {cita.profesion?.apellido}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                
                            </div>

                            {/* Motivo Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="bg-red-100 p-3 rounded-lg">
                                        <FaClipboardList className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800">Motivo</h4>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-100">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {cita.motivo}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <div className="flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-[#5FAAD9] text-white rounded-lg transition-all duration-300 transform hover:bg-[#035AA6] scale-105"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewCitaModal;