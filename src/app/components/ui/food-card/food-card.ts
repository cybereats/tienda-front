import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../models/product.model';
import { AuthService } from '../../../../services/auth.service';
import { CartService } from '../../../../services/cart.service';
import { CartAnimationService } from '../../../../services/cart-animation.service';

@Component({
    selector: 'food-card',
    imports: [CommonModule],
    templateUrl: './food-card.html',
    styleUrl: './food-card.scss',
})
export class FoodCard {
    constructor(
        public authService: AuthService,
        public cartService: CartService,
        private cartAnimation: CartAnimationService
    ) { }

    @Input() product!: Product;
    @Input() showBadge: boolean = false;

    get quantity(): number {
        return this.cartService.getItemQuantity(this.product.id);
    }

    addToCart(event: MouseEvent): void {
        this.cartAnimation.animateToCart(event);
        this.cartService.addToCart(this.product, 1).subscribe();
    }

    increment(event: MouseEvent): void {
        this.cartAnimation.animateToCart(event);
        if (this.quantity === 0) {
            this.cartService.addToCart(this.product, 1).subscribe();
        } else {
            this.cartService.updateQuantity(this.product.id, this.quantity + 1).subscribe();
        }
    }

    decrement(event: MouseEvent): void {
        this.cartAnimation.animateFromCart(event);
        if (this.quantity > 1) {
            this.cartService.updateQuantity(this.product.id, this.quantity - 1).subscribe();
        } else {
            this.cartService.removeFromCart(this.product.id).subscribe();
        }
    }
}
