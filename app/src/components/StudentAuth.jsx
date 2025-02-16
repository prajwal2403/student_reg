import React, { useState } from 'react';
import { Lock, UserPlus, LogIn, User, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentAuth = ({ onLoginSuccess }) => {
    console.log("StudentAuth rendering"); // Debug log

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        roll_number: '',
        password: '',
        name: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted", formData); // Debug log
        setLoading(true);

        try {
            const endpoint = isLogin ? '/token' : '/register/student';
            console.log("Submitting to endpoint:", endpoint); // Debug log

            const body = isLogin
                ? new URLSearchParams({
                    username: formData.roll_number,
                    password: formData.password
                })
                : JSON.stringify({
                    roll_number: formData.roll_number,
                    password: formData.password,
                    name: formData.name
                });

            const headers = isLogin
                ? { 'Content-Type': 'application/x-www-form-urlencoded' }
                : { 'Content-Type': 'application/json' };

            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: isLogin ? body.toString() : body,
            });

            const data = await response.json();
            console.log("Response data:", data); // Debug log

            if (!response.ok) throw new Error(data.detail || 'Authentication failed');

            if (isLogin) {
                localStorage.setItem('auth_token', data.access_token);
                localStorage.setItem('user_role', 'student');
                onLoginSuccess(data);
                toast.success('Login successful!');
            } else {
                toast.success('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (error) {
            console.error("Auth error:", error); // Debug log
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Add a visual test element
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        {isLogin ? 'Student Sign In' : 'Student Registration'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-1 font-medium text-purple-600 hover:text-purple-500"
                        >
                            {isLogin ? 'Register here' : 'Sign in'}
                        </button>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="sr-only">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="roll_number" className="sr-only">Roll Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="roll_number"
                                    name="roll_number"
                                    type="text"
                                    required
                                    value={formData.roll_number}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                    placeholder="Roll Number"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                        </span>
                        {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Register')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentAuth;