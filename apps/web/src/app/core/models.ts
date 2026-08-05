export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export type ApplicationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type InterviewType =
  | 'PHONE'
  | 'VIDEO'
  | 'ONSITE'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'FINAL'
  | 'OTHER';

export type InterviewOutcome =
  | 'PENDING'
  | 'PASSED'
  | 'FAILED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface User {
  id: string;
  email: string;
  name: string;
  title?: string | null;
  targetRole?: string | null;
  targetLocation?: string | null;
  createdAt?: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  companyId: string;
  company?: Company;
  title: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  location?: string;
  remote: boolean;
  jobUrl?: string;
  source?: string;
  appliedAt?: string | null;
  followUpAt?: string | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
  interviews?: Interview[];
  notes?: Note[];
}

export interface Contact {
  id: string;
  companyId?: string | null;
  company?: Company | null;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  linkedinUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  application?: Application;
  type: InterviewType;
  scheduledAt: string;
  location?: string;
  outcome: InterviewOutcome;
  notes?: string;
  createdAt?: string;
}

export interface Note {
  id: string;
  applicationId: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  totals: {
    applications: number;
    active: number;
    companies: number;
    contacts: number;
    interviews: number;
    upcomingInterviews: number;
    avgSalary: number | null;
  };
  byStatus: Record<ApplicationStatus, number>;
  conversion: {
    applyRate: number;
    interviewRate: number;
    offerRate: number;
  };
  upcomingInterviews: Interview[];
  followUps: Application[];
  stale: Application[];
  recent: Application[];
  pipeline: Array<{
    status: ApplicationStatus;
    count: number;
    items: Array<{
      id: string;
      title: string;
      company: string;
      companyId: string;
      priority: ApplicationPriority;
      location?: string;
      remote: boolean;
      salaryMin?: number | null;
      salaryMax?: number | null;
      currency: string;
      updatedAt: string;
    }>;
  }>;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const STATUS_ORDER: ApplicationStatus[] = [
  'WISHLIST',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export const PRIORITY_LABELS: Record<ApplicationPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};
