import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Login } from './components/pages/login/login';
import { Register } from './components/pages/register/register';
import { Food } from './components/pages/food/food';

import { Arsenal } from './components/pages/arsenal/arsenal';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'food', component: Food },
    { path: 'arsenal', component: Arsenal },
];
