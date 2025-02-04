import { useState, useEffect } from 'react';
import StudentAttendance from './StudentAttendance';

const StudentAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [studentData, setStudentData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        roll_number: '',
        password: ''
    });

    useEffect(() => {
        const storedStudentInfo = localStorage.getItem('studentInfo');
        if (storedStudentInfo) {
            setStudentData(JSON.parse(storedStudentInfo));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const endpoint = isLogin
            ? 'http://localhost:8000/student/login'
            : 'http://localhost:8000/student/signup';

        const payload = isLogin
            ? { roll_number: formData.roll_number, password: formData.password }
            : formData;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    const studentInfo = {
                        student_id: data.student_id,
                        name: data.name,
                        roll_number: data.roll_number,
                    };

                    localStorage.setItem('studentInfo', JSON.stringify(studentInfo));
                    setStudentData(studentInfo);
                    setSuccess('Login successful!');
                } else {
                    setSuccess('Signup successful!');
                }
            } else {
                setError(data.message || 'An error occurred');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('studentInfo');
        setStudentData(null);
    };

    if (studentData) {
        return <StudentAttendance studentData={studentData} onLogout={handleLogout} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Student Login' : 'Student Signup'}</h2>
                    <p className="text-gray-600">
                        {isLogin ? 'Welcome back! Please login to continue.' : 'Create your student account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Roll Number</label>
                        <input
                            type="text"
                            name="roll_number"
                            value={formData.roll_number}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="w-full text-sm text-gray-600 hover:text-gray-800"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentAuth;