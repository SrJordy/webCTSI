import { useEffect, useState } from "react";
import { getAllPacientes, deletePaciente } from "../service/PacienteService";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import MainLayout from "../layouts/MainLayout";
import ConfirmModal from "../components/ConfirmModal";
import PacienteFormModal from "../components/PacienteModal";

const ManagePatientsPage = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [patientToEdit, setPatientToEdit] = useState<any>(null);

    const fetchPatients = async () => {
        try {
            const data = await getAllPacientes();
            setPatients(data);
        } catch (error) {
            console.error("Error al obtener los pacientes", error);
        }
    };

    const handleDelete = async () => {
        if (patientToDelete !== null) {
            try {
                await deletePaciente(patientToDelete);
                setPatients(patients.filter((patient) => patient.cod_paciente !== patientToDelete));
                setIsModalOpen(false);
            } catch (error) {
                console.error("Error al eliminar el paciente", error);
            }
        }
    };

    const openModal = (id: number) => {
        setPatientToDelete(id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPatientToDelete(null);
    };

    const openEditModal = (patient: any) => {
        setPatientToEdit(patient);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setPatientToEdit(null);
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return (
        <MainLayout>
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Gestión de Pacientes</h1>
                <div className="mb-6 text-right">
                    <button
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                        onClick={() => openEditModal(null)}
                    >
                        Registrar Nuevo Usuario
                    </button>
                </div>
                <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
                    <table className="min-w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="px-6 py-3 text-left">Nombre</th>
                                <th className="px-6 py-3 text-left">Apellido</th>
                                <th className="px-6 py-3 text-left">C.D.I</th>
                                <th className="px-6 py-3 text-left">Teléfono</th>
                                <th className="px-6 py-3 text-left">Fecha Nacimiento</th>
                                <th className="px-6 py-3 text-left">Cuidador</th>
                                <th className="px-6 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient) => (
                                <tr key={patient.cod_paciente} className="hover:bg-gray-50 transition-all duration-200">
                                    <td className="px-6 py-4 text-sm text-gray-800">{patient.nombre}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{patient.apellido}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{patient.CID}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{patient.telefono}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{new Date(patient.fecha_nac).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{patient.cuidador.nombre + " " + patient.cuidador.apellido}</td>
                                    <td className="px-6 py-4 flex space-x-3">
                                        <button
                                            className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-all duration-200"
                                            onClick={() => openEditModal(patient)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all duration-200"
                                            onClick={() => openModal(patient.cod_paciente)}
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <ConfirmModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onConfirm={handleDelete}
                    message="¿Estás seguro de que quieres eliminar este paciente?"
                />
                <PacienteFormModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={fetchPatients}
                    pacienteToEdit={patientToEdit}
                />
            </div>
        </MainLayout>
    );
};

export default ManagePatientsPage;
