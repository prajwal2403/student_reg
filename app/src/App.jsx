import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StudentAuth from './components/StudentAuth';
import QRScanner from './components/QRScanner';

function App() {
  const isAuthenticated = !!localStorage.getItem('auth_token');
  console.log("Auth status:", isAuthenticated); // Debug log

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Toaster position="top-right" />
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/scanner" />
              ) : (
                <StudentAuth onLoginSuccess={(data) => {
                  console.log("Login success:", data); // Debug log
                  window.location.href = '/scanner';
                }} />
              )
            }
          />
          <Route
            path="/scanner"
            element={
              isAuthenticated ? (
                <QRScanner />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;