import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CompanyRoutingModule } from "./company-routing.module";
import { CompanyComponent } from "./company.component";
import { UiModule } from "../../ui-kit/ui.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ImageCropperModule } from "ngx-image-cropper";
import { SharedModule } from "../../shared-modules/shared.module";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule } from "@ngx-translate/core";
import {SpecialistsModule} from "../specialists/specialists.module";


@NgModule({
  declarations: [
    CompanyComponent
  ],
  exports: [
    CompanyComponent
  ],
    imports: [
        CommonModule,
        HttpClientModule,
        CompanyRoutingModule,
        UiModule,
        FormsModule,
        ReactiveFormsModule,
        ImageCropperModule,
        SharedModule,
        CKEditorModule,
        TranslateModule,
        SpecialistsModule
    ]
})
export class CompanyModule {
}
