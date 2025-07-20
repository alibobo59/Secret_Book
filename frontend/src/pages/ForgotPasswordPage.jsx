import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Vui lòng nhập email');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Email không hợp lệ');
            return;
        }

        setLoading(true);
        
        try {
            const response = await authService.forgotPassword(email);
            toast.success(response.message);
            setEmailSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Email đã được gửi!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>.
                            Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                        </p>
                        <div className="mt-6 space-y-4">
                            <p className="text-xs text-gray-500">
                                Không nhận được email? Kiểm tra thư mục spam hoặc
                            </p>
                            <button
                                onClick={() => {
                                    setEmailSent(false);
                                    setEmail('');
                                }}
                                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                            >
                                Gửi lại email
                            </button>
                        </div>
                        <div className="mt-8">
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                            >
                                ← Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-blue-600 mb-2">📚 BookStore</h1>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Quên mật khẩu?
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="Nhập email của bạn"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang gửi...
                                </>
                            ) : (
                                'Gửi link đặt lại mật khẩu'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors duration-200"
                        >
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                </form>

                <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="text-center text-sm text-gray-600">
                        <p>Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;