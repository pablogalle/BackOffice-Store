import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from '../modelo/item.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  
  constructor(private http: HttpClient) { }

  public getAllItems(page: number, size:number, sort:string, filters?: string): Observable<Item[]>{
    let urlEndpoint: string = "http://localhost:8080/store/items?page=" + page + "&size=" + size + "&sort=" + sort;
    if(filters){
      urlEndpoint = urlEndpoint + "&filter=" + filters;
    }
    return this.http.get<Item[]>(urlEndpoint);
  }

  deleteItem(itemIdToDelete: number): Observable<any> {
    let urlEndpoint: string = "http://localhost:8080/store/items/" + itemIdToDelete;
    return this.http.delete<any>(urlEndpoint);
  }

  getItemById(itemId: number): Observable<Item> {
    let urlEndpoint: string = "http://localhost:8080/store/items/" + itemId;
    return this.http.get<Item>(urlEndpoint);
  }

  insertItem(item: Item): Observable<Item> {
    let urlEndpoint: string = "http://localhost:8080/store/items/";
    return this.http.post<Item>(urlEndpoint, item);
  }

  updateItem(item: Item): Observable<Item> {
    let urlEndpoint: string = "http://localhost:8080/store/items/";
    return this.http.patch<Item>(urlEndpoint, item);
  }
}
