import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/Auth/AuthModal';

// Existing App Pages
import Home from './pages/Home/Home';
import CanvasPage from './pages/Canvas/CanvasPage';
import CanvasDashboard from './pages/Dashboard/CanvasDashboard';
import CalculatorPage from './pages/Calculator/CalculatorPage';
import TutorPage from './pages/Tutor/TutorPage';

// Dedicated SEO Landing Pages
import ScientificCalculatorLanding from './pages/LandingPages/ScientificCalculatorLanding';
import GeometryCalculatorLanding from './pages/LandingPages/GeometryCalculatorLanding';
import MathTutorLanding from './pages/LandingPages/MathTutorLanding';

// Educational Learning Guides
import LearnIndex from './pages/Learn/LearnIndex';
import AlgebraLesson from './pages/Learn/AlgebraLesson';
import GeometryLesson from './pages/Learn/GeometryLesson';
import TrigonometryLesson from './pages/Learn/TrigonometryLesson';
import CoordinateGeometryLesson from './pages/Learn/CoordinateGeometryLesson';

export function AppLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Navbar />
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Routes>
          {/* Core Application Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/my-canvases" element={<CanvasDashboard />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/tutor" element={<TutorPage />} />

          {/* Dedicated SEO Landing Pages */}
          <Route path="/scientific-calculator" element={<ScientificCalculatorLanding />} />
          <Route path="/geometry-calculator" element={<GeometryCalculatorLanding />} />
          <Route path="/math-tutor" element={<MathTutorLanding />} />

          {/* Educational Learning Pages */}
          <Route path="/learn" element={<LearnIndex />} />
          <Route path="/learn/algebra" element={<AlgebraLesson />} />
          <Route path="/learn/geometry" element={<GeometryLesson />} />
          <Route path="/learn/trigonometry" element={<TrigonometryLesson />} />
          <Route path="/learn/coordinate-geometry" element={<CoordinateGeometryLesson />} />
        </Routes>
      </main>
      <AuthModal />
    </div>
  );
}

export default function App({ Router = BrowserRouter, routerProps = {} }) {
  return (
    <AuthProvider>
      <AppProvider>
        <Router {...routerProps}>
          <AppLayout />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
