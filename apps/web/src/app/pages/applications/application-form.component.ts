import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import {
  ApplicationPriority,
  ApplicationStatus,
  Company,
  STATUS_LABELS,
  STATUS_ORDER,
} from '../../core/models';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './application-form.component.html',
})
export class ApplicationFormComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly companies = signal<Company[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly creatingCompany = signal(false);

  readonly statuses = STATUS_ORDER;
  readonly statusLabels = STATUS_LABELS;
  readonly priorities: ApplicationPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  readonly form = this.fb.nonNullable.group({
    companyId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(2)]],
    status: ['WISHLIST' as ApplicationStatus, Validators.required],
    priority: ['MEDIUM' as ApplicationPriority, Validators.required],
    salaryMin: [null as number | null],
    salaryMax: [null as number | null],
    currency: ['EUR'],
    location: [''],
    remote: [true],
    jobUrl: [''],
    source: [''],
    description: [''],
    newCompanyName: [''],
  });

  async ngOnInit() {
    const list = await firstValueFrom(this.api.listCompanies());
    this.companies.set(list);
    if (list[0]) this.form.patchValue({ companyId: list[0].id });
  }

  async createCompanyQuick() {
    const name = this.form.controls.newCompanyName.value?.trim();
    if (!name) return;
    this.creatingCompany.set(true);
    try {
      const c = await firstValueFrom(this.api.createCompany({ name }));
      this.companies.update((list) => [...list, c].sort((a, b) => a.name.localeCompare(b.name)));
      this.form.patchValue({ companyId: c.id, newCompanyName: '' });
    } finally {
      this.creatingCompany.set(false);
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const v = this.form.getRawValue();
      const app = await firstValueFrom(
        this.api.createApplication({
          companyId: v.companyId,
          title: v.title,
          status: v.status,
          priority: v.priority,
          salaryMin: v.salaryMin ?? undefined,
          salaryMax: v.salaryMax ?? undefined,
          currency: v.currency,
          location: v.location || undefined,
          remote: v.remote,
          jobUrl: v.jobUrl || undefined,
          source: v.source || undefined,
          description: v.description || undefined,
        }),
      );
      await this.router.navigate(['/app/applications', app.id]);
    } catch (e: unknown) {
      const msg =
        (e as { error?: { message?: string | string[] } })?.error?.message ??
        'Could not create application';
      this.error.set(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      this.loading.set(false);
    }
  }
}
