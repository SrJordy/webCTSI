import { useEffect, useState, useMemo } from "react";
import { getAllCitas, deleteCita } from "../service/citeService";
import { FaEdit, FaTrashAlt, FaSearch, FaDownload, FaPlus, FaEye } from "react-icons/fa";
import { BiLoaderAlt } from 'react-icons/bi';
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import ConfirmModal from "../components/ConfirmModal";
import CitaModal from "../components/CitaModal";
import ViewCitaModal from "../components/ViewCitaModal";
import { toast } from "react-hot-toast";
import { Cita } from "../assets/Cita";

const CitasPage = () => {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [citaToDelete, setCitaToDelete] = useState<number | null>(null);
    const [citaToEdit, setCitaToEdit] = useState<Cita | null>(null);
    const [citaToView, setCitaToView] = useState<Cita | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const fetchCitas = async () => {
        setIsLoading(true);
        try {
            const data = await getAllCitas();
            setCitas(data);
            toast.success("Citas cargadas exitosamente");
        } catch (error) {
            console.error("Error al obtener las citas", error);
            toast.error("Error al cargar las citas");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCitas = useMemo(() => {
        return citas.filter((cita) => {
            const searchTermLower = searchTerm.toLowerCase().trim();
            return (
                cita.motivo.toLowerCase().includes(searchTermLower) ||
                cita.lugar.toLowerCase().includes(searchTermLower) ||
                (cita.persona?.nombre?.toLowerCase() || "").includes(searchTermLower) ||
                (cita.persona?.apellido?.toLowerCase() || "").includes(searchTermLower) ||
                (cita.profesion?.nombre?.toLowerCase() || "").includes(searchTermLower) ||
                (cita.profesion?.apellido?.toLowerCase() || "").includes(searchTermLower)
            );
        });
    }, [citas, searchTerm]);

    const paginatedCitas = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCitas.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCitas, currentPage]);

    const totalPages = Math.ceil(filteredCitas.length / itemsPerPage);

    const handleEdit = (cita: Cita) => {
        setCitaToEdit(cita);
        setIsModalOpen(true);
    };

    const handleView = (cita: Cita) => {
        setCitaToView(cita);
        setIsViewModalOpen(true);
    };

    const handleDelete = async () => {
        if (citaToDelete !== null) {
            try {
                console.log("Cita a eliminar", citaToDelete);
                await deleteCita(citaToDelete);
                setCitas(citas.filter((cita) => cita.cod_cita !== citaToDelete));
                toast.success("Cita eliminada exitosamente");
                setIsDeleteModalOpen(false);
            } catch (error) {
                console.error("Error al eliminar la cita", error);
                toast.error("Error al eliminar la cita");
            }
        }
    };

    const exportToCSV = () => {
        const headers = ["Fecha y Hora", "Lugar", "Motivo", "Paciente", "Profesional"];
        const csvContent = [
            headers.join(","),
            ...filteredCitas.map((cita) =>
                [
                    formatDateTime(cita.fechahora),
                    cita.lugar,
                    cita.motivo,
                    `${cita.persona?.nombre || ""} ${cita.persona?.apellido || ""}`,
                    `${cita.profesion?.nombre || ""} ${cita.profesion?.apellido || ""}`,
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "citas.csv";
        link.click();
    };

    useEffect(() => {
        fetchCitas();
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
                        Gestión de Citas Médicas
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            {isLoading ? (
                                <BiLoaderAlt className="inline animate-spin ml-2" />
                            ) : (
                                `(${filteredCitas.length} citas)`
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
                        <FaPlus />
                        Nueva Cita
                    </motion.button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative flex-1 mr-6">
                            <input
                                type="text"
                                placeholder="Buscar citas..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#020659] focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={isLoading}
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-[#C4E5F2] text-[#035AA6] rounded-lg hover:bg-[#5FAAD9] hover:text-white transition-colors duration-300"
                            disabled={isLoading || filteredCitas.length === 0}
                        >
                            <FaDownload />
                            Exportar CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-[#C4E5F2] text-[#035AA6]">
                                    <th className="px-6 py-3 text-left">Fecha y Hora</th>
                                    <th className="px-6 py-3 text-left">Lugar</th>
                                    <th className="px-6 py-3 text-left">Motivo</th>
                                    <th className="px-6 py-3 text-left">Paciente</th>
                                    <th className="px-6 py-3 text-left">Profesional</th>
                                    <th className="px-6 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            <BiLoaderAlt className="inline animate-spin text-4xl text-[#5FAAD9]" />
                                        </td>
                                    </tr>
                                ) : paginatedCitas.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-gray-500">
                                            No se encontraron citas
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCitas.map((cita) => (
                                        <tr key={cita.cod_cita} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">{formatDateTime(cita.fechahora)}</td>
                                            <td className="px-6 py-4">{cita.lugar}</td>
                                            <td className="px-6 py-4">
                                                {cita.motivo.length > 50 ? `${cita.motivo.substring(0, 50)}...` : cita.motivo}
                                            </td>
                                            <td className="px-6 py-4">
                                                {cita.persona?.nombre} {cita.persona?.apellido}
                                            </td>
                                            <td className="px-6 py-4">
                                                {cita.profesion?.nombre} {cita.profesion?.apellido}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleView(cita)}
                                                        className="p-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(cita)}
                                                        className="p-1 text-green-600 hover:text-green-800"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setCitaToDelete(cita.cod_cita);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="p-1 text-red-600 hover:text-red-800"
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded ${currentPage === page
                                            ? 'bg-[#5FAAD9] text-white'
                                            : 'bg-[#C4E5F2] text-[#035AA6] hover:bg-[#5FAAD9] hover:text-white'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <CitaModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setCitaToEdit(null);
                        }}
                        onSubmit={() => {
                            fetchCitas();
                            setIsModalOpen(false);
                            setCitaToEdit(null);
                        }}
                        cita={citaToEdit}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isViewModalOpen && (
                    <ViewCitaModal
                        isOpen={isViewModalOpen}
                        onClose={() => {
                            setIsViewModalOpen(false);
                            setCitaToView(null);
                        }}
                        cita={citaToView}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <ConfirmModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDelete}
                        title="Eliminar Cita"
                        message="¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer."
                    />
                )}
            </AnimatePresence>
        </MainLayout>
    );
};

export default CitasPage;