import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import Loader from '../components/Loader';
import ResultsCard from '../components/ResultsCard';
import { uploadDataset } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [phase, setPhase] = useState('upload'); // upload -> training -> results
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async (file) => {
        setPhase('training');
        setError(null);

        try {
            const data = await uploadDataset(file);
            setResults(data);
            setPhase('results');
        } catch (err) {
            console.error(err);
            setError("Failed to train the model. Please check the backend connection.");
            setPhase('upload');
        }
    };

    const handleReset = () => {
        setResults(null);
        setPhase('upload');
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 min-h-[600px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                {phase === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">Train Your Model</h2>
                            <p className="text-gray-400">Load your dataset to start the automated training pipeline.</p>
                        </div>

                        <FileUpload onUpload={handleUpload} isLoading={false} />

                        {error && (
                            <p className="text-red-400 text-center mt-6 bg-red-400/10 p-4 rounded-xl border border-red-400/20 max-w-md mx-auto">
                                {error}
                            </p>
                        )}
                    </motion.div>
                )}

                {phase === 'training' && (
                    <motion.div
                        key="training"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                    >
                        <Loader message="Synthesizing features and training optimal model..." />
                    </motion.div>
                )}

                {phase === 'results' && results && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full"
                    >
                        <ResultsCard results={results} onReset={handleReset} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
