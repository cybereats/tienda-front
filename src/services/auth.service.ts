
import { Injectable } from '@angular/core'
import { Observable, BehaviorSubject, timeout, catchError, of, throwError } from 'rxjs'
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../models/auth.model'
import { HTTPService } from './http.service'

@Injectable({
  providedIn: 'root'
})
export class AuthService extends HTTPService {
  override url = '/api/auth';

  private userSubject = new BehaviorSubject<UserProfile | null>(null)
  public user$ = this.userSubject.asObservable()
  private tokenVerified = false



  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, request)
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, request)
  }

  verifyToken(): Observable<UserProfile> {
    if (this.tokenVerified) {
      const user = this.getUser()
      if (user) {
        return of(user)
      } else {
        return throwError(() => new Error('Token not verified'))
      }
    }

    this.tokenVerified = true
    return this.http.get<UserProfile>(`${this.url}/verify`).pipe(
      timeout(5000),
      catchError(error => {
        this.tokenVerified = false
        console.log('Error verificando token:', error)
        throw error
      })
    )
  }

  setUser(user: UserProfile): void {
    this.userSubject.next(user)
  }

  getUser(): UserProfile | null {
    return this.userSubject.value
  }

  clearUser(): void {
    this.userSubject.next(null)
  }

  resetTokenVerification(): void {
    this.tokenVerified = false
  }

  saveToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  logout(): void {
    this.clearUser()
    localStorage.removeItem('auth_token')
    this.tokenVerified = false
    window.location.href = '/admin/login'
  }

  isAdmin(): boolean {
    const user = this.getUser()
    return user?.role === 'ADMIN'
  }
}
