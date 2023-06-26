import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { NotificationComponent } from "./notification/notification.component";
import { TranslateModule } from "@ngx-translate/core";
import { UiModule } from "../../../ui-kit/ui.module";
import {
  ChatNotificationItemComponent
} from "./chat-notification/chat-notification-item/chat-notification-item.component";
import { NotificationItemComponent } from "./notification/notification-item/notification-item.component";
import { DateDifference } from "../../app/pipes/date-difference.pipie";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import { BalanceNotificationComponent } from "./balance-notification/balance-notification.component";
import {NgbDatepickerModule} from "@ng-bootstrap/ng-bootstrap";
import {NgxMaskModule} from "ngx-mask";
import { ScrollingModule } from "@angular/cdk/scrolling";

@NgModule({
  declarations: [
    NotificationComponent,
    ChatNotificationItemComponent,
    NotificationItemComponent,
    DateDifference,
    BalanceNotificationComponent
  ],
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
    exports: [
        NotificationComponent,
        ChatNotificationItemComponent,
        BalanceNotificationComponent
    ],
	providers: []
})
export class NotificationsModule {

}
