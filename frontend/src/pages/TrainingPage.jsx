import React, { useEffect, useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import { trainModel, getModelSuggestions } from '../services/api';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';
import { Cpu, Zap, Clock, Database, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrainingPage = () => {
    const { pipelineState, updateState } = usePipeline();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (pipelineState.suggestions.length > 0 || !pipelineState.task) return;
            try {
                const data = await getModelSuggestions();
                updateState({ suggestions: data.suggestions });
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
            }
        };
        fetchSuggestions();
    }, [pipelineState.task, pipelineState.suggestions.length]);

    const handleTrain = async (modelId) => {
        setLoading(true);
        updateState({ selectedModel: modelId });
        try {
            const result = await trainModel(modelId);
            updateState({ trainingResults: result });
            // Artificial delay for smooth UX
            setTimeout(() => navigate('/report'), 1000);
        } catch (err) {
            console.error("Training Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="py-20"><Loader message={`Fine-tuning ${pipelineState.selectedModel?.replace('_', ' ')}...`} /></div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">Model Construction</h1>
                <p className="text-gray-400">Select an optimized candidate for your {pipelineState.task} task.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pipelineState.suggestions.map((m) => (
                    <motion.button
                        key={m.id}
                        whileHover={{ y: -5 }}
                        onClick={() => handleTrain(m.id)}
                        className={`glass p-8 rounded-[2rem] text-left border border-white/10 hover:border-primary/50 transition-all group ${pipelineState.selectedModel === m.id ? 'border-primary bg-primary/5' : ''
                            }`}
                    >
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Cpu className="text-primary w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{m.name}</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">{m.reason}</p>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Settings size={14} /> Hyperparameters: Auto-tuned
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Database size={14} /> Cross-Validation: K-Fold (5)
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                            Initialize Training <Zap size={18} fill="currentColor" />
                        </div>
                    </motion.button>
                ))}
            </div>

            {pipelineState.trainingResults && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-16 glass p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto text-center"
                >
                    <h2 className="text-2xl font-bold mb-6">Last Run Statistics</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-2">
                                <Clock className="text-green-400" />
                            </div>
                            <span className="text-xs text-gray-500 mb-1">Duration</span>
                            <span className="text-xl font-bold font-mono">{pipelineState.trainingResults.duration.toFixed(2)}s</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-2">
                                <Zap className="text-blue-400" />
                            </div>
                            <span className="text-xs text-gray-500 mb-1">Best Score</span>
                            <span className="text-xl font-bold font-mono">
                                {Object.values(pipelineState.trainingResults.metrics)[0].toFixed(4)}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default TrainingPage;
