import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemService } from '../service/item.service';
import { Item } from '../modelo/item.model';
import { filter } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {

  categoryId?: number;
  title: string = "";

  items: Item[] = [];

  page: number = 0;
  size: number = 2;
  sort: string = "name,asc";

  first: boolean = false;
  last: boolean = false;
  totalPages: number = 0;
  totalElements: number = 0;

  nameFilter?: string;
  priceFilter?: number;

  itemIdToDelete?: number;

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    if (this.route.snapshot.paramMap.get("categoryId")) {
      this.categoryId = +this.route.snapshot.paramMap.get("categoryId")!;
      this.title = "Artículos de la categoría " + this.categoryId;
    } else {
      this.title = "Lista de Artículos"
    }
    this.getAllItems();
  }

  buildFilters(): string | undefined {
    const filters: string[] = [];

    if(this.categoryId){
      filters.push("category.id:EQUAL:" + this.categoryId)
    }
    if (this.nameFilter) {
      filters.push("name:MATCH:" + this.nameFilter);
    }
    if (this.priceFilter) {
      filters.push("price:LESS_THAN_EQUAL:" + this.priceFilter);
    }

    if (filters.length > 0) {
      let globalFilters: string = "";

      for (let filter of filters) {
        globalFilters = globalFilters + filter + ",";
      }

      globalFilters = globalFilters.substring(0, globalFilters.length - 1);
      return globalFilters

    } else {
      return undefined
    }
  }

  getAllItems() {

    const filters: string | undefined = this.buildFilters();

    this.itemService.getAllItems(this.page, this.size, this.sort, filters).subscribe({
      next: (data: any) => {
        this.items = data.content;
        this.first = data.first;
        this.last = data.last;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
      },
      error: (err) => this.handleError(err)
    })
  }

  handleError(err: any): void {
    // lo que hariamos si hubiera un error 
    
  }

  nextPage() {
    this.page++
    this.getAllItems();
  }

  previousPage() {
    this.page--
    this.getAllItems();
  }

  searchByFilters() {
    this.getAllItems();
  }

  prepareItemToDelete(itemId: number){
    this.itemIdToDelete = itemId;

  }

  public deleteItem(){
    this.itemService.deleteItem(this.itemIdToDelete!).subscribe({
      next: (data) => {
        this.showInfoMessage('Articulo Borrado', 'El articulo con id '+this.itemIdToDelete+' ha sido borrado')
        this.getAllItems();
        
      },
      error: (err) => {this.handleError(err)}
    })
  }

  showInfoMessage(summary:string, detail: string) {
    this.messageService.add({ severity: 'info', summary: summary, detail: detail });
  }
}
