
import React, { useState, useEffect } from 'react';
import { Job, JobInput, JobType, JobStatus } from '../types';
import { polishJobDescription } from '../services/geminiService';

interface JobFormProps {
  initialData?: Job;
  onSubmit: (data: JobInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const JobForm: React.FC<JobFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState<JobInput>({
    title: '',
    department: '',
    location: '',
    type: JobType.FULL_TIME,
    description: '',
    requirements: [''],
    salaryRange: '',
    status: JobStatus.OPEN
  });

  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        department: initialData.department,
        location: initialData.location,
        type: initialData.type,
        description: initialData.description,
        requirements: initialData.requirements.length > 0 ? initialData.requirements : [''],
        salaryRange: initialData.salaryRange || '',
        status: initialData.status
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newReqs = [...formData.requirements];
    newReqs[index] = value;
    setFormData(prev => ({ ...prev, requirements: newReqs }));
  };

  const addRequirement = () => {
    setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }));
  };

  const handleAiPolish = async () => {
    if (!formData.description || !formData.title) return;
    setIsAiLoading(true);
    const polished = await polishJobDescription(formData.title, formData.description);
    setFormData(prev => ({ ...prev, description: polished }));
    setIsAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Job Title</label>
          <input
            required
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g. Senior Product Manager"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Department</label>
          <input
            required
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g. Engineering"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Location</label>
          <input
            required
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g. Remote"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Salary Range (Optional)</label>
          <input
            type="text"
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g. 50k - 80k"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-slate-700">Job Description</label>
          <button
            type="button"
            onClick={handleAiPolish}
            disabled={isAiLoading || !formData.description}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 flex items-center gap-1"
          >
            {isAiLoading ? 'Polishing...' : '✨ Polish with AI'}
          </button>
        </div>
        <textarea
          required
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          placeholder="Describe the role..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Requirements</label>
        {formData.requirements.map((req, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              value={req}
              onChange={(e) => handleRequirementChange(idx, e.target.value)}
              className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder={`Requirement #${idx + 1}`}
            />
            {formData.requirements.length > 1 && (
              <button
                type="button"
                onClick={() => removeRequirement(idx)}
                className="text-red-500 hover:text-red-700 px-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addRequirement}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + Add Requirement
        </button>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Job Posting'}
        </button>
      </div>
    </form>
  );
};

export default JobForm;
