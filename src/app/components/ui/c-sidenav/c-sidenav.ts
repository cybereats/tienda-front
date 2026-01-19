import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'c-sidenav',
  imports: [RouterLink],
  templateUrl: './c-sidenav.html',
  styleUrl: './c-sidenav.scss',
})

export class CSidenav {
  sideNavItems = [
    { name: 'Inicio', icon: 'home.png', route: '/admin' },
    { name: 'Estadísticas', icon: 'stats.png', route: '/admin/stats' },
    { name: 'Usuarios', icon: 'users.png', route: '/admin/users' },
    { name: 'Pedidos', icon: 'orders.png', route: '/admin/orders' },
    { name: 'Productos', icon: 'products.png', route: '/admin/products' },
    { name: 'Ordenadores', icon: 'computers.png', route: '/admin/computers' },
    { name: 'Incidencias', icon: 'reports.png', route: '/admin/reports' },
  ]

  authService = inject(AuthService);
  router = inject(Router);


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
