import { useEffect, useState, useMemo } from "react";
import { getAllPacientes, deletePaciente } from "../service/PacienteService";
import { FaEdit, FaTrashAlt, FaSearch, FaFilter, FaDownload, FaPlus} from "react-icons/fa";
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
                    patient.nombre,
                    patient.apellido,
                    patient.CID,
                    patient.telefono,
                    formatDate(patient.fecha_nac),
                    patient.genero,
                    `${patient.cuidador?.nombre || ''} ${patient.cuidador?.apellido || ''}`
                ].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'pacientes.csv';
        link.click();
    };

    useEffect(() => {
        fetchPatients();
    }, []);
    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container mx-auto p-6"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Gestión de Pacientes
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({filteredPatients.length} pacientes)
                        </span>
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#5FAAD9] text-white px-6 py-2 rounded-lg hover:bg-[#035AA6] transition-colors duration-300 flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <FaPlus className="mr-2" /> Nuevo Paciente
                    </motion.button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar pacientes..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#020659] focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-gray-400" />
                            <select
                                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#020659] focus:border-transparent"
                                value={filterGender}
                                onChange={(e) => setFilterGender(e.target.value)}
                            >
                                <option value="TODOS">Todos los géneros</option>
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMENINO">Femenino</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors"
                        >
                            <FaDownload />
                            <span>Exportar CSV</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Nombre', 'Apellido', 'C.D.I', 'Teléfono', 'Fecha Nacimiento', 'Género', 'Cuidador', 'Acciones'].map((header) => (
                                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {paginatedPatients.map((patient) => (
                                        <motion.tr
                                            key={patient.cod_paciente}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">{patient.nombre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{patient.apellido}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{patient.CID}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{patient.telefono}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(patient.fecha_nac)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                    ${patient.genero === 'MASCULINO' ? 'bg-blue-100 text-blue-800' :
                                                        patient.genero === 'FEMENINO' ? 'bg-pink-100 text-pink-800' :
                                                            'bg-purple-100 text-purple-800'}`}>
                                                    {patient.genero}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {patient.cuidador ? `${patient.cuidador.nombre} ${patient.cuidador.apellido}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        onClick={() => handleEdit(patient)}
                                                    >
                                                        <FaEdit size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="text-red-600 hover:text-red-900"
                                                        onClick={() => {
                                                            setPatientToDelete(patient.cod_paciente);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                    >
                                                        <FaTrashAlt size={20} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Siguiente
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando{" "}
                                    <span className="font-medium">
                                        {(currentPage - 1) * itemsPerPage + 1}
                                    </span>{" "}
                                    a{" "}
                                    <span className="font-medium">
                                        {Math.min(currentPage * itemsPerPage, filteredPatients.length)}
                                    </span>{" "}
                                    de <span className="font-medium">{filteredPatients.length}</span>{" "}
                                    resultados
                                </p>
                            </div>
                            <div>
                                <nav
                                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                    aria-label="Pagination"
                                >
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                ${currentPage === page
                                                    ? "z-10 bg-[#5FAAD9]  text-white"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    message="¿Estás seguro de que quieres eliminar este paciente?"
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