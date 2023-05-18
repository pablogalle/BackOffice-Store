import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from '../../category/model/category.model';
import { CategoryService } from '../../category/service/category.service';
import { Item } from '../modelo/item.model';
import { ItemService } from '../service/item.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-item-reactive-form',
  templateUrl: './item-reactive-form.component.html',
  styleUrls: ['./item-reactive-form.component.scss']
})
export class ItemReactiveFormComponent implements OnInit {

  mode: "NEW" | "UPDATE" = "NEW";
  itemId?: number;
  item?: Item;
  selectedCategory?: Category;
  categories: Category[] = []

  itemForm?: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private messageService: MessageService) {
    }

  ngOnInit(): void {

    this.buildForm();

    const entryParam: string = this.route.snapshot.paramMap.get("itemId") ?? "new";
    if (entryParam !== "new") {
      this.itemId = +this.route.snapshot.paramMap.get("itemId")!;
      this.mode = "UPDATE";
      this.getItemById(this.itemId);
    } else {
      this.initializeItem();
    }
  }

  buildForm() {
    this.itemForm = this.formBuilder.group({
      id: [{value: undefined, disabled:true}],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(2000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: [undefined, [Validators.required]]
    })
  }

  updateForm(item: Item) {
    this.itemForm?.patchValue({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: new Category(item.categoryId!, item.categoryName!)
    })
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
    const itemToSave: Item = this.createFromForm();
    if (this.mode === "NEW") {
      this.insertItem(itemToSave);
    }

    if (this.mode === "UPDATE") {
      this.updateItem(itemToSave);
    }
  }

  createFromForm(): Item {
    return {
      ...this.item,
      id: this.itemForm?.get(['id'])!.value,
      name: this.itemForm?.get(['name'])!.value,
      description: this.itemForm?.get(['description'])!.value,
      price: this.itemForm?.get(['price'])!.value,
      image: this.item!.image,
      categoryId: this.itemForm?.get(['category'])!.value.id,
      categoryName: this.itemForm?.get(['category'])!.value.name,

    }
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

  private getImageType(imageString: string): string {
    const imageStringParts: string[] = imageString.split(",")
    if (imageStringParts.length == 2) {
      return imageStringParts[0];
    }
    return "";
  }

  private getImageBase64(imageString: string): string {
    const imageStringParts: string[] = imageString.split(",")
    if (imageStringParts.length == 2) {
      return imageStringParts[1];
    }
    return "";
  }

  private readFileAsString(file: File) {
    return new Promise<string>(function (resolve, reject) {
      let reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(this.result as string)
      }
    })
  }

  private insertItem(item: Item) {
    this.itemService.insertItem(item).subscribe({
      next: (itemInserted) => {
        console.log("Insertado correcetamente");
        this.showSuccessMessage('Artículo Creado', item.name+' creado correctamente')
      },
      error: (err) => { this.handleError(err) }
    })
  }

  private updateItem(item: Item) {
    this.itemService.updateItem(item).subscribe({
      next: (itemUpdated) => {
        console.log("Modificado correcetamente");
        this.showSuccessMessage('Artículo Modificado', item.name+' actualizado correctamente')

      },
      error: (err) => { this.handleError(err) }
    })
  }

  private getItemById(itemId: number) {
    this.itemService.getItemById(itemId).subscribe({
      next: (itemRequest) => {
        this.item = itemRequest
        this.updateForm(itemRequest);
        this.selectedCategory = new Category(itemRequest.categoryId!, itemRequest.categoryName!)
      },
      error: (err) => { this.handleError(err); }
    });
  }

  showSuccessMessage(summary:string, detail: string) {
    this.messageService.add({ severity: 'success', summary: summary, detail: detail });
  }


  handleError(err: any) {
    //ToDo
  }

}
