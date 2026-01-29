import { ApplicationConfig, DEFAULT_CURRENCY_CODE, inject, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { UserOrderService } from '../services/user-order.service';
import { catchError, of, tap } from 'rxjs';

registerLocaleData(localeEs, 'es');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      const authService = inject(AuthService)
      const cartService = inject(CartService)
      const userOrderService = inject(UserOrderService)
      return authService.verifyToken().pipe(
        tap(user => {
          authService.setUser(user)
          if (user) {
            cartService.loadCart()
            userOrderService.loadOrders()
          }
        }),
        catchError(() => {
          return of(null)
        })
      )
    }),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
  ]
};
