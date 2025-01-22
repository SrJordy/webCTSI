import { useState } from 'react';
import { loginWithCredentials } from '../service/authService';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { motion } from 'framer-motion'; 

const LoginForm = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await loginWithCredentials(email, password);
            const { token, user } = response;

            if (user.rol !== 'PROFESIONAL') {
                setError('Acceso denegado: solo los profesionales pueden ingresar.');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard');
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl"
            >
                {/* Header */}
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-center"
                    >
                        {/* Aquí puedes agregar tu logo */}
                        <div className="w-20 h-20 bg-[#C9E7F2] rounded-full flex items-center justify-center">
                            <MdLock className="w-10 h-10 text-white" />
                        </div>
                    </motion.div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Bienvenido de nuevo
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-500 p-4 rounded-lg text-sm flex items-center justify-center space-x-2"
                    >
                        <span className="flex-shrink-0">⚠️</span>
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div className="relative">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdEmail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pastel-red focus:border-transparent sm:text-sm"
                                    placeholder="ejemplo@correo.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MdLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pastel-red focus:border-transparent sm:text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <MdVisibility className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#C9E7F2] hover:bg-[#035AA6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pastel-red transition-colors ${
                            isLoading ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginForm;