import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/data.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private tokenKey = 'authToken';
  private userKey = 'authUser';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify({ username: response.username, role: response.role }));
      })
    );
  }

  getProfile(): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.apiUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateProfile(data: any): Observable<any> {
    const token = this.getToken();
    return this.http.put(`${this.apiUrl}/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
