// components/SelectPatientModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
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

    const handleSearch = async () => {
        if (searchTerm.trim()) {
            try {
                setIsLoading(true);
                const criteria = {
                    search: searchTerm
                };
                const data = await PacienteService.getPaciente(criteria);
                setPacientes(Array.isArray(data) ? data : [data]);
            } catch (error) {
                console.error('Error en la búsqueda:', error);
                toast.error('Error al buscar pacientes');
            } finally {
                setIsLoading(false);
            }
        } else {
            fetchPacientes();
        }
    };

    // Debounce para la búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        <h2 className="text-2xl font-bold mb-4">Seleccionar Paciente</h2>

                        <div className="mb-4">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o CID..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">CID</th>
                                        <th className="px-4 py-2 text-left">Nombre</th>
                                        <th className="px-4 py-2 text-left">Apellido</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4">
                                                Cargando pacientes...
                                            </td>
                                        </tr>
                                    ) : pacientes.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4">
                                                No se encontraron pacientes
                                            </td>
                                        </tr>
                                    ) : (
                                        pacientes.map((paciente) => (
                                            <tr
                                                key={paciente.cod_paciente}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-2">{paciente.CID}</td>
                                                <td className="px-4 py-2">{paciente.nombre}</td>
                                                <td className="px-4 py-2">{paciente.apellido}</td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        onClick={() => onSelect(paciente)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        Seleccionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SelectPatientModal;