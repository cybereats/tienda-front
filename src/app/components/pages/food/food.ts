import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FoodCard } from '../../ui/food-card/food-card';
import { Product, ProductsResponse, CategoryProduct } from '../../../../models/product.model';
import { ProductService } from '../../../../services/product.service';
import { AuthService } from '../../../../services/auth.service';
import { CartService } from '../../../../services/cart.service';
import { CartAnimationService } from '../../../../services/cart-animation.service';

@Component({
    selector: 'app-food',
    imports: [RouterLink, CommonModule, FoodCard],
    templateUrl: './food.html',
    styleUrl: './food.scss',
})
export class Food implements OnInit {
    products: Product[] = [];
    featuredProducts: Product[] = [];
    combos: Product[] = [];
    categories: CategoryProduct[] = [];
    selectedCategory: string = '';
    searchText: string = '';

    currentPage: number = 1;
    pageSize: number = 12;
    totalElements: number = 0;
    isLoadingMore: boolean = false;

    constructor(
        public authService: AuthService,
        public cartService: CartService,
        private cartAnimation: CartAnimationService,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    scrollToMenu(): void {
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    }

    loadCategories(): void {
        this.productService.getAllCategories().subscribe({
            next: (cats) => {
                this.categories = cats;
                this.loadProducts();
                this.loadCombos();
            },
            error: (err) => console.error('Error loading categories:', err)
        });
    }

    loadCombos(): void {
        this.productService.search<ProductsResponse>(1, 10, '', 'combos').subscribe({
            next: (response) => {
                this.combos = response.data;
            },
            error: (err) => console.error('Error loading combos:', err)
        });
    }

    loadProducts(append: boolean = false): void {
        if (!append) {
            this.currentPage = 1;
            this.products = [];
        }

        this.productService.search<ProductsResponse>(this.currentPage, this.pageSize, this.searchText, this.selectedCategory).subscribe({
            next: (response) => {
                if (append) {
                    this.products = [...this.products, ...response.data];
                } else {
                    this.products = response.data;
                }
                this.totalElements = response.totalElements;
                this.isLoadingMore = false;

                if (!append || this.featuredProducts.length === 0) {
                    this.updateFeaturedProducts();
                }
            },
            error: (err) => {
                console.error('Error loading products:', err);
                this.isLoadingMore = false;
            }
        });
    }

    loadMore(): void {
        if (this.hasMoreProducts()) {
            this.isLoadingMore = true;
            this.currentPage++;
            this.loadProducts(true);
        }
    }

    hasMoreProducts(): boolean {
        return this.products.length < this.totalElements;
    }

    updateFeaturedProducts(): void {
        if (this.products.length > 0) {
            this.featuredProducts = [...this.products]
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
        }
    }

    selectCategory(categorySlug: string): void {
        if (this.selectedCategory !== categorySlug) {
            this.selectedCategory = categorySlug;
            this.loadProducts();
        }
    }

    onSearch(text: string): void {
        this.searchText = text;
        this.loadProducts();
    }

    onWheelScroll(event: WheelEvent): void {
        if (event.deltaY !== 0) {
            const container = event.currentTarget as HTMLElement;
            container.scrollLeft += event.deltaY;
            event.preventDefault();
        }
    }

    getComboQuantity(combo: Product): number {
        return this.cartService.getItemQuantity(combo.id);
    }

    incrementCombo(event: MouseEvent, combo: Product): void {
        this.cartAnimation.animateToCart(event);
        const qty = this.getComboQuantity(combo);
        if (qty === 0) {
            this.cartService.addToCart(combo, 1).subscribe();
        } else {
            this.cartService.updateQuantity(combo.id, qty + 1).subscribe();
        }
    }

    decrementCombo(event: MouseEvent, combo: Product): void {
        this.cartAnimation.animateFromCart(event);
        const qty = this.getComboQuantity(combo);
        if (qty > 1) {
            this.cartService.updateQuantity(combo.id, qty - 1).subscribe();
        } else if (qty === 1) {
            this.cartService.removeFromCart(combo.id).subscribe();
        }
    }
}
