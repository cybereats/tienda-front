import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService } from '../services/auth.service'

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  const user = authService.getUser()

  if (user == null) {
    router.navigate(['/admin/login'])
    return false
  }

  if (user?.role == 'CLIENT') {
    router.navigate(['/admin/login'])
    return false
  }

  return true
}
