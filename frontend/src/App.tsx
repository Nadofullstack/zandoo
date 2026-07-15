import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/connexion" element={<LoginPage />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/inscription" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
