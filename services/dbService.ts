
import { Job, JobStatus, JobType } from '../types';

const STORAGE_KEY = 'careerhub_internal_jobs';

// Initial Mock Data
const MOCK_DATA: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Bangkok Office',
    type: JobType.FULL_TIME,
    description: 'We are looking for a React expert to lead our internal tools team.',
    requirements: ['5+ years React', 'TypeScript mastery', 'Strong UI/UX skills'],
    salaryRange: '100k - 150k THB',
    status: JobStatus.OPEN,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: '2',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: JobType.FULL_TIME,
    description: 'Join us to redefine the user experience of our enterprise platform.',
    requirements: ['Figma expert', 'Design systems experience', 'User research skills'],
    salaryRange: '80k - 120k THB',
    status: JobStatus.OPEN,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  }
];

export const dbService = {
  getJobs: async (): Promise<Job[]> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
      return MOCK_DATA;
    }
    return JSON.parse(stored);
  },

  getJobById: async (id: string): Promise<Job | undefined> => {
    const jobs = await dbService.getJobs();
    return jobs.find(j => j.id === id);
  },

  createJob: async (input: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
    const jobs = await dbService.getJobs();
    const newJob: Job = {
      ...input,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updatedJobs = [newJob, ...jobs];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJobs));
    return newJob;
  },

  updateJob: async (id: string, updates: Partial<Job>): Promise<Job> => {
    const jobs = await dbService.getJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Job not found');

    const updatedJob = { ...jobs[index], ...updates, updatedAt: Date.now() };
    jobs[index] = updatedJob;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    return updatedJob;
  },

  deleteJob: async (id: string): Promise<void> => {
    const jobs = await dbService.getJobs();
    const updatedJobs = jobs.filter(j => j.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJobs));
  },

  archiveJob: async (id: string): Promise<Job> => {
    return dbService.updateJob(id, { status: JobStatus.ARCHIVED });
  }
};
