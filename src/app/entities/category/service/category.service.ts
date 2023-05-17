import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../model/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http : HttpClient) { }

  public getAllCategories(partialName?: string): Observable<Category[]>{
    let urlEndpoint: string = "http://localhost:8080/store/categories?partialName=";
    if (partialName){
      urlEndpoint += partialName;
    }
    return this.http.get<Category[]>(urlEndpoint);
  }

  getCategoryById(categoryId: number): Observable<Category> {
    let urlEndpoint: string = "http://localhost:8080/store/categories/" + categoryId;
    return this.http.get<Category>(urlEndpoint);
  }

  insertCategory(category: Category): Observable<Category> {
    let urlEndpoint: string = "http://localhost:8080/store/categories/";
    return this.http.post<Category>(urlEndpoint, category);
  }

  deleteCategory(categoryIdToDelete: number): Observable<any> {
    let urlEndpoint: string = "http://localhost:8080/store/categories/" + categoryIdToDelete;
    return this.http.delete<any>(urlEndpoint);
  }

  updateCategory(category: Category): Observable<Category> {
    let urlEndpoint: string = "http://localhost:8080/store/categories/";
    return this.http.patch<Category>(urlEndpoint, category);
  }

  
}
