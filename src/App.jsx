import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import AuthModal from './components/Auth/AuthModal';
import SEO from './components/SEO/SEO';

const routeLoaders = [
  () => import('./pages/Home/Home'),
  () => import('./pages/Canvas/CanvasPage'),
  () => import('./pages/Dashboard/CanvasDashboard'),
  () => import('./pages/Calculator/CalculatorPage'),
  () => import('./pages/Tutor/TutorPage'),
  () => import('./pages/LandingPages/ScientificCalculatorLanding'),
  () => import('./pages/LandingPages/GeometryCalculatorLanding'),
  () => import('./pages/LandingPages/MathTutorLanding'),
  () => import('./pages/Learn/LearnIndex'),
  () => import('./pages/Learn/AlgebraLesson'),
  () => import('./pages/Learn/GeometryLesson'),
  () => import('./pages/Learn/TrigonometryLesson'),
  () => import('./pages/Learn/CoordinateGeometryLesson')
];

const lazyRouteComponents = routeLoaders.map((load) => lazy(load));
let preloadedRouteComponents = null;

export async function preloadRouteModules() {
  const modules = await Promise.all(routeLoaders.map((load) => load()));
  preloadedRouteComponents = modules.map((module) => module.default);
}

function NotFound() {
  return (
    <section style={{ display: 'grid', placeContent: 'center', height: '100%', textAlign: 'center', gap: 12 }}>
      <SEO title="Page Not Found | CritCalc" robots="noindex, nofollow" />
      <h1>Page not found</h1>
      <p>The address may be incorrect, or the page may have moved.</p>
      <Link to="/">Return to CritCalc</Link>
    </section>
  );
}

export function AppLayout() {
  const [
    Home,
    CanvasPage,
    CanvasDashboard,
    CalculatorPage,
    TutorPage,
    ScientificCalculatorLanding,
    GeometryCalculatorLanding,
    MathTutorLanding,
    LearnIndex,
    AlgebraLesson,
    GeometryLesson,
    TrigonometryLesson,
    CoordinateGeometryLesson
  ] = preloadedRouteComponents || lazyRouteComponents;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Navbar />
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Suspense fallback={<div role="status" aria-live="polite" style={{ padding: 24 }}>Loading page…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/canvas" element={<CanvasPage />} />
            <Route path="/my-canvases" element={<CanvasDashboard />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/tutor" element={<TutorPage />} />
            <Route path="/scientific-calculator" element={<ScientificCalculatorLanding />} />
            <Route path="/geometry-calculator" element={<GeometryCalculatorLanding />} />
            <Route path="/math-tutor" element={<MathTutorLanding />} />
            <Route path="/learn" element={<LearnIndex />} />
            <Route path="/learn/algebra" element={<AlgebraLesson />} />
            <Route path="/learn/geometry" element={<GeometryLesson />} />
            <Route path="/learn/trigonometry" element={<TrigonometryLesson />} />
            <Route path="/learn/coordinate-geometry" element={<CoordinateGeometryLesson />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
