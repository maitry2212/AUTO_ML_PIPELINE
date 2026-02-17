import React from 'react';
import HeroSection from '../components/HeroSection';
import { Zap, Shield, BarChart3, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="glass p-8 rounded-3xl hover:bg-white/10 transition-all duration-300">
        <div className="bg-primary/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Icon className="text-primary w-6 h-6" />
        </div>
        <h4 className="text-xl font-bold mb-3">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div>
            <HeroSection onGetStarted={() => navigate('/dashboard')} />

            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={Zap}
                        title="Hyper-Fast Training"
                        desc="Optimized algorithms that deliver results in seconds, not hours."
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Secure Processing"
                        desc="Your data is processed locally and never leaves your control."
                    />
                    <FeatureCard
                        icon={BarChart3}
                        title="Deep Insights"
                        desc="Comprehensive metrics and visualizations for every model trained."
                    />
                    <FeatureCard
                        icon={Cloud}
                        title="Cloud Deployment"
                        desc="One-click deployment to production-ready environments."
                    />
                </div>
            </div>

            {/* Social Proof / Stats */}
            <div className="py-24 bg-white/5 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <div>
                        <p className="text-4xl font-bold mb-2">10k+</p>
                        <p className="text-gray-500 uppercase tracking-widest text-xs">Models Trained</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold mb-2">99.9%</p>
                        <p className="text-gray-500 uppercase tracking-widest text-xs">Uptime</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold mb-2">25ms</p>
                        <p className="text-gray-500 uppercase tracking-widest text-xs">Inference Time</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold mb-2">50+</p>
                        <p className="text-gray-500 uppercase tracking-widest text-xs">Integrations</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
