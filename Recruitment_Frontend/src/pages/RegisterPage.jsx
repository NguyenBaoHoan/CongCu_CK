import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (formData) => {
        setLoading(true);
        setError('');

        try {
            await authService.register(formData);
            // Redirect về login sau khi đăng ký thành công
            navigate('/login', {
                state: { message: 'Registration successful! Please login.' }
            });
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join JobHunter today</p>
                </div>

                <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
            </div>
        </div>
    );
};

export default RegisterPage;