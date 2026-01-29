import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../../services/auth.service";
import { CartService } from "../../../../services/cart.service";
import { UserOrderService } from "../../../../services/user-order.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'c-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './c-header.html',
  styleUrl: './c-header.scss',
})
export class CHeader {
  showOrdersDropdown = false;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    public userOrderService: UserOrderService
  ) { }

  logout() {
    this.authService.logout();
  }

  toggleOrdersDropdown() {
    this.showOrdersDropdown = !this.showOrdersDropdown;
    if (this.showOrdersDropdown) {
      this.userOrderService.loadOrders();
    }
  }

  closeDropdown() {
    this.showOrdersDropdown = false;
  }
}
