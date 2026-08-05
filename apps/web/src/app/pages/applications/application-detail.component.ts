import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import {
  Application,
  ApplicationStatus,
  InterviewType,
  STATUS_LABELS,
  STATUS_ORDER,
} from '../../core/models';
import { formatDateTime, formatMoney, relativeTime } from '../../core/format';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './application-detail.component.html',
})
export class ApplicationDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly app = signal<Application | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly statusLabels = STATUS_LABELS;
  readonly statuses = STATUS_ORDER;
  readonly formatMoney = formatMoney;
  readonly formatDateTime = formatDateTime;
  readonly relativeTime = relativeTime;

  readonly noteForm = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.minLength(1)]],
  });

  readonly interviewForm = this.fb.nonNullable.group({
    type: ['VIDEO' as InterviewType],
    scheduledAt: ['', Validators.required],
    location: [''],
    notes: [''],
  });

  private id = '';

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    await this.reload();
  }

  async reload() {
    this.loading.set(true);
    try {
      const app = await firstValueFrom(this.api.getApplication(this.id));
      this.app.set(app);
    } catch {
      this.error.set('Application not found');
    } finally {
      this.loading.set(false);
    }
  }

  async setStatus(status: ApplicationStatus) {
    await firstValueFrom(this.api.updateApplicationStatus(this.id, status));
    await this.reload();
  }

  async addNote() {
    if (this.noteForm.invalid) return;
    const body = this.noteForm.controls.body.value.trim();
    if (!body) return;
    await firstValueFrom(this.api.createNote(this.id, body));
    this.noteForm.reset();
    await this.reload();
  }

  async deleteNote(noteId: string) {
    await firstValueFrom(this.api.deleteNote(noteId));
    await this.reload();
  }

  async addInterview() {
    if (this.interviewForm.invalid) return;
    const v = this.interviewForm.getRawValue();
    await firstValueFrom(
      this.api.createInterview({
        applicationId: this.id,
        type: v.type,
        scheduledAt: new Date(v.scheduledAt).toISOString(),
        location: v.location || undefined,
        notes: v.notes || undefined,
      }),
    );
    this.interviewForm.reset({ type: 'VIDEO', scheduledAt: '', location: '', notes: '' });
    await this.reload();
  }

  async remove() {
    if (!confirm('Delete this application permanently?')) return;
    await firstValueFrom(this.api.deleteApplication(this.id));
    await this.router.navigateByUrl('/app/applications');
  }
}
