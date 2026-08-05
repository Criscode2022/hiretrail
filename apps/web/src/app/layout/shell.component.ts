import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

const NAV = [
  { path: '/app/dashboard', label: 'Dashboard', icon: 'grid' },
  { path: '/app/pipeline', label: 'Pipeline', icon: 'kanban' },
  { path: '/app/applications', label: 'Applications', icon: 'list' },
  { path: '/app/interviews', label: 'Interviews', icon: 'calendar' },
  { path: '/app/companies', label: 'Companies', icon: 'building' },
  { path: '/app/contacts', label: 'Contacts', icon: 'users' },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly nav = NAV;
  readonly mobileOpen = signal(false);

  toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }

  logout() {
    void this.auth.logout();
  }
}
