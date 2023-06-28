import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MyVacancyComponent } from "../my-vacancy.component";
import { SharedModule } from "src/app/shared/shared.module";
import { UiModule } from "src/app/ui-kit/ui.module";
import { ReactiveFormsModule } from "@angular/forms";
import { MyVacancyRoutingModule } from "./my-vacancy-routing.module";
import { TranslateModule } from "@ngx-translate/core";
import { SpecialistsModule } from "src/app/modules/specialists/modules/specialists.module";

@NgModule({
  declarations: [MyVacancyComponent],
  imports: [
    CommonModule,
    UiModule,
    SharedModule,
    ReactiveFormsModule,
    MyVacancyRoutingModule,
    TranslateModule,
    SpecialistsModule,
  ],
  exports: [MyVacancyComponent, SharedModule],
})
export class MyVacancyModule {}
