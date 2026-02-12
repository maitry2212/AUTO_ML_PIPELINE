import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = ({ onGetStarted }) => {
    return (
        <div className="relative pt-32 pb-20 px-6 overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/20 rounded-full blur-[128px] -z-10" />
            <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] -z-10" />

            <div className="max-w-5xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-sm mb-6">
                        <Sparkles size={14} />
                        <span>AI-Powered Automation</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
                        One-Click ML <br />
                        <span className="gradient-text">Pipeline Builder</span>
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        Automate your machine learning workflow from data preprocessing to model training and evaluation. Just upload your dataset and let AI do the rest.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onGetStarted}
                            className="btn-primary flex items-center gap-2"
                        >
                            Upload Dataset <ArrowRight size={18} />
                        </button>
                        <button className="px-8 py-3 rounded-full hover:bg-white/5 transition-all text-white font-medium border border-white/10">
                            How it works
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;
