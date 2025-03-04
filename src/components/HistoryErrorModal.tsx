import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export interface HistoryErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    patientName?: string;
}

const HistoryErrorModal: React.FC<HistoryErrorModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    patientName
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <FaExclamationTriangle className="text-yellow-500 mr-2" />
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <div className="mb-6">
                        {patientName && (
                            <p className="font-medium text-gray-700 mb-2">
                                Paciente: {patientName}
                            </p>
                        )}
                        <p className="text-gray-600">{message}</p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default HistoryErrorModal;