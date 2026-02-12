import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { PcReport } from './components/pages/pc-report/pc-report';
import { Arsenal } from './components/pages/arsenal/arsenal';
import { Food } from './components/pages/food/food';
import { Login } from './components/pages/login/login';
import { Register } from './components/pages/register/register';
import { QrBooking } from './components/pages/qr-booking/qr-booking';
import { Cart } from './components/pages/cart/cart';
import { PcAdmin } from './components/pages/pc-admin/pc-admin';
import { Payment } from './components/pages/payment/payment';
import { authGuard } from '../guards/auth.guard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'computers', component: Arsenal },
    { path: 'food', component: Food },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'reservar/:slug', component: QrBooking },
    { path: 'pc-admin/:pcId', component: PcAdmin, canActivate: [authGuard] },
    { path: 'pc-admin/:pcId/report', component: PcReport, canActivate: [authGuard] },
    { path: 'cart', component: Cart },
    { path: 'payment', component: Payment },
    { path: '**', redirectTo: '' }
];
