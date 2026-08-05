import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Company } from '../../core/models';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './companies.component.html',
})
export class CompaniesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Company[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    website: [''],
    industry: [''],
    location: [''],
    notes: [''],
  });

  async ngOnInit() {
    await this.reload();
  }

  async reload() {
    this.loading.set(true);
    try {
      this.items.set(await firstValueFrom(this.api.listCompanies()));
    } finally {
      this.loading.set(false);
    }
  }

  async submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    await firstValueFrom(
      this.api.createCompany({
        name: v.name,
        website: v.website || undefined,
        industry: v.industry || undefined,
        location: v.location || undefined,
        notes: v.notes || undefined,
      }),
    );
    this.form.reset();
    this.showForm.set(false);
    await this.reload();
  }

  async remove(id: string) {
    if (!confirm('Delete this company? Related applications may be removed.')) return;
    await firstValueFrom(this.api.deleteCompany(id));
    await this.reload();
  }
}
