import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex justify-between items-center mx-6 mt-6 rounded-2xl">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
            >
                <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                    <Cpu className="text-white w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight">AutoML Pipeline</span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-8 text-sm font-medium text-gray-400"
            >
                <a href="#" className="hover:text-white transition-colors">Documentation</a>
                <a href="#" className="hover:text-white transition-colors">Github</a>
                <button className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg transition-all border border-white/10">
                    Support
                </button>
            </motion.div>
        </nav>
    );
};

export default Navbar;
