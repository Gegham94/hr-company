import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { NotFoundPageRoutingModule } from "./not-found-page-routing.module";
import { NotFoundPageComponent } from "./not-found-page.component";
import { UiModule } from "../../../ui-kit/ui.module";


@NgModule({
  declarations: [NotFoundPageComponent],
  imports: [
    CommonModule,
    NotFoundPageRoutingModule,
    TranslateModule,
    UiModule
  ],
  exports: [NotFoundPageComponent],
})
export class NotFoundPageModule {
}
