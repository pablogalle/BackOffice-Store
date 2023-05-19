import { Component, OnInit } from '@angular/core';
import { Category } from '../model/category.model';
import { CategoryService } from '../service/category.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {

  categoryIdToDelete?: number;

  categories: Category[] = [];

  constructor(private categoryService: CategoryService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.getCategories();

  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categoriesRequest) => { this.categories = categoriesRequest; },
      error: (err) => this.handleError(err)
    })
  }

  deleteCategory() {
    this.categoryService.deleteCategory(this.categoryIdToDelete!).subscribe({
      next: (data) => {
        this.showInfoMessage('Categoría Eliminada', 'La categoría con id '+this.categoryIdToDelete+' ha sido borrada')
        this.getCategories();
      },
      error: (err) => { this.handleError(err) }
    })
  }

  prepareCategoryToDelete(categoryId: number) {
    this.categoryIdToDelete = categoryId;
  }

  showInfoMessage(summary:string, detail: string) {
    this.messageService.add({ severity: 'info', summary: summary, detail: detail });
  }

  handleError(err: any): void {
    console.log(err)
  }
}
