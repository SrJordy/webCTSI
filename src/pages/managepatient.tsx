import { useEffect, useState, useMemo } from "react";
import { getAllPacientes, deletePaciente } from "../service/PacienteService";
import { 
    FaEdit, 
    FaTrashAlt, 
    FaSearch, 
    FaFilter, 
    FaDownload, 
    FaPlus, 
    FaUserInjured, 
    FaCalendarAlt, 
    FaPhoneAlt, 
    FaIdCard, 
    FaVenusMars, 
    FaUserFriends,
    FaChevronLeft,
    FaChevronRight,
    FaTimes
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import ConfirmModal from "../components/ConfirmModal";
import PacienteFormModal from "../components/PacienteModal";
import { toast } from "react-hot-toast";

interface Paciente {
    cod_paciente: number;
    nombre: string;
    apellido: string;
    CID: string;
    telefono: string;
    fecha_nac: string;
    genero: string;
    cod_cuidador: number;
    cuidador?: {
        nombre: string;
        apellido: string;
    };
    direccion: string;
    cuidador_id: number;
}

const ManagePatientsPage = () => {
    const [patients, setPatients] = useState<Paciente[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<number | null>(null);
    const [patientToEdit, setPatientToEdit] = useState<Paciente | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterGender, setFilterGender] = useState("TODOS");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);
    const itemsPerPage = 10;

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const fetchPatients = async () => {
        setIsLoading(true);
        try {
            const data = await getAllPacientes();
            setPatients(data);
            toast.success('Pacientes cargados exitosamente');
        } catch (error) {
            console.error("Error al obtener los pacientes", error);
            toast.error('Error al cargar los pacientes');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPatients = useMemo(() => {
        return patients.filter(patient => {
            try {
                const searchTermLower = searchTerm.toLowerCase().trim();

                const matchesSearch =
                    (patient?.nombre?.toLowerCase() || '').includes(searchTermLower) ||
                    (patient?.apellido?.toLowerCase() || '').includes(searchTermLower) ||
                    (patient?.CID?.toString() || '').includes(searchTermLower);

                const matchesGender = filterGender === "TODOS" || patient?.genero === filterGender;

                return matchesSearch && matchesGender;
            } catch (error) {
                console.error('Error al filtrar paciente:', error);
                return false;
            }
        });
    }, [patients, searchTerm, filterGender]);

    const paginatedPatients = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPatients.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPatients, currentPage]);

    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    const handleEdit = (patient: Paciente) => {
        console.log("Editando paciente:", patient);
        setPatientToEdit(patient);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (patientToDelete !== null) {
            try {
                await deletePaciente(patientToDelete);
                setPatients(patients.filter((patient) => patient.cod_paciente !== patientToDelete));
                toast.success('Paciente eliminado exitosamente');
                setIsDeleteModalOpen(false);
            } catch (error) {
                console.error("Error al eliminar el paciente", error);
                toast.error('Error al eliminar el paciente');
            }
        }
    };

    const exportToCSV = () => {
        const headers = ['Nombre', 'Apellido', 'CDI', 'Teléfono', 'Fecha Nacimiento', 'Género', 'Cuidador'];
        const csvContent = [
            headers.join(','),
            ...filteredPatients.map(patient =>
                [
                    `"${patient.nombre || ''}"`,
                    `"${patient.apellido || ''}"`,
                    `"${patient.CID || ''}"`,
                    `"${patient.telefono || ''}"`,
                    `"${formatDate(patient.fecha_nac) || ''}"`,
                    `"${patient.genero || ''}"`,
                    `"${patient.cuidador ? `${patient.cuidador.nombre} ${patient.cuidador.apellido}` : ''}"`
                ].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `pacientes_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        toast.success('Archivo CSV generado exitosamente');
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterGender("TODOS");
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-gradient-to-b from-[#C4E5F2] to-[#E6F4F9] -m-8 p-8"
            >
                <div className="max-w-7xl mx-auto">
                    {/* Encabezado */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
                    >
                        <div className="bg-[#5FAAD9] px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-white">Gestión de Pacientes</h1>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                                        {filteredPatients.length} registros
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-600 flex items-center">
                                <FaUserInjured className="mr-2 text-[#5FAAD9]" />
                                Administración de pacientes y asignación de cuidadores
                            </p>
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center"
                                    onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                                >
                                    <FaFilter className="mr-2" />
                                    {isFiltersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-[#5FAAD9] text-white px-6 py-2 rounded-lg hover:bg-[#035AA6] transition-colors duration-300 flex items-center shadow-md"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <FaPlus className="mr-2" />
                                    Nuevo Paciente
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filtros */}
                    <AnimatePresence>
                        {isFiltersVisible && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-lg p-6 mb-8 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <FaSearch className="mr-2 text-[#5FAAD9]" />
                                            Buscar paciente
                                        </label>
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent"
                                                placeholder="Nombre, apellido o CDI..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <FaVenusMars className="mr-2 text-[#5FAAD9]" />
                                            Filtrar por género
                                        </label>
                                        <div className="relative">
                                            <FaVenusMars className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <select
                                                value={filterGender}
                                                onChange={(e) => setFilterGender(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FAAD9] focus:border-transparent appearance-none"
                                            >
                                                <option value="TODOS">Todos los géneros</option>
                                                <option value="MASCULINO">Masculino</option>
                                                <option value="FEMENINO">Femenino</option>
                                                <option value="OTRO">Otro</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <FaDownload className="mr-2 text-[#5FAAD9]" />
                                            Exportar datos
                                        </label>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={exportToCSV}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5FAAD9] text-white font-medium rounded-lg hover:bg-[#035AA6] transition-colors"
                                            disabled={filteredPatients.length === 0}
                                        >
                                            <FaDownload />
                                            <span>Exportar a CSV</span>
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                    >
                                        <FaTimes className="mr-2" />
                                        Limpiar filtros
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Contenido principal */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8"
                    >
                        {isLoading ? (
                            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5FAAD9] mx-auto"></div>
                                <p className="mt-4 text-gray-600">Cargando pacientes...</p>
                            </div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                                <FaUserInjured className="mx-auto text-gray-300 text-5xl mb-4" />
                                <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron pacientes</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm || filterGender !== "TODOS"
                                        ? 'No hay pacientes que coincidan con los filtros aplicados'
                                        : 'No hay pacientes registrados en el sistema'}
                                </p>
                                {(searchTerm || filterGender !== "TODOS") ? (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <FaPlus /> Registrar primer paciente
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-[#5FAAD9] bg-opacity-10">
                                            <tr>
                                                {['Nombre', 'Apellido', 'C.D.I', 'Teléfono', 'Fecha Nacimiento', 'Género', 'Cuidador', 'Acciones'].map((header) => (
                                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            <AnimatePresence mode="popLayout">
                                                {paginatedPatients.map((patient) => (
                                                    <motion.tr
                                                        key={patient.cod_paciente}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="hover:bg-[#F9FBFF]"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{patient.nombre || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{patient.apellido || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap flex items-center">
                                                            <FaIdCard className="text-gray-400 mr-2" size={14} />
                                                            {patient.CID || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {patient.telefono ? (
                                                                <a href={`tel:${patient.telefono}`} className="text-[#5FAAD9] hover:underline flex items-center">
                                                                    <FaPhoneAlt className="mr-2" size={14} />
                                                                    {patient.telefono}
                                                                </a>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap flex items-center">
                                                            <FaCalendarAlt className="text-gray-400 mr-2" size={14} />
                                                            {formatDate(patient.fecha_nac)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center w-fit
                                                                ${patient.genero === 'MASCULINO' 
                                                                    ? 'bg-blue-100 text-blue-800' 
                                                                    : patient.genero === 'FEMENINO' 
                                                                        ? 'bg-pink-100 text-pink-800' 
                                                                        : 'bg-purple-100 text-purple-800'
                                                                }`}>
                                                                <FaVenusMars className="mr-1" size={12} />
                                                                {patient.genero}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {patient.cuidador ? (
                                                                <div className="flex items-center">
                                                                    <FaUserFriends className="text-[#5FAAD9] mr-2" size={14} />
                                                                    <span>{patient.cuidador.nombre} {patient.cuidador.apellido}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 italic">Sin asignar</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex space-x-3">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="text-yellow-500 hover:text-yellow-700 bg-yellow-50 p-2 rounded-lg transition-colors"
                                                                    onClick={() => handleEdit(patient)}
                                                                    title="Editar paciente"
                                                                >
                                                                    <FaEdit size={16} />
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
                                                                    onClick={() => {
                                                                        setPatientToDelete(patient.cod_paciente);
                                                                        setIsDeleteModalOpen(true);
                                                                    }}
                                                                    title="Eliminar paciente"
                                                                >
                                                                    <FaTrashAlt size={16} />
                                                                </motion.button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 mb-4">
                            <nav className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-2 rounded-lg flex items-center ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <FaChevronLeft className="mr-1" size={14} />
                                    Anterior
                                </button>
                                
                                <div className="flex gap-2">
                                    {Array.from({ length: totalPages }, (_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                                                currentPage === index + 1
                                                    ? 'bg-[#5FAAD9] text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-2 rounded-lg flex items-center ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Siguiente
                                    <FaChevronRight className="ml-1" size={14} />
                                </button>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Modales */}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message="¿Está seguro que desea eliminar este paciente? Esta acción no se puede deshacer."
                />

                <PacienteFormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setPatientToEdit(null);
                    }}
                    onSubmit={() => {
                        fetchPatients();
                        setIsModalOpen(false);
                        setPatientToEdit(null);
                    }}
                    pacienteToEdit={patientToEdit}
                />
            </motion.div>
        </MainLayout>
    );
};

export default ManagePatientsPage;