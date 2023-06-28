import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NotificationComponent } from "../notification.component";
import { TranslateModule } from "@ngx-translate/core";
import { UiModule } from "../../../../ui-kit/ui.module";
import { NotificationItemComponent } from "../notification-item/notification-item.component";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgbDatepickerModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxMaskModule } from "ngx-mask";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { DateDifference } from "src/app/shared/pipes/date-difference.pipe";

@NgModule({
  declarations: [NotificationComponent, NotificationItemComponent, DateDifference],
  imports: [
    UiModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    InfiniteScrollModule,
    NgbDatepickerModule,
    NgxMaskModule,
    ReactiveFormsModule,
    ScrollingModule,
  ],
  exports: [NotificationComponent],
  providers: [],
})
export class NotificationModule {}
