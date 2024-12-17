import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../service/UserService";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import MainLayout from "../layouts/MainLayout";
import ConfirmModal from "../components/ConfirmModal";
import UserFormModal from "../components/UserFormModal"; 

const ManageUsersPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [userToEdit, setUserToEdit] = useState<any | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error al obtener los usuarios", error);
        }
    };

    const handleDelete = async () => {
        if (userToDelete !== null) {
            try {
                await deleteUser(userToDelete);
                setUsers(users.filter((user) => user.cod_usuario !== userToDelete));
                setIsDeleteModalOpen(false);  
            } catch (error) {
                console.error("Error al eliminar el usuario", error);
            }
        }
    };

    const openDeleteModal = (id: number) => {
        setUserToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const openEditModal = (user: any) => {
        setUserToEdit(user);
        console.log(user)
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setUserToEdit(null);
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleFormSubmit = async (userData: any) => {
        if (userToEdit) {
            try {
                console.log('Actualizando usuario:', userData);
                setUsers(users.map(user => user.cod_usuario === userToEdit.cod_usuario ? { ...user, ...userData } : user));
            } catch (error) {
                console.error("Error al actualizar el usuario", error);
            }
        } else {
            try {
                console.log('Registrando nuevo usuario:', userData);
                setUsers([...users, userData]);
            } catch (error) {
                console.error("Error al registrar el usuario", error);
            }
        }
        closeEditModal();
    };

    return (
        <MainLayout>
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Gestión de Usuarios</h1>
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
                                <th className="px-6 py-3 text-left">Correo</th>
                                <th className="px-6 py-3 text-left">Teléfono</th>
                                <th className="px-6 py-3 text-left">Rol</th>
                                <th className="px-6 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.cod_usuario} className="hover:bg-gray-50 transition-all duration-200">
                                    <td className="px-6 py-4 text-sm text-gray-800">{user.nombre}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{user.apellido}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{user.CID}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{user.telefono}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{user.rol}</td>
                                    <td className="px-6 py-4 flex space-x-3">
                                        <button
                                            className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-all duration-200"
                                            onClick={() => openEditModal(user)}  // Abrir el modal de edición
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all duration-200"
                                            onClick={() => openDeleteModal(user.cod_usuario)}  // Abrir el modal de confirmación
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal de confirmacion de eliminacion */}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDelete}
                    message="¿Estás seguro de que quieres eliminar este usuario?"
                />

                {/* Modal de Registro y Edición de Usuario */}
                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={closeEditModal}
                    onSubmit={handleFormSubmit}
                    userToEdit={userToEdit}
                />
            </div>
        </MainLayout>
    );
};

export default ManageUsersPage;
