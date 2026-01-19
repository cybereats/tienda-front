import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../services/auth.service'

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  const user = authService.getUser()

  if (user?.role == 'ADMIN') {
    router.navigate(['/admin'])
    return false
  }

  return true
}
