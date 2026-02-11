
import React, { useState, useEffect, useCallback } from 'react';
import { Job, JobInput, JobStatus } from './types';
import { dbService } from './services/dbService';
import JobCard from './components/JobCard';
import JobForm from './components/JobForm';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<JobStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDbExplorerOpen, setIsDbExplorerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>();
  const [viewMode, setViewMode] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const data = await dbService.getJobs();
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCreateOrUpdate = async (input: JobInput) => {
    if (editingJob) {
      await dbService.updateJob(editingJob.id, input);
    } else {
      await dbService.createJob(input);
    }
    setIsModalOpen(false);
    setEditingJob(undefined);
    fetchJobs();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      await dbService.deleteJob(id);
      fetchJobs();
    }
  };

  const handleArchive = async (id: string) => {
    await dbService.archiveJob(id);
    fetchJobs();
  };

  const handleResetDb = async () => {
    if (window.confirm('This will delete all current data and restore mock data. Continue?')) {
      localStorage.removeItem('careerhub_internal_jobs');
      await fetchJobs();
      setIsDbExplorerOpen(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'ALL' || job.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">CareerHub <span className="text-indigo-600">Internal</span></h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode(prev => prev === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN')}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 px-3 py-1.5 rounded-full transition-colors hidden sm:block"
              >
                Switch to {viewMode === 'ADMIN' ? 'Employee View' : 'Admin View'}
              </button>
              {viewMode === 'ADMIN' && (
                <button
                  onClick={() => { setEditingJob(undefined); setIsModalOpen(true); }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Post Job
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {viewMode === 'ADMIN' ? 'Job Management Dashboard' : 'Open Internal Positions'}
              </h2>
              <p className="text-slate-500 mt-1">
                {viewMode === 'ADMIN' ? 'Manage and monitor all internal recruitment activities.' : 'Discover your next career move within our organization.'}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search jobs or teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full md:w-64 transition-all"
                />
                <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-6 flex border-b border-slate-200">
             {['ALL', ...Object.values(JobStatus)].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab === 'ALL' ? 'All Postings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No jobs match your criteria</h3>
            <p className="mt-1 text-sm text-slate-500">Try changing your filters or searching for something else.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer & DB Explorer Trigger */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© 2024 CareerHub Internal Portal. Built for high-efficiency teams.</p>
          <div className="flex gap-4 items-center">
             <button 
              onClick={() => setIsDbExplorerOpen(true)}
              className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              View Database
            </button>
            <span className="hidden md:inline">|</span>
            <p>AI optimization enabled</p>
          </div>
        </div>
      </footer>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingJob ? 'Edit Position' : 'Create New Position'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6">
                <JobForm
                  initialData={editingJob}
                  onSubmit={handleCreateOrUpdate}
                  onCancel={() => setIsModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Explorer Modal */}
      {isDbExplorerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsDbExplorerOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-indigo-900 text-white">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                    LocalStorage Data Viewer
                  </h3>
                  <p className="text-indigo-200 text-xs mt-1">Raw JSON representation of 'careerhub_internal_jobs'</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleResetDb}
                    className="px-3 py-1.5 text-xs font-bold bg-red-500 hover:bg-red-600 rounded transition-colors uppercase"
                  >
                    Reset DB
                  </button>
                  <button onClick={() => setIsDbExplorerOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <div className="flex-grow overflow-auto p-0 bg-slate-900 text-green-400 font-mono text-sm leading-relaxed">
                <pre className="p-6">
                  {JSON.stringify(jobs, null, 2)}
                </pre>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-slate-500 text-xs text-center italic">
                This data is stored locally in your browser session.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
