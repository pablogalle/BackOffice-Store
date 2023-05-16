import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemService } from '../service/item.service';
import { Item } from '../modelo/item.model';
import { ThisReceiver } from '@angular/compiler';
import { Category } from '../../category/model/category.model';
import { CategoryService } from '../../category/service/category.service';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent implements OnInit {

  mode: "NEW" | "UPDATE" = "NEW";
  itemId?: number;
  item?: Item;

  selectedCategory?: Category;
  categories: Category[] = []

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private categoryService: CategoryService) { }

  ngOnInit(): void {
    const entryParam: string = this.route.snapshot.paramMap.get("itemId") ?? "new";
    if (entryParam !== "new") {
      this.itemId = +this.route.snapshot.paramMap.get("itemId")!;
      this.mode = "UPDATE";
      this.getItemById(this.itemId);
    } else {
      this.initializeItem();
    }
  }

  getAllCategories(event?: any) {
    let categorySearch: string | undefined;
    if (event?.query) {
      categorySearch = event.query;
    }
    this.categoryService.getAllCategories(categorySearch).subscribe({
      next: (filteredCategories) => { this.categories = filteredCategories },
      error: (err) => this.handleError(err)
    })
  }

  initializeItem() {
    this.item = new Item(undefined, "", 0);
  }

  saveItem() {
    if (this.mode === "NEW") {
      this.insertItem();
    }

    if (this.mode === "UPDATE") {
      this.updateItem();
    }
  }

  categorySelected() {
    this.item!.categoryId = this.selectedCategory!.id;
    this.item!.categoryName = this.selectedCategory!.name;
  }

  categoryUnselected(){
    this.item!.categoryId = undefined;
    this.item!.categoryName = undefined;
  }

  includeImageInItem(event: any) {
    const inputFile = event.target as HTMLInputElement;
    const file: File | null = inputFile.files?.item(0) ?? null;

    this.readFileAsString(file!).then(
      (result) => {
        const imageType: string = this.getImageType(result);
        console.log(imageType);
        const imageBase64: string = this.getImageBase64(result);
        console.log(imageBase64);
      
        this.item!.image = imageBase64;

      },
      (error) => {
        console.log("No se ha podido cargar la imagen")
      }
    )
  }

  private getImageType(imageString: string): string{
    const imageStringParts: string[] = imageString.split(",")
    if(imageStringParts.length == 2){
      return imageStringParts[0];
    }
    return "";
  }

  private getImageBase64(imageString: string): string{
    const imageStringParts: string[] = imageString.split(",")
    if(imageStringParts.length == 2){
      return imageStringParts[1];
    }
    return "";
  }

  private readFileAsString(file: File){
    return new Promise<string>(function(resolve, reject) {
      let reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function(){
        resolve(this.result as string)
      }
    })
  }

  private insertItem() {
    this.itemService.insertItem(this.item!).subscribe({
      next: (itemInserted) => {
        console.log("Insertado correcetamente");
        console.log(itemInserted)
      },
      error: (err) => { this.handleError(err) }
    })
  }

  private updateItem() {
    this.itemService.updateItem(this.item!).subscribe({
      next: (itemUpdated) => {
        console.log("Modificado correcetamente");
        console.log(itemUpdated)
      },
      error: (err) => { this.handleError(err) }
    })
  }

  private getItemById(itemId: number) {
    this.itemService.getItemById(itemId).subscribe({
      next: (itemRequest) => {
        this.item = itemRequest
        this.selectedCategory = new Category(itemRequest.categoryId!, itemRequest.categoryName!)
      },
      error: (err) => { this.handleError(err); }
    });
  }

  handleError(err: any) {
    //ToDo
  }
}
