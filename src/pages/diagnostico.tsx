import { useEffect, useState, useMemo } from "react";
import { DiagnosticoService } from "../service/diagnosticoService";
import { FaEdit, FaTrashAlt, FaSearch, FaDownload, FaPlus, FaEye } from "react-icons/fa";
import { BiLoaderAlt } from 'react-icons/bi';
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import ConfirmModal from "../components/ConfirmModal";
import DiagnosticoModal from "../components/diagnosticoModal";
import ViewDiagnosticoModal from "../components/viewDiagnosticoModal";
import { toast } from "react-hot-toast";
import { Diagnostico } from "../assets/Diagnosticos";

const DiagnosticosPage = () => {
    const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [diagnosticoToDelete, setDiagnosticoToDelete] = useState<number | null>(null);
    const [diagnosticoToEdit, setDiagnosticoToEdit] = useState<Diagnostico | null>(null);
    const [diagnosticoToView, setDiagnosticoToView] = useState<Diagnostico | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const truncateText = (text: string, limit: number = 25) => {
        if (text.length <= limit) return text;
        return text.slice(0, limit) + "...";
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
        
        return adjustedDate.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const fetchDiagnosticos = async () => {
        setIsLoading(true);
        try {
            const data = await DiagnosticoService.getAllDiagnosticos();
            setDiagnosticos(data);
            toast.success("Diagnósticos cargados exitosamente");
        } catch (error) {
            console.error("Error al obtener los diagnósticos", error);
            toast.error("Error al cargar los diagnósticos");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDiagnosticos = useMemo(() => {
        return diagnosticos.filter((diagnostico) => {
            const searchTermLower = searchTerm.toLowerCase().trim();
            return (
                diagnostico.descripcion.toLowerCase().includes(searchTermLower) ||
                (diagnostico.historial?.persona?.nombre?.toLowerCase() || "").includes(searchTermLower) ||
                (diagnostico.historial?.persona?.apellido?.toLowerCase() || "").includes(searchTermLower)
            );
        });
    }, [diagnosticos, searchTerm]);

    const paginatedDiagnosticos = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredDiagnosticos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredDiagnosticos, currentPage]);

    const totalPages = Math.ceil(filteredDiagnosticos.length / itemsPerPage);

    const handleEdit = (diagnostico: Diagnostico) => {
        setDiagnosticoToEdit(diagnostico);
        setIsModalOpen(true);
    };

    const handleView = (diagnostico: Diagnostico) => {
        setDiagnosticoToView(diagnostico);
        setIsViewModalOpen(true);
    };

    const handleDelete = async () => {
        if (diagnosticoToDelete !== null) {
            try {
                await DiagnosticoService.deleteDiagnostico(diagnosticoToDelete);
                setDiagnosticos(diagnosticos.filter((diag) => diag.cod_diagnostico !== diagnosticoToDelete));
                toast.success("Diagnóstico eliminado exitosamente");
                setIsDeleteModalOpen(false);
            } catch (error) {
                console.error("Error al eliminar el diagnóstico", error);
                toast.error("Error al eliminar el diagnóstico");
            }
        }
    };

    const exportToCSV = () => {
        const headers = ["Descripción", "Fecha", "Paciente", "Profesional"];
        const csvContent = [
            headers.join(","),
            ...filteredDiagnosticos.map((diagnostico) =>
                [
                    diagnostico.descripcion,
                    formatDate(diagnostico.fecha_diagnostico),
                    `${diagnostico.historial?.persona?.nombre || ""} ${diagnostico.historial?.persona?.apellido || ""}`,
                    `${diagnostico.historial?.profesional?.nombre || ""} ${diagnostico.historial?.profesional?.apellido || ""}`,
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "diagnosticos.csv";
        link.click();
    };

    useEffect(() => {
        fetchDiagnosticos();
    }, []);

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container mx-auto p-6"
            >
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Gestión de Diagnósticos
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            {isLoading ? (
                                <BiLoaderAlt className="inline animate-spin ml-2" />
                            ) : (
                                `(${filteredDiagnosticos.length} diagnósticos)`
                            )}
                        </span>
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`bg-[#5FAAD9] text-white px-6 py-2 rounded-lg hover:bg-[#035AA6] transition-colors duration-300 flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        onClick={() => !isLoading && setIsModalOpen(true)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <BiLoaderAlt className="animate-spin mr-2" />
                        ) : (
                            <FaPlus className="mr-2" />
                        )}
                        Nuevo Diagnóstico
                    </motion.button>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar diagnósticos..."
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#020659] focus:border-transparent ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <button
                            onClick={exportToCSV}
                            className={`flex items-center gap-2 px-4 py-2 bg-[#5FAAD9] text-white rounded-lg hover:bg-[#035AA6] transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <BiLoaderAlt className="animate-spin" />
                            ) : (
                                <FaDownload />
                            )}
                            <span>Exportar CSV</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-8">
                            <BiLoaderAlt className="animate-spin text-[#5FAAD9] text-4xl mb-2" />
                            <p className="text-gray-600">Cargando diagnósticos...</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {["Descripción", "Fecha", "Paciente", "Profesional", "Acciones"].map(
                                                (header) => (
                                                    <th
                                                        key={header}
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        {header}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedDiagnosticos.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                                    No se encontraron diagnósticos
                                                </td>
                                            </tr>
                                        ) : (
                                            <AnimatePresence>
                                                {paginatedDiagnosticos.map((diagnostico) => (
                                                    <motion.tr
                                                        key={diagnostico.cod_diagnostico}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span title={diagnostico.descripcion}> 
                                                                {truncateText(diagnostico.descripcion)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {formatDate(diagnostico.fecha_diagnostico)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {diagnostico.historial?.persona
                                                                ? `${diagnostico.historial.persona.nombre} ${diagnostico.historial.persona.apellido}`
                                                                : "-"}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {diagnostico.historial?.profesional
                                                                ? `${diagnostico.historial.profesional.nombre} ${diagnostico.historial.profesional.apellido}`
                                                                : "-"}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex space-x-2">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                    onClick={() => handleView(diagnostico)}
                                                                >
                                                                    <FaEye size={20} />
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="text-yellow-600 hover:text-yellow-900"
                                                                    onClick={() => handleEdit(diagnostico)}
                                                                >
                                                                    <FaEdit size={20} />
                                                                </motion.button>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    className="text-red-600 hover:text-red-900"
                                                                    onClick={() => {
                                                                        setDiagnosticoToDelete(diagnostico.cod_diagnostico);
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
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {paginatedDiagnosticos.length > 0 && (
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
                                                    {Math.min(currentPage * itemsPerPage, filteredDiagnosticos.length)}
                                                </span>{" "}
                                                de <span className="font-medium">{filteredDiagnosticos.length}</span>{" "}
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
                                                                ? "z-10 bg-[#5FAAD9] text-white"
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
                            )}
                        </>
                    )}
                </div>

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    message="¿Estás seguro de que quieres eliminar este diagnóstico?"
                />
                <DiagnosticoModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setDiagnosticoToEdit(null);
                    }}
                    onSubmit={() => {
                        fetchDiagnosticos();
                        setIsModalOpen(false);
                        setDiagnosticoToEdit(null);
                    }}
                    diagnostico={diagnosticoToEdit}
                />
                <ViewDiagnosticoModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    diagnostico={diagnosticoToView}
                />
            </motion.div>
        </MainLayout>
    );
};

export default DiagnosticosPage;