import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../models/product.model';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'food-card',
    imports: [CommonModule],
    templateUrl: './food-card.html',
    styleUrl: './food-card.scss',
})
export class FoodCard {
    constructor(public authService: AuthService) { }
    @Input() product!: Product;
    @Input() showBadge: boolean = false;
}
