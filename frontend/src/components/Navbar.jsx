import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, LayoutDashboard, BarChart2, Zap, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { usePipeline } from '../context/PipelineContext';

const Navbar = () => {
    const location = useLocation();
    const { pipelineState } = usePipeline();
    const isDataLoaded = !!pipelineState.suggestions.length;
    const isTrained = !!pipelineState.trainingResults;

    const navLinks = [
        { name: 'Upload', path: '/dashboard', icon: LayoutDashboard, enabled: true },
        { name: 'EDA', path: '/eda', icon: BarChart2, enabled: isDataLoaded },
        { name: 'Training', path: '/train', icon: Zap, enabled: isDataLoaded },
        { name: 'Report', path: '/report', icon: FileText, enabled: isTrained },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex justify-between items-center mx-6 mt-6 rounded-2xl border border-white/10 shadow-lg">
            <Link to="/" className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                    <Cpu className="text-white w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight hidden sm:inline">AlgoNova ML</span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-6 bg-white/5 p-1 rounded-xl">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        to={link.enabled ? link.path : '#'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === link.path
                                ? 'bg-primary text-black'
                                : link.enabled
                                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                    : 'text-gray-600 cursor-not-allowed'
                            }`}
                        onClick={(e) => !link.enabled && e.preventDefault()}
                    >
                        <link.icon size={16} />
                        <span className="hidden md:inline">{link.name}</span>
                    </Link>
                ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
                <a href="#" className="text-xs text-gray-500 hover:text-white transition-all uppercase tracking-widest">Docs</a>
                <div className="w-px h-4 bg-white/10" />
                <button className="bg-white/10 text-xs px-4 py-2 rounded-lg border border-white/10 hover:bg-white/20 transition-all font-bold tracking-widest uppercase">
                    v2.0
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
