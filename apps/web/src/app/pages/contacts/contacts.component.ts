import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Company, Contact } from '../../core/models';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacts.component.html',
})
export class ContactsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly items = signal<Contact[]>([]);
  readonly companies = signal<Company[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    companyId: [''],
    email: [''],
    role: [''],
    phone: [''],
    notes: [''],
  });

  async ngOnInit() {
    const [contacts, companies] = await Promise.all([
      firstValueFrom(this.api.listContacts()),
      firstValueFrom(this.api.listCompanies()),
    ]);
    this.items.set(contacts);
    this.companies.set(companies);
    this.loading.set(false);
  }

  async reload() {
    this.items.set(await firstValueFrom(this.api.listContacts()));
  }

  async submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    await firstValueFrom(
      this.api.createContact({
        name: v.name,
        companyId: v.companyId || undefined,
        email: v.email || undefined,
        role: v.role || undefined,
        phone: v.phone || undefined,
        notes: v.notes || undefined,
      }),
    );
    this.form.reset();
    this.showForm.set(false);
    await this.reload();
  }

  async remove(id: string) {
    if (!confirm('Delete this contact?')) return;
    await firstValueFrom(this.api.deleteContact(id));
    await this.reload();
  }
}
