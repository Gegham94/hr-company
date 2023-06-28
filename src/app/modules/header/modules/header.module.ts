import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeaderComponent } from "../header.component";
import { ClickOutsideModule } from "ng-click-outside";
import { RouterModule } from "@angular/router";
import { UiModule } from "../../../ui-kit/ui.module";
import { TranslateModule } from "@ngx-translate/core";
import { NotificationModule } from "../notification/modules/notification.module";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { TariffModalComponent } from '../tariff-modal/tariff-modal.component';

@NgModule({
  declarations: [HeaderComponent, TariffModalComponent],
  exports: [HeaderComponent],
  imports: [
    CommonModule,
    ClickOutsideModule,
    UiModule,
    RouterModule,
    NotificationModule,
    TranslateModule,
    InfiniteScrollModule,
    ScrollingModule,
  ],
})
export class HeaderModule {}
