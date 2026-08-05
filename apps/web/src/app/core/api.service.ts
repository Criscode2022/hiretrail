import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  Application,
  ApplicationPriority,
  ApplicationStatus,
  Company,
  Contact,
  DashboardSummary,
  Interview,
  Note,
  User,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // Auth
  register(body: { email: string; password: string; name: string }) {
    return this.http.post<{ accessToken: string; user: User }>(
      `${this.base}/auth/register`,
      body,
    );
  }

  login(body: { email: string; password: string }) {
    return this.http.post<{ accessToken: string; user: User }>(
      `${this.base}/auth/login`,
      body,
    );
  }

  logout() {
    return this.http.post<{ ok: boolean }>(`${this.base}/auth/logout`, {});
  }

  me() {
    return this.http.get<User>(`${this.base}/users/me`);
  }

  updateProfile(body: Partial<User>) {
    return this.http.patch<User>(`${this.base}/users/me`, body);
  }

  // Dashboard
  dashboard() {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard`);
  }

  // Companies
  listCompanies(q?: string) {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<Company[]>(`${this.base}/companies`, { params });
  }

  getCompany(id: string) {
    return this.http.get<Company>(`${this.base}/companies/${id}`);
  }

  createCompany(body: Partial<Company>) {
    return this.http.post<Company>(`${this.base}/companies`, body);
  }

  updateCompany(id: string, body: Partial<Company>) {
    return this.http.patch<Company>(`${this.base}/companies/${id}`, body);
  }

  deleteCompany(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/companies/${id}`);
  }

  // Applications
  listApplications(filters: {
    status?: ApplicationStatus;
    priority?: ApplicationPriority;
    companyId?: string;
    q?: string;
  } = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params = params.set(k, v);
    });
    return this.http.get<Application[]>(`${this.base}/applications`, { params });
  }

  getApplication(id: string) {
    return this.http.get<Application>(`${this.base}/applications/${id}`);
  }

  createApplication(body: Record<string, unknown>) {
    return this.http.post<Application>(`${this.base}/applications`, body);
  }

  updateApplication(id: string, body: Record<string, unknown>) {
    return this.http.patch<Application>(`${this.base}/applications/${id}`, body);
  }

  updateApplicationStatus(id: string, status: ApplicationStatus) {
    return this.http.patch<Application>(
      `${this.base}/applications/${id}/status`,
      { status },
    );
  }

  deleteApplication(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/applications/${id}`);
  }

  // Contacts
  listContacts(companyId?: string) {
    let params = new HttpParams();
    if (companyId) params = params.set('companyId', companyId);
    return this.http.get<Contact[]>(`${this.base}/contacts`, { params });
  }

  createContact(body: Partial<Contact>) {
    return this.http.post<Contact>(`${this.base}/contacts`, body);
  }

  updateContact(id: string, body: Partial<Contact>) {
    return this.http.patch<Contact>(`${this.base}/contacts/${id}`, body);
  }

  deleteContact(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/contacts/${id}`);
  }

  // Interviews
  listInterviews(opts: { applicationId?: string; upcoming?: boolean } = {}) {
    let params = new HttpParams();
    if (opts.applicationId) params = params.set('applicationId', opts.applicationId);
    if (opts.upcoming) params = params.set('upcoming', 'true');
    return this.http.get<Interview[]>(`${this.base}/interviews`, { params });
  }

  createInterview(body: Record<string, unknown>) {
    return this.http.post<Interview>(`${this.base}/interviews`, body);
  }

  updateInterview(id: string, body: Record<string, unknown>) {
    return this.http.patch<Interview>(`${this.base}/interviews/${id}`, body);
  }

  deleteInterview(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/interviews/${id}`);
  }

  // Notes
  listNotes(applicationId: string) {
    return this.http.get<Note[]>(`${this.base}/notes`, {
      params: { applicationId },
    });
  }

  createNote(applicationId: string, body: string) {
    return this.http.post<Note>(`${this.base}/notes`, { applicationId, body });
  }

  deleteNote(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/notes/${id}`);
  }

  health() {
    return this.http.get<{ ok: boolean; database: string }>(`${this.base}/health`);
  }
}
