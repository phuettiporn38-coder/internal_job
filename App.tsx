
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
  const [dbViewFormat, setDbViewFormat] = useState<'JSON' | 'TABLE'>('TABLE');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dbService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCreateOrUpdate = async (input: JobInput) => {
    try {
      if (editingJob) {
        await dbService.updateJob(editingJob.id, input);
      } else {
        await dbService.createJob(input);
      }
      setIsModalOpen(false);
      setEditingJob(undefined);
      await fetchJobs();
    } catch (error) {
      alert('ไม่สามารถบันทึกข้อมูลได้: ' + error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประกาศงานนี้ออกจากฐานข้อมูล?')) {
      await dbService.deleteJob(id);
      await fetchJobs();
    }
  };

  const handleArchive = async (id: string) => {
    await dbService.archiveJob(id);
    await fetchJobs();
  };

  const handleResetDb = async () => {
    if (window.confirm('ยืนยันการล้างฐานข้อมูล? ข้อมูลทั้งหมดจะถูกแทนที่ด้วยข้อมูลตัวอย่างเริ่มต้น')) {
      localStorage.removeItem('careerhub_internal_jobs');
      await fetchJobs();
      setIsDbExplorerOpen(false);
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(jobs, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `internal_jobs_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('ไม่สามารถดาวน์โหลดไฟล์ได้: ' + error);
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

  const translateStatus = (status: string) => {
    switch(status) {
      case 'ALL': return 'งานทั้งหมด';
      case JobStatus.OPEN: return 'กำลังเปิดรับ';
      case JobStatus.CLOSED: return 'ปิดรับแล้ว';
      case JobStatus.ARCHIVED: return 'เก็บถาวร';
      default: return status;
    }
  }

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === JobStatus.OPEN).length,
    closed: jobs.filter(j => j.status !== JobStatus.OPEN).length
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-emerald-200 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Internal Job Board</h1>
            </div>
            
            <button
              onClick={() => { setEditingJob(undefined); setIsModalOpen(true); }}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              เพิ่มประกาศงาน
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Summary */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm"><svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
              <div>
                <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">ทั้งหมด</p>
                <h3 className="text-2xl font-bold text-emerald-900">{stats.total} รายการ</h3>
              </div>
            </div>
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
              <div>
                <p className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">เปิดรับสมัคร</p>
                <h3 className="text-2xl font-bold text-blue-900">{stats.open} ตำแหน่ง</h3>
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm"><svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">ปิดรับแล้ว</p>
                <h3 className="text-2xl font-bold text-slate-700">{stats.closed} ตำแหน่ง</h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative group w-full md:w-96">
              <input
                type="text"
                placeholder="ค้นหาชื่อตำแหน่งงานหรือแผนก..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
              />
              <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              {['ALL', ...Object.values(JobStatus)].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === tab 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {translateStatus(tab)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
            <p className="text-slate-400 text-sm font-medium">กำลังเตรียมข้อมูล...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">ไม่มีประกาศงานในหมวดหมู่นี้</h3>
            <p className="text-slate-500 mt-1 mb-8">ลองเปลี่ยนตัวกรองหรือเพิ่มประกาศงานใหม่เข้าระบบ</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
            >
              + เพิ่มงานใหม่
            </button>
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2024 Internal Job Board • Enterprise Recruiting System</p>
          <div className="flex gap-4">
             <button 
              onClick={() => setIsDbExplorerOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              ระบบฐานข้อมูล
            </button>
          </div>
        </div>
      </footer>

      {/* Forms & Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingJob ? 'แก้ไขข้อมูลงาน' : 'ลงประกาศงานใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <JobForm
                initialData={editingJob}
                onSubmit={handleCreateOrUpdate}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Explorer Modal */}
      {isDbExplorerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsDbExplorerOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  </div>
                  Database Console
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setDbViewFormat('TABLE')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dbViewFormat === 'TABLE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>รูปแบบตาราง</button>
                  <button onClick={() => setDbViewFormat('JSON')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dbViewFormat === 'JSON' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>JSON ดิบ</button>
                </div>
                <button onClick={handleExport} className="px-5 py-2 text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-all">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  สำรองข้อมูล (JSON)
                </button>
                <button onClick={handleResetDb} className="px-5 py-2 text-xs font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  รีเซ็ตระบบ
                </button>
                <button onClick={() => setIsDbExplorerOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-hidden bg-slate-50">
              {dbViewFormat === 'JSON' ? (
                <div className="h-full overflow-auto p-0 bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed">
                  <pre className="p-8">{JSON.stringify(jobs, null, 2)}</pre>
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead className="sticky top-0 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest z-10 border-b border-slate-200">
                      <tr>
                        <th className="px-8 py-5">UUID / ID</th>
                        <th className="px-8 py-5">ตำแหน่ง</th>
                        <th className="px-8 py-5">แผนก</th>
                        <th className="px-8 py-5">สถานะ</th>
                        <th className="px-8 py-5">วันที่สร้าง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobs.map(job => (
                        <tr key={job.id} className="hover:bg-emerald-50/30 transition-colors text-sm text-slate-600">
                          <td className="px-8 py-5 font-mono text-xs text-slate-400">{job.id}</td>
                          <td className="px-8 py-5 font-bold text-slate-900">{job.title}</td>
                          <td className="px-8 py-5">{job.department}</td>
                          <td className="px-8 py-5">
                             <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase border ${
                               job.status === JobStatus.OPEN ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                             }`}>
                              {job.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-slate-400 text-xs">{new Date(job.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-5 bg-white border-t border-slate-200 flex justify-between items-center text-slate-400 text-[9px] uppercase font-bold tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Storage Engine: Active (LocalStorage)
              </span>
              <span>Total Documents: {jobs.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
