
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
      case JobStatus.OPEN: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case JobStatus.CLOSED: return 'bg-rose-100 text-rose-800 border-rose-200';
      case JobStatus.ARCHIVED: return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusText = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OPEN: return 'เปิดรับสมัคร';
      case JobStatus.CLOSED: return 'ปิดรับแล้ว';
      case JobStatus.ARCHIVED: return 'เก็บถาวร';
      default: return status;
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(job.status)}`}>
              {getStatusText(job.status)}
            </span>
            <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">{job.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{job.department}</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(job)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              title="แก้ไขข้อมูล"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(job.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="ลบออกจากระบบ"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed h-10">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            {job.type}
          </span>
          {job.salaryRange && (
            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              {job.salaryRange}
            </span>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-[10px] font-medium">
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
          {job.status === JobStatus.OPEN && (
             <button
              onClick={() => onArchive(job.id)}
              className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-widest transition-colors"
            >
              ย้ายลงคลัง
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
