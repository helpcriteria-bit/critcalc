import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/Auth/AuthModal';
import Home from './pages/Home/Home';
import CanvasPage from './pages/Canvas/CanvasPage';
import CanvasDashboard from './pages/Dashboard/CanvasDashboard';
import CalculatorPage from './pages/Calculator/CalculatorPage';
import TutorPage from './pages/Tutor/TutorPage';

function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Navbar />
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/my-canvases" element={<CanvasDashboard />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/tutor" element={<TutorPage />} />
        </Routes>
      </main>
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
