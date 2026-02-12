import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ message = "Processing..." }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12">
            <div className="relative w-20 h-20 mb-8">
                <motion.div
                    className="absolute inset-0 border-4 border-primary/20 rounded-full"
                />
                <motion.div
                    className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-4 h-4 bg-secondary rounded-full blur-sm" />
                </motion.div>
            </div>
            <p className="text-gray-400 font-medium animate-pulse">{message}</p>
        </div>
    );
};

export default Loader;
