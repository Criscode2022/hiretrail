import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import {
  Application,
  ApplicationStatus,
  STATUS_LABELS,
  STATUS_ORDER,
} from '../../core/models';
import { formatMoney, relativeTime } from '../../core/format';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './applications.component.html',
})
export class ApplicationsComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly items = signal<Application[]>([]);
  readonly loading = signal(true);
  readonly statusFilter = signal<ApplicationStatus | ''>('');
  readonly q = new FormControl('', { nonNullable: true });

  readonly statusLabels = STATUS_LABELS;
  readonly statuses = STATUS_ORDER;
  readonly formatMoney = formatMoney;
  readonly relativeTime = relativeTime;

  async ngOnInit() {
    await this.reload();
    this.q.valueChanges
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(() => void this.reload());
  }

  async reload() {
    this.loading.set(true);
    try {
      const status = this.statusFilter();
      const list = await firstValueFrom(
        this.api.listApplications({
          status: status || undefined,
          q: this.q.value || undefined,
        }),
      );
      this.items.set(list);
    } finally {
      this.loading.set(false);
    }
  }

  setStatus(status: ApplicationStatus | '') {
    this.statusFilter.set(status);
    void this.reload();
  }

  async remove(id: string) {
    if (!confirm('Delete this application?')) return;
    await firstValueFrom(this.api.deleteApplication(id));
    await this.reload();
  }
}
