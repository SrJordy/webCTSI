import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, message }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl p-6 w-96 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mx-auto mb-4"
                        >
                            <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        </motion.div>
                        
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            ¡Operación Exitosa!
                        </h3>
                        
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        
                        <button
                            onClick={onClose}
                            className="bg-green-500 text-white px-6 py-2 rounded-lg
                                     hover:bg-green-600 transition-colors duration-200
                                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Aceptar
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessModal;