import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../services/cart.service';
import { CartAnimationService } from '../../../../services/cart-animation.service';
import { UserOrderService } from '../../../../services/user-order.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  cartService = inject(CartService);
  private cartAnimation = inject(CartAnimationService);
  private userOrderService = inject(UserOrderService);
  private router = inject(Router);

  isCheckingOut = false;
  checkoutSuccess = false;
  deliveryType: 'TABLE' | 'PICKUP' = 'TABLE';

  updateQuantity(event: MouseEvent, productId: number, quantity: number, currentQuantity: number): void {
    if (quantity < currentQuantity) {
      this.cartAnimation.animateFromCart(event);
    } else {
      this.cartAnimation.animateToCart(event);
    }
    if (quantity < 1) {
      this.cartService.removeFromCart(productId).subscribe();
    } else {
      this.cartService.updateQuantity(productId, quantity).subscribe();
    }
  }

  removeItem(event: MouseEvent, productId: number): void {
    this.cartAnimation.animateFromCart(event);
    this.cartService.removeFromCart(productId).subscribe();
  }

  checkout(): void {
    const state = {
      source: 'cart'
    };
    this.router.navigate(['/payment'], { state });
  }
}
