import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';

const QRScanner = () => {
    const [scanning, setScanning] = useState(true);
    const [scannedData, setScannedData] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
        }

        const startScanner = async () => {
            if (!scanning) return;

            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }

                await scannerRef.current.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    async (decodedText) => {
                        if (scanning) {
                            setScanning(false);
                            try {
                                await scannerRef.current.stop();
                                setScannedData(decodedText);
                            } catch (err) {
                                console.error('Error handling scan:', err);
                                toast.error('Error processing scan');
                                setScanning(true);
                            }
                        }
                    },
                    (error) => {
                        if (error?.message?.includes('NotFoundError')) {
                            console.error('Camera error:', error);
                            toast.error('Camera not found or permission denied');
                        }
                    }
                );
            } catch (err) {
                console.error('Scanner error:', err);
                toast.error('Error accessing camera: ' + err.message);
                setScanning(true);
            }
        };

        const timeoutId = setTimeout(() => {
            if (scanning) {
                startScanner();
            }
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(err => {
                    console.error('Failed to stop scanner:', err);
                });
            }
        };
    }, [scanning]);

    const handleSubmitAttendance = async () => {
        if (!scannedData) return;

        try {
            const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            };

            const location = await Promise.race([
                new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        position => resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }),
                        reject
                    );
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Location timeout')), 10000)
                )
            ]).catch(err => {
                console.warn('Location error:', err);
                return null;
            });

            localStorage.setItem('current_lecture_id', scannedData);

            const requestBody = {
                lecture_id: scannedData,
                device_info: deviceInfo
            };

            if (location) {
                requestBody.location = location;
            }

            const response = await fetch('http://localhost:8000/attendance/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.detail || 'Failed to mark attendance');
            }

            const result = await response.json();
            setSuccessData({
                subject: result.subject,
                timestamp: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString()
            });
            setScannedData(null);
            toast.success('Attendance marked successfully!');
        } catch (error) {
            console.error('Attendance marking error:', error);
            toast.error(error.message || 'Failed to mark attendance');
        }
    };

    const resetScanner = () => {
        setSuccessData(null);
        setScannedData(null);
        setScanning(true);
    };

    if (successData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Attendance Marked Successfully!</h2>
                        <div className="bg-gray-50 rounded-lg p-4 mt-4">
                            <p className="text-gray-600 mb-2">
                                <span className="font-semibold">Subject:</span> {successData.subject}
                            </p>
                            <p className="text-gray-600 mb-2">
                                <span className="font-semibold">Time:</span> {successData.timestamp}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold">Date:</span> {successData.date}
                            </p>
                        </div>
                        <button
                            onClick={resetScanner}
                            className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            Scan Another Code
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Scan Attendance QR Code
                    </h2>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="relative">
                        <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
                    </div>
                    <p className="text-center text-gray-600">
                        {scanning
                            ? 'Position the QR code within the frame to mark your attendance'
                            : 'QR code scanned successfully!'
                        }
                    </p>
                    {scannedData && (
                        <div className="space-y-4">
                            <button
                                onClick={handleSubmitAttendance}
                                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Mark Attendance
                            </button>
                            <button
                                onClick={resetScanner}
                                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                                Scan Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRScanner;