import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { ServicePagesComponent } from "./service-pages.component";
import { ServicePagesRoutingModule } from "./service-pages-routing.module";
import { HeaderModule } from "../header/header.module";


@NgModule({
  declarations: [ServicePagesComponent],
  imports: [
    CommonModule,
    ServicePagesRoutingModule,
    TranslateModule,
    HeaderModule
  ],
  exports: [ServicePagesComponent],
})
export class ServicePagesModule {
}
