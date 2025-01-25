import React, { useState, useEffect } from "react";
import { createUser, updateUser } from "../service/UserService";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaIdCard } from "react-icons/fa";
import SuccessModal from './SuccessModal';
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: { nombre: string; apellido: string; CID: string; telefono: string; email: string; rol: string; password: string }) => void;
    userToEdit?: {
        nombre?: string;
        apellido?: string;
        CID?: string | number;
        telefono?: string | number;
        email?: string;
        rol?: string;
        cod_usuario?: string | number;
    };
}

const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    userToEdit,
}) => {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        CID: "",
        telefono: "",
        email: "",
        rol: "CUIDADOR",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                nombre: userToEdit.nombre || "",
                apellido: userToEdit.apellido || "",
                CID: userToEdit.CID?.toString() || "",
                telefono: userToEdit.telefono?.toString() || "",
                email: userToEdit.email || "",
                rol: userToEdit.rol || "CUIDADOR",
                password: "",
            });
        } else {
            setFormData({
                nombre: "",
                apellido: "",
                CID: "",
                telefono: "",
                email: "",
                rol: "CUIDADOR",
                password: "",
            });
        }
        setErrors({});
    }, [userToEdit]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (formData.nombre.trim().length < 2) {
            newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
        }
        if (formData.apellido.trim().length < 2) {
            newErrors.apellido = "El apellido debe tener al menos 2 caracteres";
        }

        if (!/^\d{10}$/.test(formData.CID)) {
            newErrors.CID = "El CDI debe tener exactamente 10 dígitos";
        }

        if (!/^\d{10}$/.test(formData.telefono)) {
            newErrors.telefono = "El teléfono debe tener exactamente 10 dígitos";
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Por favor ingresa un correo electrónico válido";
        }

        if (!userToEdit && formData.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if ((name === "CID" || name === "telefono") && !/^\d*$/.test(value)) {
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const data: { nombre: string; apellido: string; CID: string; telefono: string; email: string; rol: string; password?: string } = {
                ...formData,
                CID: formData.CID,
                telefono: formData.telefono, 
            };

            if (userToEdit) {
                if (!data.password) delete data.password;
                if (typeof userToEdit.cod_usuario === 'number') {
                    await updateUser(userToEdit.cod_usuario, data);
                } else {
                    throw new Error('Invalid user ID');
                }
                setSuccessMessage("Usuario actualizado exitosamente");
            } else {
                console.log("datos del USUARIO:", data)
                await createUser(data);
                setSuccessMessage("Usuario creado exitosamente");
            }

            setShowSuccessModal(true); 

        } catch (error) {
            console.error('❌ Error en la operación:', error);
            toast.error("Error al procesar el usuario");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        onSubmit(formData);
        onClose();
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                {userToEdit ? "Editar Usuario" : "Registrar Usuario"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-600 font-medium mb-1">Nombre</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombre ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                required
                                            />
                                        </div>
                                        {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 font-medium mb-1">Apellido</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="apellido"
                                                value={formData.apellido}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.apellido ? "border-red-500" : "border-gray-300"
                                                    }`}
                                                required
                                            />
                                        </div>
                                        {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-600 font-medium mb-1">C.D.I</label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="CID"
                                            value={formData.CID}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.CID ? "border-red-500" : "border-gray-300"
                                                }`}
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                    {errors.CID && <p className="text-red-500 text-sm mt-1">{errors.CID}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-600 font-medium mb-1">Teléfono</label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.telefono ? "border-red-500" : "border-gray-300"
                                                }`}
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                    {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-600 font-medium mb-1">Correo</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"
                                                }`}
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-600 font-medium mb-1">Rol</label>
                                    <select
                                        name="rol"
                                        value={formData.rol}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="CUIDADOR">Cuidador</option>
                                        <option value="PROFESIONAL">Profesional</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-600 font-medium mb-1">Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"
                                                }`}
                                            required={!userToEdit}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <FaEyeSlash className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <FaEye className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                                <div className="flex justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className={`bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Procesando..." : userToEdit ? "Actualizar" : "Registrar"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                message={successMessage}
            />
        </>
    );
};

export default UserFormModal;