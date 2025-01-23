import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaCalendarAlt, FaFileAlt, FaUserMd } from "react-icons/fa";

interface ViewExamenModalProps {
    isOpen: boolean;
    onClose: () => void;
    examen: {
        cod_examen?: number;
        tipo: string;
        resultados: string;
        fecha: string;
        historial_id: number;
        historial?: {
            persona?: {
                nombre: string;
                apellido: string;
            };
            profesional?: {
                nombre: string;
                apellido: string;
            };
        };
    } | null;
}

const ViewExamenModal = ({ isOpen, onClose, examen }: ViewExamenModalProps) => {
    if (!isOpen || !examen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Detalles del Examen</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Tipo de Examen */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                <FaFileAlt size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Tipo de Examen</h3>
                                <p className="text-gray-600">{examen.tipo}</p>
                            </div>
                        </div>

                        {/* Resultados */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                <FaFileAlt size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Resultados</h3>
                                <p className="text-gray-600">{examen.resultados}</p>
                            </div>
                        </div>

                        {/* Fecha */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                                <FaCalendarAlt size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Fecha</h3>
                                <p className="text-gray-600">
                                    {new Date(examen.fecha).toLocaleDateString("es-ES", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Paciente */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                                <FaUser size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Paciente</h3>
                                <p className="text-gray-600">
                                    {examen.historial?.persona
                                        ? `${examen.historial.persona.nombre} ${examen.historial.persona.apellido}`
                                        : "No disponible"}
                                </p>
                            </div>
                        </div>

                        {/* Profesional */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-full">
                                <FaUserMd size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Profesional</h3>
                                <p className="text-gray-600">
                                    {examen.historial?.profesional
                                        ? `${examen.historial.profesional.nombre} ${examen.historial.profesional.apellido}`
                                        : "No disponible"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ViewExamenModal;