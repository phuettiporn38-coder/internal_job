
import React from 'react';
import { Job, JobStatus } from '../types';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete, onArchive }) => {
  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OPEN: return 'bg-green-100 text-green-800';
      case JobStatus.CLOSED: return 'bg-red-100 text-red-800';
      case JobStatus.ARCHIVED: return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
            <h3 className="mt-2 text-xl font-bold text-slate-900">{job.title}</h3>
            <p className="text-sm text-slate-500">{job.department} • {job.location}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(job)}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              title="Edit Job"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Delete Job"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
            {job.type}
          </span>
          {job.salaryRange && (
            <span className="bg-slate-50 text-slate-700 px-2 py-1 rounded text-xs font-medium">
              💰 {job.salaryRange}
            </span>
          )}
        </div>

        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </span>
          {job.status === JobStatus.OPEN && (
             <button
              onClick={() => onArchive(job.id)}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 uppercase tracking-wider"
            >
              Archive
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
