import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import EDAPage from './pages/EDAPage';
import TrainingPage from './pages/TrainingPage';
import ReportPage from './pages/ReportPage';
import { PipelineProvider } from './context/PipelineContext';
import { AnimatePresence } from 'framer-motion';

import Sidebar from './components/Sidebar';

function App() {
  return (
    <PipelineProvider>
      <Router>
        <div className="h-screen bg-background text-white selection:bg-primary/30 flex flex-col overflow-hidden">
          <Navbar />

          <div className="flex flex-1 pt-[100px] overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/eda" element={<EDAPage />} />
                <Route path="/train" element={<TrainingPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <Footer />
            </main>
          </div>

          {/* Universal Background Gradients */}
          <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
          </div>
        </div>
      </Router>
    </PipelineProvider>
  );
}

export default App;
