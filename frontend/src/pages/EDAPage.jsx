import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { usePipeline } from '../context/PipelineContext';
import { getEDA } from '../services/api';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EDAPage = () => {
    const { pipelineState, updateState } = usePipeline();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEDA = async () => {
            if (pipelineState.edaData) return;
            setLoading(true);
            try {
                const data = await getEDA();
                updateState({ edaData: data });
            } catch (err) {
                console.error("EDA Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEDA();
    }, []);

    if (loading) return <div className="py-20"><Loader message="Analyzing dataset characteristics..." /></div>;
    if (!pipelineState.edaData) return <div className="text-center py-20 text-gray-400">No EDA data available. Please upload a dataset first.</div>;

    const { missing_values, correlation_matrix, target_distribution } = pipelineState.edaData;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">Exploratory Data Analysis</h1>
                <p className="text-gray-400">Deep dive into your dataset distributions and relationships.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Missing Values */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 rounded-3xl border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="text-primary" />
                        <h2 className="text-xl font-bold">Missing Values</h2>
                    </div>
                    <Plot
                        data={missing_values.data}
                        layout={{
                            ...missing_values.layout,
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#fff' },
                            autosize: true,
                            margin: { t: 30, b: 40, l: 40, r: 20 }
                        }}
                        style={{ width: '100%', height: '350px' }}
                        useResizeHandler={true}
                    />
                </motion.div>

                {/* Correlation Matrix */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-8 rounded-3xl border border-white/10"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-secondary" />
                        <h2 className="text-xl font-bold">Feature Correlations</h2>
                    </div>
                    <Plot
                        data={correlation_matrix.data}
                        layout={{
                            ...correlation_matrix.layout,
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#fff' },
                            autosize: true,
                            margin: { t: 30, b: 40, l: 40, r: 20 }
                        }}
                        style={{ width: '100%', height: '350px' }}
                        useResizeHandler={true}
                    />
                </motion.div>

                {/* Target Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-8 rounded-3xl border border-white/10 lg:col-span-2"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <PieChart className="text-accent" />
                        <h2 className="text-xl font-bold">Target Distribution ({pipelineState.target})</h2>
                    </div>
                    <Plot
                        data={target_distribution.data}
                        layout={{
                            ...target_distribution.layout,
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            font: { color: '#fff' },
                            autosize: true
                        }}
                        style={{ width: '100%', height: '450px' }}
                        useResizeHandler={true}
                    />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-16 flex flex-col items-center gap-4 bg-primary/5 py-12 rounded-[2.5rem] border border-primary/20"
            >
                <h3 className="text-2xl font-bold">Insights Acquired?</h3>
                <p className="text-gray-400 mb-6">Your data is ready for model synthesis. Proceed to the training laboratory.</p>
                <button
                    onClick={() => navigate('/train')}
                    className="btn-primary px-12 py-4 text-lg font-bold flex items-center gap-3"
                >
                    Initialize Model Selection <Zap size={20} fill="currentColor" />
                </button>
            </motion.div>
        </div>
    );
};

export default EDAPage;
