import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      <Navbar />

      <main>
        <AnimatePresence mode="wait">
          {currentPage === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LandingPage onGetStarted={() => setCurrentPage('dashboard')} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Universal Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}

export default App;
