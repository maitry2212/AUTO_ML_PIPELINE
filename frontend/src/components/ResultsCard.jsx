import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, BarChart, Server, RefreshCw } from 'lucide-react';

const ResultsCard = ({ results, onReset }) => {
    const { task, score, message } = results;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto w-full glass rounded-[2rem] p-12 overflow-hidden relative"
        >
            {/* Success Banner */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />

            <div className="text-center mb-12">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle2 className="text-green-500 w-10 h-10" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">Training Successful</h2>
                <p className="text-gray-400">{message}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Task Type Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="bg-purple-500/20 p-4 rounded-xl">
                        <BarChart className="text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 uppercase tracking-wider">Model Task</p>
                        <p className="text-xl font-bold capitalize">{task}</p>
                    </div>
                </div>

                {/* Score Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="bg-blue-500/20 p-4 rounded-xl">
                        <TrendingUp className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 uppercase tracking-wider tracking-wider">Metric Score</p>
                        <p className="text-xl font-bold">{(score * 100).toFixed(2)}%</p>
                    </div>
                </div>
            </div>

            {/* Model Health Indicator */}
            <div className="glass rounded-2xl p-8 mb-12 flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-4">
                    <span className="text-gray-400 font-medium">Model Confidence</span>
                    <span className="font-bold text-primary">{(score * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                    onClick={onReset}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                >
                    <RefreshCw size={18} /> Retrain Model
                </button>
                <button className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                    Deploy to Prod
                </button>
            </div>
        </motion.div>
    );
};

export default ResultsCard;
