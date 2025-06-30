import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, FileText } from 'lucide-react';
import { Project } from '@/app/hooks/useGetProjects';
import { backendApi } from '@/lib/backend-api';

interface EditProjectModalProps {
    open: boolean;
    onClose: () => void;
    project: Project;
    onSuccess: () => void;
}

export default function EditProjectModal({ open, onClose, project, onSuccess }: EditProjectModalProps) {
    const [form, setForm] = useState({
        name: '',
        description: '',
        status: 'ACTIVE' as 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED',
        priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        startDate: '',
        endDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const statusOptions = [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'PAUSED', label: 'Paused' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ];

    const priorityOptions = [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
        { value: 'CRITICAL', label: 'Critical' },
    ];

    // Initialize form with project data
    useEffect(() => {
        if (project && open) {
            setForm({
                name: project.name || '',
                description: project.description || '',
                status: project.status || 'ACTIVE',
                priority: project.priority || 'MEDIUM',
                startDate: project.startDate ? project.startDate.split('T')[0] : '',
                endDate: project.endDate ? project.endDate.split('T')[0] : '',
            });
            setError(null);
        }
    }, [project, open]);

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const projectData = {
                name: form.name,
                description: form.description || undefined,
                status: form.status,
                priority: form.priority,
                startDate: form.startDate || undefined,
                endDate: form.endDate || undefined,
            };

            await backendApi.updateProject(project.id, projectData);
            onSuccess();
            handleClose();
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Error updating project');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
                                Edit Project
                            </h3>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
                                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nom du projet */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Project Name *
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        placeholder="Ex: Kitchen renovation"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        name="description"
                                        id="description"
                                        rows={3}
                                        value={form.description}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        placeholder="Project description..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Status */}
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        <select
                                            name="status"
                                            id="status"
                                            value={form.status}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        >
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {form.status !== project.status && (
                                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                            ⚠️ Changing status will automatically recalculate importance scores
                                        </p>
                                    )}
                                </div>

                                {/* Priority */}
                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Priority
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Flag className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <select
                                            name="priority"
                                            id="priority"
                                            value={form.priority}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        >
                                            {priorityOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {form.priority !== project.priority && (
                                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                            ⚠️ Changing priority will automatically recalculate importance scores
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Start Date
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="startDate"
                                            id="startDate"
                                            value={form.startDate}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* End Date */}
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        End Date
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="endDate"
                                            id="endDate"
                                            value={form.endDate}
                                            onChange={handleChange}
                                            min={form.startDate || undefined}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Information sur le recalcul */}
                            {(form.status !== project.status || form.priority !== project.priority) && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                Automatic Score Recalculation
                                            </h3>
                                            <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                                                <p>
                                                    Status or priority changes will automatically trigger
                                                    importance score recalculation for all items in this project.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !form.name.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating...' : 'Update Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
