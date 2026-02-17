import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const uploadDataset = async (file, taskType, targetColumn) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task_type', taskType);
    formData.append('target_column', targetColumn);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const getEDA = async () => {
    const response = await api.get('/eda');
    return response.data;
};

export const getModelSuggestions = async () => {
    const response = await api.get('/model-suggestions');
    return response.data;
};

export const trainModel = async (modelId) => {
    const response = await api.post(`/train?model_id=${modelId}`);
    return response.data;
};

export const promoteModel = async (modelId, version) => {
    const response = await api.post(`/promote?model_id=${modelId}&version=${version}`);
    return response.data;
};

export const getProjects = async () => {
    const response = await api.get('/projects');
    return response.data;
};

export const getProject = async (projectId) => {
    const response = await api.get(`/project/${projectId}`);
    return response.data;
};

export const deleteProject = async (projectId) => {
    const response = await api.delete(`/project/${projectId}`);
    return response.data;
};

export default api;
