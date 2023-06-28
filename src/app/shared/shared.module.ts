import {NgModule} from "@angular/core";
import {FilterComponent} from "./components/filter/filter.component";
import {UiModule} from "../ui-kit/ui.module";
import {DatepickerModule} from "ng2-datepicker";
import {TranslateModule} from "@ngx-translate/core";
import {ReactiveFormsModule} from "@angular/forms";
import {NgbDatepickerModule} from "@ng-bootstrap/ng-bootstrap";
import {NgxMaskModule} from "ngx-mask";
import {FilterForBalanceComponent} from "./components/filter-for-balance/filter.component";

@NgModule({
  declarations: [
    FilterComponent,
    FilterForBalanceComponent
  ],
  exports: [
    FilterComponent,
    FilterForBalanceComponent,
  ],
  imports: [
    UiModule,
    DatepickerModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    NgxMaskModule
  ],
  providers: []
})
export class SharedModule {
}
