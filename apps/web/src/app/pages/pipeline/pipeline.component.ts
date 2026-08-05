import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import {
  ApplicationStatus,
  DashboardSummary,
  STATUS_LABELS,
  STATUS_ORDER,
} from '../../core/models';
import { formatMoney } from '../../core/format';

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pipeline.component.html',
})
export class PipelineComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly pipeline = signal<DashboardSummary['pipeline']>([]);
  readonly loading = signal(true);
  readonly statusLabels = STATUS_LABELS;
  readonly formatMoney = formatMoney;
  readonly moving = signal<string | null>(null);

  async ngOnInit() {
    await this.reload();
  }

  async reload() {
    this.loading.set(true);
    try {
      const d = await firstValueFrom(this.api.dashboard());
      this.pipeline.set(
        d.pipeline.filter((col) => STATUS_ORDER.includes(col.status)),
      );
    } finally {
      this.loading.set(false);
    }
  }

  async move(id: string, status: ApplicationStatus) {
    this.moving.set(id);
    try {
      await firstValueFrom(this.api.updateApplicationStatus(id, status));
      await this.reload();
    } finally {
      this.moving.set(null);
    }
  }

  nextStatus(status: ApplicationStatus): ApplicationStatus | null {
    const i = STATUS_ORDER.indexOf(status);
    if (i < 0 || i >= STATUS_ORDER.length - 1) return null;
    const next = STATUS_ORDER[i + 1];
    if (next === 'REJECTED' || next === 'WITHDRAWN') return 'OFFER';
    return next;
  }

  prevStatus(status: ApplicationStatus): ApplicationStatus | null {
    const i = STATUS_ORDER.indexOf(status);
    if (i <= 0) return null;
    return STATUS_ORDER[i - 1];
  }
}
