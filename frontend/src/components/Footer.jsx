import React from 'react';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-white/5 mt-20">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start">
                    <span className="text-xl font-bold tracking-tight mb-2">AutoML Pipeline</span>
                    <p className="text-gray-500 text-sm">© 2026 One-Click ML Inc. All rights reserved.</p>
                </div>

                <div className="flex gap-10 text-sm font-medium text-gray-400">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Contact Support</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
