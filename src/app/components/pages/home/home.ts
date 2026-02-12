import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComputerService } from '../../../../services/computer.service';
import { CategoryPC, Computer } from '../../../../models/computer.model';
import { forkJoin } from 'rxjs';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private computerService = inject(ComputerService);

  categories: CategoryPC[] = [];
  computers: Computer[] = [];
  expandedCategoryId: number | null = null;
  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    forkJoin({
      categories: this.computerService.getAllCategories(),
      computers: this.computerService.findAll<Computer[]>()
    }).subscribe({
      next: (res) => {
        this.categories = res.categories;
        this.computers = res.computers;
        this.isLoading = false;
        // Expand first category by default if available
        if (this.categories.length > 0) {
          this.expandedCategoryId = this.categories[0].id;
        }
      },
      error: (err) => {
        console.error('Error loading home data:', err);
        this.isLoading = false;
      }
    });
  }

  toggleCategory(id: number) {
    this.expandedCategoryId = this.expandedCategoryId === id ? null : id;
  }

  getSpecsForCategory(categoryId: number): string {
    const pc = this.computers.find(c => c.categoryPCResponse.id === categoryId);
    return pc ? pc.specs : '';
  }

  getParsedSpecs(categoryId: number): string[] {
    const specs = this.getSpecsForCategory(categoryId);
    if (!specs) return [];
    return specs.split(',').map(s => s.trim());
  }


}
