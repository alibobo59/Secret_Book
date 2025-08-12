import {React,  useState} from '../../services/authService';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Email không hợp lệ');
            return;
        }

        setLoading(true);
        
        try {
            const response = await authService.forgotPassword(email);
            setSuccess(response.message);
            setEmailSent(true);
        } catch (error) {
            setError(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="mt-6 text-3xl font-serif font-bold text-gray-800 dark:text-white">
                        Email đã được gửi!
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong className="text-amber-600 dark:text-amber-500">{email}</strong>.
                        Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                    </p>
                    <div className="mt-6 space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Không nhận được email? Kiểm tra thư mục spam hoặc
                        </p>
                        <button
                            onClick={() => {
                                setEmailSent(false);
                                setEmail('');
                                setError('');
                                setSuccess('');
                            }}
                            className="text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 text-sm font-medium transition-colors"
                        >
                            Gửi lại email
                        </button>
                    </div>
                    <div className="mt-8">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 text-sm font-medium transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-white">
                        Quên mật khẩu?
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                    </p>
                </div>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">{error}</span>
                    </motion.div>
                )}
                
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">{success}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Địa chỉ email
                        </label>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Nhập email của bạn"
                                disabled={loading}
                            />
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-amber-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Mail className="h-5 w-5 mr-2" />
                                Gửi link đặt lại mật khẩu
                            </>
                        )}
                    </button>

                </form>

                <div className="text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Quay lại đăng nhập
                    </Link>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Hoặc
                        </span>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Chưa có tài khoản?{' '}
                    <Link
                        to="/register"
                        className="font-medium text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    >
                        Đăng ký ngay
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;