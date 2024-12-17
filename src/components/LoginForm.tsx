import { useState } from 'react';
import { loginWithCredentials } from '../service/authService';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const LoginForm = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false); 
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await loginWithCredentials(email, password);
            const { token, user } = response;
            localStorage.setItem('token', token); 
            localStorage.setItem('user', JSON.stringify(user)); 
            navigate('/dashboard'); 
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg mt-16">
            <h2 className="text-3xl font-semibold text-center text-pastel-red mb-6">Iniciar sesión</h2>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                {/* Campo de email */}
                <div className="mb-4 flex items-center border border-gray-300 rounded-md">
                    <MdEmail className="w-6 h-6 text-gray-500 ml-3" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico"
                        className="w-full p-3 pl-12 text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-pastel-red"
                        required
                    />
                </div>

                <div className="mb-6 flex items-center border border-gray-300 rounded-md relative">
                    <MdLock className="w-6 h-6 text-gray-500 ml-3" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        className="w-full p-3 pl-12 text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-pastel-red"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-4 text-gray-500"
                    >
                        {showPassword ? <MdVisibilityOff className="w-6 h-6" /> : <MdVisibility className="w-6 h-6" />}
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-pastel-red text-white rounded-md hover:bg-red-500 transition-colors"
                >
                    Iniciar sesión
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
