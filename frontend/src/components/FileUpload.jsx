import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';

const FileUpload = ({ onUpload, isLoading }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (file) => {
        if (!file.name.endsWith('.csv')) {
            setError("Please upload a CSV file only.");
            return false;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError("File size should be less than 10MB.");
            return false;
        }
        setError(null);
        return true;
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
            }
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            }
        }
    };

    const removeFile = () => {
        setFile(null);
        setError(null);
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass rounded-3xl p-10 text-center border-2 border-dashed transition-all duration-300 ${dragActive ? 'border-primary bg-primary/5' : 'border-white/10'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {!file ? (
                    <>
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Upload className="text-primary w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Upload Dataset</h3>
                        <p className="text-gray-400 mb-8">Drag and drop your CSV file here, or click to browse</p>

                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".csv"
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <label
                            htmlFor="file-upload"
                            className={`btn-primary cursor-pointer inline-flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Choose File
                        </label>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl w-full border border-white/10 mb-8">
                            <div className="bg-primary/20 p-3 rounded-xl">
                                <FileText className="text-primary" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            {!isLoading && (
                                <button
                                    onClick={removeFile}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => onUpload(file)}
                            disabled={isLoading}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${isLoading
                                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-gray-200'
                                }`}
                        >
                            {isLoading ? (
                                <>Training in Progress...</>
                            ) : (
                                <>Start Pipeline</>
                            )}
                        </button>
                    </div>
                )}

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-6 flex items-center gap-2 text-red-400 justify-center text-sm"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default FileUpload;
