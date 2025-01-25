import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { getAllUsers } from '../service/UserService';

interface Usuario {
    cod_usuario: string;
    nombre: string;
    apellido: string;
    CID: string;
    rol: string;
}

interface SelectProfesionalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (profesional: { cod_profesional: string; nombre: string; apellido: string; CID: string }) => void;
}

const SelectProfesionalModal: React.FC<SelectProfesionalModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [profesionales, setProfesionales] = useState<Usuario[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadProfesionales();
        }
    }, [isOpen]);

    const loadProfesionales = async () => {
        try {
            setIsLoading(true);
            const response = await getAllUsers();
            const profesionalesFiltrados = response.filter((user: Usuario) => user.rol === 'PROFESIONAL');
            setProfesionales(profesionalesFiltrados);
        } catch (error) {
            console.error('Error al cargar profesionales:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProfesionales = profesionales.filter(prof => 
        `${prof.nombre} ${prof.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.CID.includes(searchTerm)
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden"
                    >
                        <div className="bg-[#5FAAD9] px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Seleccionar Profesional</h2>
                            <button onClick={onClose} className="text-white hover:text-gray-200">
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar por nombre o CID..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5FAAD9]"></div>
                                    </div>
                                ) : filteredProfesionales.length > 0 ? (
                                    <div className="space-y-2">
                                        {filteredProfesionales.map((prof) => (
                                            <button
                                                key={prof.cod_usuario}
                                                onClick={() => onSelect({
                                                    cod_profesional: prof.cod_usuario,
                                                    nombre: prof.nombre,
                                                    apellido: prof.apellido,
                                                    CID: prof.CID
                                                })}
                                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 focus:bg-gray-50 transition-colors border border-gray-200"
                                            >
                                                <div className="font-medium text-gray-800">
                                                    {prof.nombre} {prof.apellido}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    CID: {prof.CID}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No se encontraron profesionales
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SelectProfesionalModal;