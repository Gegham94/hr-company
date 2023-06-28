import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "src/app/shared/shared.module";
import { UiModule } from "src/app/ui-kit/ui.module";
import { ReactiveFormsModule } from "@angular/forms";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { CreateVacancyInformationRoutingModule } from "./create-vacancy-information-routing.module";
import { CreateVacancyInformationComponent } from "../create-vacancy-information.component";
import { DatepickerModule } from "ng2-datepicker";
import { CreateVacancyFilterModule } from "../../create-vacancy-filter/module/create-vacancy-filter.module";
import { TranslateModule } from "@ngx-translate/core";
import { NgxMaskModule } from "ngx-mask";
import { NgbDatepickerModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [CreateVacancyInformationComponent],
  exports: [CreateVacancyInformationComponent],
  imports: [
    CommonModule,
    SharedModule,
    UiModule,
    ReactiveFormsModule,
    CKEditorModule,
    CreateVacancyInformationRoutingModule,
    DatepickerModule,
    CreateVacancyFilterModule,
    TranslateModule,
    NgxMaskModule,
    NgbDatepickerModule
  ]
})
export class CreateVacancyInformationModule {
}
