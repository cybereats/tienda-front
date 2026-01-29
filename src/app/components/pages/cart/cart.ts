import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
    this.isCheckingOut = true;
    this.cartService.checkout(this.deliveryType).subscribe({
      next: (order) => {
        console.log('Pedido creado:', order);
        this.isCheckingOut = false;
        this.checkoutSuccess = true;
        this.userOrderService.addOrder(order);

        // Animación del icono de pedidos
        this.cartAnimation.animateOrdersIcon();

        setTimeout(() => {
          this.checkoutSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.isCheckingOut = false;
        console.error('Error al realizar pedido:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error body:', err.error);
        alert('Error al realizar el pedido: ' + (err.error?.message || err.message || 'Error desconocido'));
      }
    });
  }
}
