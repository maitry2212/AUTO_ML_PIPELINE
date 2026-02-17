import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import { usePipeline } from '../context/PipelineContext';
import { uploadDataset, getModelSuggestions, getProjects } from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const Dashboard = () => {
    const { updateState } = usePipeline();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleUpload = async (file, taskType, targetColumn) => {
        setLoading(true);
        setError(null);
        try {
            const uploadRes = await uploadDataset(file, taskType, targetColumn);
            const suggestionData = await getModelSuggestions();
            const projectsData = await getProjects();

            updateState({
                projectId: uploadRes.project_id,
                file: file,
                task: taskType,
                target: targetColumn,
                suggestions: suggestionData.suggestions,
                projects: projectsData,
                edaData: null,
                trainingResults: null
            });

            navigate('/eda'); // Start with EDA page
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Upload failed. Please check the backend connection.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="py-20"><Loader message="Feeding data to the pipeline..." /></div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 min-h-[600px] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <div className="text-center mb-12">
                    <h2 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        Initiate Pipeline
                    </h2>
                    <p className="text-gray-400 text-lg">Load your dataset and watch the magic happen.</p>
                </div>

                <FileUpload onUpload={handleUpload} isLoading={false} />

                {error && (
                    <p className="text-red-400 text-center mt-8 bg-red-400/10 p-4 border border-red-400/20 rounded-2xl max-w-md mx-auto">
                        {error}
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
