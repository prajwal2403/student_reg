import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';
import jsQR from 'jsqr';

const StudentAttendance = ({ studentData, onLogout }) => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    // Add null check for studentData
    if (!studentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-600 text-center">
                    No student data available. Please log in again.
                </div>
            </div>
        );
    }

    const startScanning = async () => {
        setIsScanning(true);
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            setError('Camera access denied');
            setIsScanning(false);
        }
    };

    const scanQR = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                handleScan(code.data);
            }
        }
    };

    const handleScan = async (result) => {
        try {
            const response = await fetch('http://localhost:8000/attendance/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    qr_data: result,
                    student_id: studentData.student_id,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                setScanResult(result);
                setError('');
            } else {
                setError(data.message || 'Attendance recording failed');
                setScanResult(null);
            }
        } catch (err) {
            setError('Network error occurred');
            setScanResult(null);
        }
    };

    useEffect(() => {
        let intervalId;
        if (isScanning) {
            intervalId = setInterval(scanQR, 500);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isScanning]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        Welcome, {studentData.name}
                    </h2>
                    <button
                        onClick={onLogout}
                        className="text-red-600 hover:text-red-800"
                    >
                        Logout
                    </button>
                </div>
                <p className="text-center text-gray-600 mb-4">
                    Roll Number: {studentData.roll_number}
                </p>

                <div className="space-y-4">
                    {!isScanning ? (
                        <button
                            onClick={startScanning}
                            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                        >
                            <Camera className="mr-2" /> Start QR Scanning
                        </button>
                    ) : (
                        <div className="relative w-full h-64">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            <canvas
                                ref={canvasRef}
                                className="hidden"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center">
                            {success}
                        </div>
                    )}

                    {scanResult && (
                        <div className="text-gray-600 text-center">
                            Last scanned QR: {scanResult}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAttendance;