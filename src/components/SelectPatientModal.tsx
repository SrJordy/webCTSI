import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaUser } from 'react-icons/fa';
import * as PacienteService from '../service/PacienteService';
import { toast } from 'react-hot-toast';

interface Paciente {
    cod_paciente: number;
    nombre: string;
    apellido: string;
    CID: string;
}

interface SelectPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (paciente: Paciente) => void;
}

const SelectPatientModal: React.FC<SelectPatientModalProps> = ({
    isOpen,
    onClose,
    onSelect,
}) => {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchPacientes();
        }
    }, [isOpen]);

    const fetchPacientes = async () => {
        try {
            setIsLoading(true);
            const data = await PacienteService.getAllPacientes();
            setPacientes(data);
        } catch (error) {
            console.error('Error al obtener pacientes:', error);
            toast.error('Error al cargar la lista de pacientes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await PacienteService.getAllPacientes();
            
            if (searchTerm.trim()) {
                const filteredPacientes = data.filter((paciente: Paciente) => 
                    paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    paciente.CID.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setPacientes(filteredPacientes);
            } else {
                setPacientes(data);
            }
        } catch (error) {
            console.error('Error en la búsqueda:', error);
            toast.error('Error al buscar pacientes');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]); 
    
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 300);
    
        return () => clearTimeout(timeoutId);
    }, [handleSearch]); 

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative z-50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-[#5FAAD9] px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Seleccionar Paciente</h2>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-6">
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o CID..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>

                            {/* Table */}
                            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                                            <th className="px-6 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center">
                                                    <div className="flex justify-center items-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5FAAD9]"></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : pacientes.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                                    No se encontraron pacientes
                                                </td>
                                            </tr>
                                        ) : (
                                            pacientes.map((paciente) => (
                                                <tr
                                                    key={paciente.cod_paciente}
                                                    className="hover:bg-[#C4E5F2] transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">{paciente.CID}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{paciente.nombre}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{paciente.apellido}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <button
                                                            onClick={() => onSelect(paciente)}
                                                            className="inline-flex items-center px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors"
                                                        >
                                                            <FaUser className="mr-2" />
                                                            Seleccionar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SelectPatientModal;