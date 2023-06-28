import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CreateVacancyFilterComponent } from "../create-vacancy-filter.component";
import { SharedModule } from "src/app/shared/shared.module";
import { UiModule } from "src/app/ui-kit/ui.module";
import { ReactiveFormsModule } from "@angular/forms";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { CreateVacancyRoutingModule } from "./create-vacancy-routing.module";
import { TranslateModule } from "@ngx-translate/core";
import { ProgressBarForStepsComponent } from "../../progress-bar-for-steps/progress-bar-for-steps.component";
import { SpecialistsModule } from "src/app/modules/specialists/modules/specialists.module";

@NgModule({
  declarations: [CreateVacancyFilterComponent, ProgressBarForStepsComponent],
  exports: [CreateVacancyFilterComponent, ProgressBarForStepsComponent],
    imports: [
        CommonModule,
        SharedModule,
        UiModule,
        ReactiveFormsModule,
        CKEditorModule,
        CreateVacancyRoutingModule,
        TranslateModule,
        SpecialistsModule
    ]
})
export class CreateVacancyFilterModule {
}
