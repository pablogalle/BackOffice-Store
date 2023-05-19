import { Component } from '@angular/core';
import { Category } from '../model/category.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../service/category.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent {
  mode: "NEW" | "UPDATE" = "NEW";
  categoryId?: number;
  category?: Category;

  categoryForm?: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private messageService: MessageService) { }

  ngOnInit(): void {

    this.buildForm();

    const entryParam: string = this.route.snapshot.paramMap.get("categoryId") ?? "new";
    if (entryParam !== "new") {
      this.categoryId = +this.route.snapshot.paramMap.get("categoryId")!;
      this.mode = "UPDATE";
      this.getCategoryById(this.categoryId);
    } else {
      this.initializeCategory();
    }
  }

  buildForm() {
    this.categoryForm = this.formBuilder.group({
      id: [{value: undefined, disabled:true}],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(2000)]]
    })
  }

  updateForm(category: Category) {
    this.categoryForm?.patchValue({
      id: category.id,
      name: category.name,
      description: category.description
    })
  }

  initializeCategory() {
    this.category = new Category(undefined, "");
  }

  saveCategory() {
    const categoryToSave: Category = this.createFromForm();
    if (this.mode === "NEW") {
      this.insertCategory(categoryToSave);
    }
    if (this.mode === "UPDATE") {
      this.updateCategory(categoryToSave);
    }
  }

  createFromForm(): Category {
    return {
      ...this.category,
      id: this.categoryForm?.get(['id'])!.value,
      name: this.categoryForm?.get(['name'])!.value,
      description: this.categoryForm?.get(['description'])!.value,
      image: this.category!.image
    }
  }

  includeImageInCategory(event: any) {
    const inputFile = event.target as HTMLInputElement;
    const file: File | null = inputFile.files?.item(0) ?? null;

    this.readFileAsString(file!).then(
      (result) => {
        const imageType: string = this.getImageType(result);
        console.log(imageType);
        const imageBase64: string = this.getImageBase64(result);
        console.log(imageBase64);

        this.category!.image = imageBase64;

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

  private insertCategory(category: Category) {
    this.categoryService.insertCategory(category).subscribe({
      next: (categoryInserted) => {
        this.showSuccessMessage('Categoría Insertada', categoryInserted.name+' insertada correctamente')
        console.log(categoryInserted)
      },
      error: (err) => { this.handleError(err) }
    })
  }

  private updateCategory(category: Category) {
    console.log(this.category)
    this.categoryService.updateCategory(category).subscribe({
      next: (categoryUpdated) => {
        this.showSuccessMessage('Categoría Modificada', categoryUpdated.name+' actualizada correctamente')
        console.log(categoryUpdated)
      },
      error: (err) => { this.handleError(err) }
    })
  }

  private getCategoryById(categoryId: number) {
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (categoryRequest) => {
        this.category = categoryRequest
        this.updateForm(categoryRequest);
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
