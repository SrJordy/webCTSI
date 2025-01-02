import React, { useState, useEffect } from "react";
import { createPaciente, updatePaciente } from "../service/PacienteService";
import { getAllUsers } from "../service/UserService";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUser,
    FaCalendarAlt,
    FaPhone,
    FaUserMd,
    FaTimes,
    FaIdCard,
    FaVenusMars,
    FaMapMarkerAlt,
    FaSearch,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

interface PacienteFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    pacienteToEdit?: any;
}

const PacienteFormModal: React.FC<PacienteFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    pacienteToEdit,
}) => {
    const initialFormState = {
        nombre: "",
        apellido: "",
        CID: "",
        telefono: "",
        fecha_nac: "",
        genero: "MASCULINO",
        direccion: "",
        cuidador_id: "",
        cuidador_nombre: "",
    };

    const [formData, setFormData] = useState(initialFormState);
    const [cuidadores, setCuidadores] = useState<any[]>([]);
    const [isCuidadorModalOpen, setIsCuidadorModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCuidadores = async () => {
            if (isOpen) {
                try {
                    const users = await getAllUsers();
                    const filteredUsers = users.filter((user: any) => user.rol === "CUIDADOR");
                    setCuidadores(filteredUsers);
                } catch (error) {
                    console.error("Error al cargar cuidadores:", error);
                    toast.error("Error al cargar los cuidadores");
                }
            }
        };
        fetchCuidadores();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && pacienteToEdit) {
            console.log("Datos del paciente a editar:", pacienteToEdit);
            const formattedDate = pacienteToEdit.fecha_nac
                ? new Date(pacienteToEdit.fecha_nac).toISOString().split("T")[0]
                : "";
            console.log("Fecha formateada:", formattedDate);
            
            setFormData({
                nombre: pacienteToEdit.nombre || "",
                apellido: pacienteToEdit.apellido || "",
                CID: pacienteToEdit.CID?.toString() || "",
                telefono: pacienteToEdit.telefono?.toString() || "",
                fecha_nac: formattedDate,
                genero: pacienteToEdit.genero || "MASCULINO",
                direccion: pacienteToEdit.direccion || "",
                cuidador_id: pacienteToEdit.cuidador_id?.toString() || "",
                cuidador_nombre: pacienteToEdit.cuidador
                    ? `${pacienteToEdit.cuidador.nombre} ${pacienteToEdit.cuidador.apellido}`
                    : "",
            });
        } else {
            setFormData(initialFormState);
        }
    }, [isOpen, pacienteToEdit]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
        if (!formData.apellido.trim()) newErrors.apellido = "El apellido es requerido";
        if (!formData.CID.trim()) newErrors.CID = "El CDI es requerido";
        if (formData.CID.length !== 10) newErrors.CID = "El CDI debe tener 10 dígitos";
        if (!formData.telefono.trim()) newErrors.telefono = "El teléfono es requerido";
        if (formData.telefono.length !== 10) newErrors.telefono = "El teléfono debe tener 10 dígitos";
        if (!formData.fecha_nac) newErrors.fecha_nac = "La fecha de nacimiento es requerida";
        if (!formData.cuidador_id) newErrors.cuidador = "Debe seleccionar un cuidador";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        setFormData(initialFormState);
        setErrors({});
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Por favor, corrija los errores en el formulario");
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                ...formData,
                CID: parseInt(formData.CID),
                telefono: formData.telefono,
                cuidador_id: parseInt(formData.cuidador_id)
            };

            console.log("Datos a enviar:", data);

            if (pacienteToEdit) {
                await updatePaciente(pacienteToEdit.cod_paciente, data);
                toast.success("Paciente actualizado exitosamente");
            } else {
                await createPaciente(data);
                toast.success("Paciente registrado exitosamente");
            }
            
            onSubmit();
            handleClose();
        } catch (error) {
            console.error("Error:", error);
            toast.error(pacienteToEdit ? 
                "Error al actualizar el paciente" : 
                "Error al registrar el paciente"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectCuidador = (cuidador: any) => {
        setFormData({
            ...formData,
            cuidador_id: cuidador.cod_usuario.toString(),
            cuidador_nombre: `${cuidador.nombre} ${cuidador.apellido}`,
        });
        setIsCuidadorModalOpen(false);
        setErrors({ ...errors, cuidador: "" });
    };

    const filteredCuidadores = cuidadores.filter(cuidador =>
        `${cuidador.nombre} ${cuidador.apellido}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl relative z-50"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {pacienteToEdit ? "Editar Paciente" : "Registrar Nuevo Paciente"}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => {
                                            setFormData({ ...formData, nombre: e.target.value });
                                            setErrors({ ...errors, nombre: "" });
                                        }}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                            ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Ingrese el nombre"
                                    />
                                </div>
                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
                                )}
                            </div>

                            {/* Apellido */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Apellido
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.apellido}
                                        onChange={(e) => {
                                            setFormData({ ...formData, apellido: e.target.value });
                                            setErrors({ ...errors, apellido: "" });
                                        }}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                            ${errors.apellido ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Ingrese el apellido"
                                    />
                                </div>
                                {errors.apellido && (
                                    <p className="mt-1 text-sm text-red-500">{errors.apellido}</p>
                                )}
                            </div>

                            {/* CDI */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    C.D.I
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaIdCard className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.CID}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "");
                                            if (value.length <= 10) {
                                                setFormData({ ...formData, CID: value });
                                                setErrors({ ...errors, CID: "" });
                                            }
                                        }}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                            ${errors.CID ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Ingrese el CDI (10 dígitos)"
                                    />
                                </div>
                                {errors.CID && (
                                    <p className="mt-1 text-sm text-red-500">{errors.CID}</p>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaPhone className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.telefono}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "");
                                            if (value.length <= 10) {
                                                setFormData({ ...formData, telefono: value });
                                                setErrors({ ...errors, telefono: "" });
                                            }
                                        }}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                            ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Ingrese el teléfono (10 dígitos)"
                                    />
                                </div>
                                {errors.telefono && (
                                    <p className="mt-1 text-sm text-red-500">{errors.telefono}</p>
                                )}
                            </div>

                            {/* Fecha de Nacimiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Nacimiento
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaCalendarAlt className="text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        value={formData.fecha_nac}
                                        onChange={(e) => {
                                            setFormData({ ...formData, fecha_nac: e.target.value });
                                            setErrors({ ...errors, fecha_nac: "" });
                                        }}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                            ${errors.fecha_nac ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                </div>
                                {errors.fecha_nac && (
                                    <p className="mt-1 text-sm text-red-500">{errors.fecha_nac}</p>
                                )}
                            </div>

                            {/* Género */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Género
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaVenusMars className="text-gray-400" />
                                    </div>
                                    <select
                                        value={formData.genero}
                                        onChange={(e) => {
                                            setFormData({ ...formData, genero: e.target.value });
                                            setErrors({ ...errors, genero: "" });
                                        }}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                            ${errors.genero ? "border-red-500" : "border-gray-300"}`}
                                    >
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMENINO">Femenino</option>
                                    </select>
                                </div>
                                {errors.genero && (
                                    <p className="mt-1 text-sm text-red-500">{errors.genero}</p>
                                )}
                            </div>

                            {/* Dirección */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.direccion}
                                        onChange={(e) => {
                                            setFormData({ ...formData, direccion: e.target.value });
                                            setErrors({ ...errors, direccion: "" });
                                        }}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                            ${errors.direccion ? "border-red-500" : "border-gray-300"}`}
                                        placeholder="Ingrese la dirección"
                                    />
                                </div>
                                {errors.direccion && (
                                    <p className="mt-1 text-sm text-red-500">{errors.direccion}</p>
                                )}
                            </div>

                            {/* Cuidador */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cuidador
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUserMd className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.cuidador_nombre}
                                        readOnly
                                        onClick={() => setIsCuidadorModalOpen(true)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer
                                            ${errors.cuidador ? "border-red-500" : "border-gray-300"}`}
                                        placeholder="Seleccione un cuidador"
                                    />
                                </div>
                                {errors.cuidador && (
                                    <p className="mt-1 text-sm text-red-500">{errors.cuidador}</p>
                                )}
                            </div>

                            {/* Botones de acción */}
                            <div className="col-span-2 flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Procesando...
                                        </div>
                                    ) : pacienteToEdit ? (
                                        "Actualizar"
                                    ) : (
                                        "Registrar"
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Modal de selección de cuidador */}
                    <AnimatePresence>
                        {isCuidadorModalOpen && (
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black bg-opacity-50"
                                    onClick={() => setIsCuidadorModalOpen(false)}
                                />
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative z-50"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-semibold">
                                            Seleccionar Cuidador
                                        </h3>
                                        <button
                                            onClick={() => setIsCuidadorModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <FaTimes size={20} />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Buscar cuidador..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                                            />
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {filteredCuidadores.map((cuidador) => (
                                            <div
                                                key={cuidador.cod_usuario}
                                                onClick={() => handleSelectCuidador(cuidador)}
                                                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg"
                                            >
                                                <FaUserMd className="text-gray-400 mr-3" />
                                                <div>
                                                    <p className="font-medium">
                                                        {cuidador.nombre} {cuidador.apellido}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        CDI: {cuidador.CID}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PacienteFormModal;