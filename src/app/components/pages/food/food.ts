import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FoodCard } from '../../ui/food-card/food-card';
import { Product, ProductsResponse, CategoryProduct } from '../../../../models/product.model';
import { ProductService } from '../../../../services/product.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'app-food',
    imports: [RouterLink, CommonModule, FoodCard],
    templateUrl: './food.html',
    styleUrl: './food.scss',
})
export class Food implements OnInit {
    products: Product[] = [];
    featuredProducts: Product[] = [];
    categories: CategoryProduct[] = [];
    selectedCategory: string = '';
    searchText: string = '';

    currentPage: number = 1;
    pageSize: number = 12;
    totalElements: number = 0;
    isLoadingMore: boolean = false;

    constructor(
        public authService: AuthService,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.productService.getAllCategories().subscribe({
            next: (cats) => {
                this.categories = cats;
                this.loadProducts();
            },
            error: (err) => console.error('Error loading categories:', err)
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
}
