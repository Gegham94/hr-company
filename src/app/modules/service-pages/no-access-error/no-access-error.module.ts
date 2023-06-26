import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { NoAccessErrorComponent } from "./no-access-error.component";
import { NoAccessErrorRoutingModule } from "./no-access-error-routing.module";
import { RouterModule } from "@angular/router";
import { UiModule } from "../../../ui-kit/ui.module";


@NgModule({
  declarations: [NoAccessErrorComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    NoAccessErrorRoutingModule,
    UiModule
  ],
  exports: [NoAccessErrorComponent]
})
export class NoAccessErrorModule {
}
