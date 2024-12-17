import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

const DashboardPage = () => {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token || !user) {
            window.location.href = "/login";
            return;
        }
        setUserData(JSON.parse(user));
    }, []);

    if (!userData) {
        return <div>Cargando...</div>;
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-16">
            <h2 className="text-3xl font-semibold text-center text-pastel-red mb-6">
                Bienvenido, {userData.nombre}
            </h2>

            <div className="mb-4">
                <h3 className="text-xl font-medium text-gray-700">Detalles del usuario</h3>
                <p><strong>Correo electrónico:</strong> {userData.email}</p>
                <p><strong>Rol:</strong> {userData.rol}</p>
                <p><strong>Estado:</strong> {userData.estado ? "Activo" : "Inactivo"}</p>
            </div>

            <div className="mb-4">
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "/login"; // Cerrar sesión
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
        </MainLayout>
        
    );
};

export default DashboardPage;
