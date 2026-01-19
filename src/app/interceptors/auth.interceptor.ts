
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const authService = inject(AuthService) as AuthService
  const token = localStorage.getItem('auth_token')

  const authReq = token ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }) : req

  return next(authReq).pipe(
    catchError(error => {
      console.log('HTTP Error:', error.status, error.message)
      if (error.status === 401) {
        localStorage.removeItem('auth_token')
        authService.clearUser()
      } else if (error.status === 403) {
        console.warn('Acceso denegado')
      } else if (error.status >= 500) {
        console.error('Error del servidor')
      }

      return throwError(() => error)
    })
  )
}
