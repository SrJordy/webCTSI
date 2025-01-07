import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const RecetaDetailModal = ({ isOpen, onClose, receta }) => {
    if (!isOpen || !receta) return null;

    const formatFrecuencia = (minutos) => {
        if (minutos < 60) {
            return `${minutos} minutos`;
        }
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return `${horas} hora${horas > 1 ? 's' : ''} ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Detalles de la Receta</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes size={24} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Información del Paciente</h3>
                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <p className="mb-2">
                                        <span className="font-medium">Nombre: </span>
                                        {receta?.persona?.nombre} {receta?.persona?.apellido}
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-medium">CID: </span>
                                        {receta?.persona?.CID}
                                    </p>
                                    <p>
                                        <span className="font-medium">Teléfono: </span>
                                        {receta?.persona?.telefono}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Profesional</h3>
                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <p>
                                        <span className="font-medium">Doctor: </span>
                                        {receta?.profesional?.nombre} {receta?.profesional?.apellido}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Medicamentos Recetados</h3>
                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                    {receta?.medicamento?.map((med) => (
                                        <div
                                            key={med.cod_medicamento}
                                            className="mb-4 last:mb-0 p-3 bg-white rounded-lg shadow-sm border"
                                        >
                                            <p className="font-medium text-gray-800 mb-1">{med.nombre}</p>
                                            <p className="text-gray-600 text-sm mb-1">{med.descripcion}</p>
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                <p>Frecuencia: {formatFrecuencia(med.frecuenciamin)}</p>
                                                <p>Cantidad: {med.cantidadtotal} unidades</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-sm text-gray-500">
                                Fecha de creación: {new Date(receta.fecha).toLocaleDateString()}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RecetaDetailModal;