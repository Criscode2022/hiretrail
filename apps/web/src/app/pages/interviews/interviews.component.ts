import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Interview } from '../../core/models';
import { formatDateTime, relativeTime } from '../../core/format';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './interviews.component.html',
})
export class InterviewsComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly items = signal<Interview[]>([]);
  readonly loading = signal(true);
  readonly upcomingOnly = signal(false);

  readonly formatDateTime = formatDateTime;
  readonly relativeTime = relativeTime;

  async ngOnInit() {
    await this.reload();
  }

  async reload() {
    this.loading.set(true);
    try {
      this.items.set(
        await firstValueFrom(
          this.api.listInterviews({ upcoming: this.upcomingOnly() }),
        ),
      );
    } finally {
      this.loading.set(false);
    }
  }

  toggleUpcoming() {
    this.upcomingOnly.update((v) => !v);
    void this.reload();
  }

  async remove(id: string) {
    if (!confirm('Delete this interview?')) return;
    await firstValueFrom(this.api.deleteInterview(id));
    await this.reload();
  }
}
