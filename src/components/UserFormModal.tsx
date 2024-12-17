import React, { useState, useEffect } from "react";
import { createUser, updateUser } from '../service/UserService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: any) => void;
    userToEdit?: any;
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
    const [emailError, setEmailError] = useState("");

    useEffect(() => {
        if (userToEdit) {
            console.log("asdadad",userToEdit.cod_usuario)
            setFormData({
                nombre: userToEdit.nombre,
                apellido: userToEdit.apellido,
                CID: userToEdit.CID.toString(), 
                telefono: userToEdit.telefono.toString(), 
                email: userToEdit.email,
                rol: userToEdit.rol,
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
    }, [userToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "CID" || name === "telefono") {
            if (/^\d*$/.test(value)) { 
                setFormData((prevData) => ({ ...prevData, [name]: value }));
            }
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = { ...formData };
        data.CID = parseInt(data.CID, 10);
        data.telefono = parseInt(data.telefono, 10);

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(data.email)) {
            setEmailError("Por favor ingresa un correo electrónico válido.");
            return;
        } else {
            setEmailError(""); 
        }

        if (data.CID.toString().length !== 10 || data.telefono.toString().length !== 10) {
            alert("El C.D.I y el Teléfono deben tener exactamente 10 dígitos.");
            return;
        }

        if (!userToEdit && !data.password) {
            alert('La contraseña es requerida');
            return;
        }

        try {
            if (userToEdit) {
                if (data.password === "") {
                    delete data.password;
                }
                console.log(userToEdit)
                await updateUser(userToEdit.cod_usuario, data);
            } else {
                console.log(data)
                await createUser(data);
            }
            onSubmit(data);
            onClose();
        } catch (error) {
            console.error('Error al crear o actualizar el usuario', error);
        }
    };

    return (
        isOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {userToEdit ? "Editar Usuario" : "Registrar Usuario"}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="nombre" className="block text-gray-600">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md mt-2"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="apellido" className="block text-gray-600">Apellido</label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md mt-2"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="CID" className="block text-gray-600">C.D.I</label>
                            <input
                                type="text" 
                                id="CID"
                                name="CID"
                                value={formData.CID}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md mt-2"
                                required
                                maxLength={10} 
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="telefono" className="block text-gray-600">Teléfono</label>
                            <input
                                type="text" 
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md mt-2"
                                required
                                maxLength={10} 
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-600">Correo</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md mt-2"
                                required
                            />
                            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                        </div>
                        <div className="mb-4">
                            <label htmlFor="rol" className="block text-gray-600">Rol</label>
                            <select
                                id="rol"
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md mt-2"
                                required
                            >
                                <option value="CUIDADOR">CUIDADOR</option>
                                <option value="PROFESIONAL">PROFESIONAL</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-600">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md mt-2"
                                    required={!userToEdit} 
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center px-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="w-5 h-5" />
                                    ) : (
                                        <FaEye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                            >
                                {userToEdit ? "Actualizar" : "Registrar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );
};

export default UserFormModal;
