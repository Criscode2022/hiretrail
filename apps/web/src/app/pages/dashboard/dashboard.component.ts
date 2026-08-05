import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import {
  DashboardSummary,
  STATUS_LABELS,
  ApplicationStatus,
} from '../../core/models';
import { formatDateTime, formatMoney, relativeTime } from '../../core/format';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly data = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly firstName = computed(() => {
    const name = this.auth.user()?.name ?? 'there';
    return name.split(' ')[0] || 'there';
  });

  readonly statusLabels = STATUS_LABELS;
  readonly formatMoney = formatMoney;
  readonly formatDateTime = formatDateTime;
  readonly relativeTime = relativeTime;

  async ngOnInit() {
    try {
      const d = await firstValueFrom(this.api.dashboard());
      this.data.set(d);
    } catch {
      this.error.set('Failed to load dashboard');
    } finally {
      this.loading.set(false);
    }
  }

  statusEntries(byStatus: Record<ApplicationStatus, number>) {
    return (Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: byStatus[status] ?? 0,
    }));
  }

  barWidth(count: number, total: number) {
    if (!total) return '0%';
    return `${Math.max(4, Math.round((count / total) * 100))}%`;
  }
}
