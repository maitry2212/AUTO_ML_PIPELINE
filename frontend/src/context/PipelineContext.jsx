import React, { createContext, useContext, useState } from 'react';

const PipelineContext = createContext();

export const PipelineProvider = ({ children }) => {
    const [pipelineState, setPipelineState] = useState({
        projectId: null,
        file: null,
        task: '',
        target: '',
        suggestions: [],
        selectedModel: null,
        edaData: null,
        trainingResults: null,
        projects: [],
    });

    const updateState = (newState) => {
        setPipelineState((prev) => ({ ...prev, ...newState }));
    };

    const hydrateProject = (projectData) => {
        const { metadata, eda_data, training_results } = projectData;
        setPipelineState((prev) => ({
            ...prev,
            projectId: metadata.project_id,
            task: metadata.task_type,
            target: metadata.target,
            edaData: eda_data,
            trainingResults: training_results,
            selectedModel: training_results?.model_id || null,
        }));
    };

    const resetPipeline = () => {
        setPipelineState((prev) => ({
            ...prev,
            projectId: null,
            file: null,
            task: '',
            target: '',
            suggestions: [],
            selectedModel: null,
            edaData: null,
            trainingResults: null,
        }));
    };

    return (
        <PipelineContext.Provider value={{ pipelineState, updateState, resetPipeline, hydrateProject }}>
            {children}
        </PipelineContext.Provider>
    );
};

export const usePipeline = () => {
    const context = useContext(PipelineContext);
    if (!context) {
        throw new Error('usePipeline must be used within a PipelineProvider');
    }
    return context;
};
