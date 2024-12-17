import React, { useState, useEffect } from "react";
import { createPaciente, updatePaciente } from "../service/PacienteService";
import { getAllUsers } from "../service/UserService";
import { FaUser, FaCalendarAlt, FaPhone, FaHome, FaUserMd, FaTimes, FaCheck } from "react-icons/fa";

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
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        CID: "",
        telefono: "",
        fecha_nac: "",
        genero: "MASCULINO",
        direccion: "",
        cuidador_id: "",
        cuidador_nombre: "",
    });

    const [cuidadores, setCuidadores] = useState<any[]>([]);
    const [isCuidadorModalOpen, setIsCuidadorModalOpen] = useState(false);

    // Obtener lista de cuidadores
    useEffect(() => {
        const fetchCuidadores = async () => {
            try {
                const users = await getAllUsers();
                const filteredUsers = users.filter((user: any) => user.rol === "CUIDADOR");
                setCuidadores(filteredUsers);
            } catch (error) {
                console.error("Error al obtener cuidadores", error);
            }
        };
        fetchCuidadores();
    }, []);

    // Configurar datos al editar
    useEffect(() => {
        if (pacienteToEdit) {
            setFormData({
                nombre: pacienteToEdit.nombre,
                apellido: pacienteToEdit.apellido,
                CID: pacienteToEdit.CID,
                telefono: pacienteToEdit.telefono,
                fecha_nac: pacienteToEdit.fecha_nac.split("T")[0],
                genero: pacienteToEdit.genero,
                direccion: pacienteToEdit.direccion || "",
                cuidador_id: pacienteToEdit.cuidador_id,
                cuidador_nombre: `${pacienteToEdit.cuidador.nombre} ${pacienteToEdit.cuidador.apellido}`,
            });
        } else {
            setFormData({
                nombre: "",
                apellido: "",
                CID: "",
                telefono: "",
                fecha_nac: "",
                genero: "MASCULINO",
                direccion: "",
                cuidador_id: "",
                cuidador_nombre: "",
            });
        }
    }, [pacienteToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...formData };
        data.CID = parseInt(data.CID, 10);
        data.telefono = parseInt(data.telefono, 10);
        data.cuidador_id = parseInt(data.cuidador_id);

        if (!data.cuidador_id) {
            alert("Debe seleccionar un cuidador");
            return;
        }

        try {
            if (pacienteToEdit) {
                console.log(data)
                console.log(pacienteToEdit)
                await updatePaciente(pacienteToEdit.cod_paciente, data);
            } else {
                await createPaciente(data);
            }
            onSubmit();
            onClose();
        } catch (error) {
            console.error("Error al guardar el paciente", error);
        }
    };

    const openCuidadorModal = () => {
        setIsCuidadorModalOpen(true);
    };

    const selectCuidador = (cuidador: any) => {
        setFormData((prevData) => ({
            ...prevData,
            cuidador_id: cuidador.cod_usuario,
            cuidador_nombre: `${cuidador.nombre} ${cuidador.apellido}`,
        }));
        setIsCuidadorModalOpen(false);
    };

    return (
        isOpen && (
            <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                        {pacienteToEdit ? "Editar Paciente" : "Registrar Paciente"}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div>
                            <label className="block text-gray-600">Nombre</label>
                            <div className="flex items-center">
                                <FaUser className="mr-2 text-gray-500" />
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>
                        {/* Apellido */}
                        <div>
                            <label className="block text-gray-600">Apellido</label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                        </div>
                        {/* C.D.I */}
                        <div>
                            <label className="block text-gray-600">C.D.I</label>
                            <input
                                type="text"
                                id="CID"
                                name="CID"
                                value={formData.CID}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    if (value.length <= 10) {
                                        setFormData((prevData) => ({ ...prevData, CID: value }));
                                    }
                                }}
                                className="w-full px-4 py-2 border rounded-md"
                                placeholder="C.D.I (10 números)"
                                required
                            />

                        </div>
                        {/* Teléfono */}
                        <div>
                            <label className="block text-gray-600">Teléfono</label>
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ""); // Eliminar cualquier carácter no numérico
                                    if (value.length <= 10) {
                                        setFormData((prevData) => ({ ...prevData, telefono: value }));
                                    }
                                }}
                                className="w-full px-4 py-2 border rounded-md"
                                placeholder="Teléfono (10 números)"
                                required
                            />
                        </div>
                        {/* Fecha de nacimiento */}
                        <div>
                            <label className="block text-gray-600">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                name="fecha_nac"
                                value={formData.fecha_nac}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                        </div>
                        {/* Género */}
                        <div>
                            <label className="block text-gray-600">Género</label>
                            <select
                                name="genero"
                                value={formData.genero}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md"
                            >
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMENINO">Femenino</option>
                            </select>
                        </div>
                        {/* Dirección */}
                        <div className="col-span-2">
                            <label className="block text-gray-600">Dirección</label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                        </div>
                        {/* Selección de cuidador */}
                        <div className="col-span-2">
                            <label className="block text-gray-600">Cuidador</label>
                            <button
                                type="button"
                                onClick={openCuidadorModal}
                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                {formData.cuidador_nombre || "Seleccionar Cuidador"}
                            </button>
                        </div>
                        {/* Botones */}
                        <div className="col-span-2 flex justify-between">
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
                                {pacienteToEdit ? "Actualizar" : "Registrar"}
                            </button>
                        </div>
                    </form>

                    {/* Modal de cuidadores */}
                    {isCuidadorModalOpen && (
                        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-75 z-50">
                            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
                                <h3 className="text-lg font-semibold mb-4">Seleccionar Cuidador</h3>
                                <ul className="space-y-2">
                                    {cuidadores.map((cuidador) => (
                                        <li
                                            key={cuidador.cod_usuario}
                                            className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
                                            onClick={() => selectCuidador(cuidador)}
                                        >
                                            {cuidador.nombre} {cuidador.apellido}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => setIsCuidadorModalOpen(false)}
                                    className="mt-4 w-full bg-red-500 text-white py-2 rounded-md"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};

export default PacienteFormModal;
