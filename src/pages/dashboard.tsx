import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import { 
    MdPerson, 
    MdEmail, 
    MdSecurity, 
    MdCheckCircle,
    MdExitToApp
} from "react-icons/md";

interface UserData {
    nombre: string;
    email: string;
    rol: string;
    estado: boolean;
}

const DashboardPage = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
            window.location.href = "/login";
            return;
        }
        setUserData(JSON.parse(user));
        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#020659]"></div>
                </div>
            </MainLayout>
        );
    }


    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* Header Section */}
                <div className="bg-gradient-to-r from-[#5FAAD9] to-[#035AA6] rounded-2xl p-8 mb-8 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                Bienvenido, {userData?.nombre}
                            </h1>
                            <p className="text-white font-semibold">
                                Panel de Control | {userData?.rol}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="flex items-center space-x-2 bg-white text-[#5FAAD9] px-4 py-2 rounded-lg hover:bg-[#C9E7F2] transition-colors"
                        >
                            <MdExitToApp className="text-xl" />
                            <span>Cerrar sesión</span>
                        </motion.button>
                    </div>
                </div>

                
                {/* User Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl p-8 shadow-md"
                >
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        Información del Usuario
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-[#5FAAD9] p-3 rounded-lg">
                                <MdPerson className="text-2xl text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="font-medium text-gray-800">{userData?.nombre}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-[#5FAAD9] p-3 rounded-lg">
                                <MdEmail className="text-2xl text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-800">{userData?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-[#5FAAD9] p-3 rounded-lg">
                                <MdSecurity className="text-2xl text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Rol</p>
                                <p className="font-medium text-gray-800">{userData?.rol}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-[#5FAAD9] p-3 rounded-lg">
                                <MdCheckCircle className="text-2xl text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Estado</p>
                                <p className="font-medium text-gray-800">
                                    {userData?.estado ? (
                                        <span className="text-green-500">Activo</span>
                                    ) : (
                                        <span className="text-red-500">Inactivo</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </MainLayout>
    );
};

export default DashboardPage;