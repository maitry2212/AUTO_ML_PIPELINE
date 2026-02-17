import React, { useEffect, useState } from 'react';
import { usePipeline } from '../context/PipelineContext';
import { getProjects, getProject, deleteProject } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Target, Calendar, Trash2, ChevronRight, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const { pipelineState, updateState, hydrateProject } = usePipeline();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const data = await getProjects();
            updateState({ projects: data });
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleLoadProject = async (id) => {
        setLoading(true);
        try {
            const data = await getProject(id);
            hydrateProject(data);
            navigate('/report'); // Usually users want to see the report/eda
        } catch (err) {
            console.error("Failed to load project:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Delete this workspace forever?")) {
            try {
                await deleteProject(id);
                fetchProjects();
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    return (
        <div className="w-80 h-full glass border-r border-white/10 flex flex-col hidden lg:flex">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                    <History size={18} />
                    <span className="text-sm font-bold uppercase tracking-widest">Workspace History</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {pipelineState.projects.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <Box className="mx-auto mb-4 text-gray-600" size={32} />
                        <p className="text-gray-500 text-sm italic">No history yet. Start your first pipeline to see sessions here.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {pipelineState.projects.map((project) => (
                            <motion.div
                                key={project.project_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => handleLoadProject(project.project_id)}
                                className={`group p-4 rounded-2xl border transition-all cursor-pointer relative ${pipelineState.projectId === project.project_id
                                        ? 'bg-primary/10 border-primary text-primary'
                                        : 'bg-white/5 border-white/5 hover:border-white/20 text-gray-400 hover:text-white'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold truncate pr-6">{project.dataset_name}</h4>
                                    <button
                                        onClick={(e) => handleDelete(e, project.project_id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all absolute top-3 right-3"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-tighter opacity-70">
                                        <Target size={10} /> {project.task_type}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] opacity-50">
                                        <Calendar size={10} /> {new Date(project.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                {project.score && (
                                    <div className="mt-3 text-xs font-mono font-bold bg-white/5 rounded-lg py-1 px-2 inline-block">
                                        Score: {project.score.toFixed(4)}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <div className="p-4 bg-primary/5 border-t border-white/10">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2"
                >
                    New Workspace <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
