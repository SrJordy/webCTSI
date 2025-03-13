import React, { useState, useEffect } from "react";
import { createUser, updateUser } from "../service/UserService";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaIdCard, FaUserTag, FaLock } from "react-icons/fa";
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
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;

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
        setCurrentStep(1);
    }, [userToEdit, isOpen]);

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
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
        } else if (step === 2) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = "Por favor ingresa un correo electrónico válido";
            }
            if (!userToEdit && formData.password.length < 6) {
                newErrors.password = "La contraseña debe tener al menos 6 caracteres";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = () => {
        const personalInfoValid = validateStep(1);
        const accountInfoValid = validateStep(2);
        return personalInfoValid && accountInfoValid;
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

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
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

    const renderStepIndicator = () => {
        return (
            <div className="flex justify-center mb-6">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div key={index} className="flex items-center">
                        <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                currentStep > index + 1 
                                    ? "bg-green-500 text-white" 
                                    : currentStep === index + 1 
                                    ? "bg-[#5FAAD9] text-white" 
                                    : "bg-gray-200 text-gray-600"
                            }`}
                        >
                            {index + 1}
                        </div>
                        {index < totalSteps - 1 && (
                            <div className={`w-12 h-1 ${
                                currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                            }`}></div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderStepTitle = () => {
        switch (currentStep) {
            case 1:
                return "Información Personal";
            case 2:
                return "Información de Cuenta";
            default:
                return "";
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-[#5FAAD9] to-[#035AA6] p-6 text-white">
                                <h2 className="text-2xl font-bold text-center">
                                    {userToEdit ? "Editar Usuario" : "Registrar Usuario"}
                                </h2>
                                <p className="text-blue-100 text-center mt-1">
                                    {renderStepTitle()}
                                </p>
                            </div>
                            
                            <div className="p-6">
                                {renderStepIndicator()}
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {currentStep === 1 && (
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -20, opacity: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-1">Nombre</label>
                                                    <div className="relative">
                                                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            name="nombre"
                                                            value={formData.nombre}
                                                            onChange={handleChange}
                                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-all duration-200 ${errors.nombre ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                            placeholder="Ingrese nombre"
                                                            required
                                                        />
                                                    </div>
                                                    {errors.nombre && (
                                                        <motion.p 
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-red-500 text-sm mt-1"
                                                        >
                                                            {errors.nombre}
                                                        </motion.p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 font-medium mb-1">Apellido</label>
                                                    <div className="relative">
                                                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            name="apellido"
                                                            value={formData.apellido}
                                                            onChange={handleChange}
                                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-all duration-200 ${errors.apellido ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                            placeholder="Ingrese apellido"
                                                            required
                                                        />
                                                    </div>
                                                    {errors.apellido && (
                                                        <motion.p 
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="text-red-500 text-sm mt-1"
                                                        >
                                                            {errors.apellido}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-1">C.D.I</label>
                                                <div className="relative">
                                                    <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="CID"
                                                        value={formData.CID}
                                                        onChange={handleChange}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-all duration-200 ${errors.CID ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                        placeholder="Ingrese CDI (10 dígitos)"
                                                        maxLength={10}
                                                        required
                                                    />
                                                </div>
                                                {errors.CID && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-500 text-sm mt-1"
                                                    >
                                                        {errors.CID}
                                                    </motion.p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-1">Teléfono</label>
                                                <div className="relative">
                                                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="telefono"
                                                        value={formData.telefono}
                                                        onChange={handleChange}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-all duration-200 ${errors.telefono ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                        placeholder="Ingrese teléfono (10 dígitos)"
                                                        maxLength={10}
                                                        required
                                                    />
                                                </div>
                                                {errors.telefono && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-500 text-sm mt-1"
                                                    >
                                                        {errors.telefono}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {currentStep === 2 && (
                                        <motion.div
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 20, opacity: 0 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-1">Correo Electrónico</label>
                                                <div className="relative">
                                                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-all duration-200 ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                        placeholder="ejemplo@correo.com"
                                                        required
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-500 text-sm mt-1"
                                                    >
                                                        {errors.email}
                                                    </motion.p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-1">Rol</label>
                                                <div className="relative">
                                                    <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <select
                                                        name="rol"
                                                        value={formData.rol}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent appearance-none bg-white"
                                                        required
                                                    >
                                                        <option value="CUIDADOR">Cuidador</option>
                                                        <option value="PROFESIONAL">Profesional</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-1">
                                                    Contraseña {userToEdit && "(Dejar en blanco para mantener la actual)"}
                                                </label>
                                                <div className="relative">
                                                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent transition-all duration-200 ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                                        placeholder={userToEdit ? "••••••" : "Mínimo 6 caracteres"}
                                                        required={!userToEdit}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <FaEyeSlash className="h-5 w-5" />
                                                        ) : (
                                                            <FaEye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.password && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-red-500 text-sm mt-1"
                                                    >
                                                        {errors.password}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                                        {currentStep > 1 ? (
                                            <button
                                                type="button"
                                                onClick={handlePrevStep}
                                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Anterior
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                            >
                                                Cancelar
                                            </button>
                                        )}

                                        {currentStep < totalSteps ? (
                                            <button
                                                type="button"
                                                onClick={handleNextStep}
                                                className="bg-[#5FAAD9] text-white px-6 py-2 rounded-lg hover:bg-[#035AA6] transition-colors duration-200 flex items-center"
                                            >
                                                Siguiente
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className={`bg-[#5FAAD9] text-white px-6 py-2 rounded-lg hover:bg-[#035AA6] transition-colors duration-200 flex items-center ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Procesando...
                                                    </>
                                                ) : (
                                                    userToEdit ? "Actualizar" : "Registrar"
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
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