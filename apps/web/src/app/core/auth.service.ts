import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './models';

const TOKEN_KEY = 'hiretrail_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(null);
  private readonly _ready = signal(false);
  private readonly _token = signal<string | null>(this.readToken());

  readonly user = this._user.asReadonly();
  readonly ready = this._ready.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());

  private readToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  getAccessToken() {
    return this._token();
  }

  setSession(accessToken: string, user: User) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    this._token.set(accessToken);
    this._user.set(user);
  }

  async bootstrap() {
    if (!this._token()) {
      this._ready.set(true);
      return;
    }
    try {
      const user = await firstValueFrom(this.api.me());
      this._user.set(user);
    } catch {
      this.clearSession();
    } finally {
      this._ready.set(true);
    }
  }

  async login(email: string, password: string) {
    const res = await firstValueFrom(this.api.login({ email, password }));
    this.setSession(res.accessToken, res.user);
    return res.user;
  }

  async register(name: string, email: string, password: string) {
    const res = await firstValueFrom(
      this.api.register({ name, email, password }),
    );
    this.setSession(res.accessToken, res.user);
    return res.user;
  }

  async logout() {
    try {
      await firstValueFrom(this.api.logout());
    } catch {
      /* ignore */
    }
    this.clearSession();
    await this.router.navigateByUrl('/login');
  }

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._user.set(null);
  }
}
