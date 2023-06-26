import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HeaderComponent } from "./header.component";
import { ClickOutsideModule } from "ng-click-outside";
import { RouterModule } from "@angular/router";
import { UiModule } from "../../ui-kit/ui.module";
import { TranslateModule } from "@ngx-translate/core";
import { NotificationsModule } from "./notifications/notifications.module";
import { ChatNotificationComponent } from "./notifications/chat-notification/chat-notification.component";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {ScrollingModule} from "@angular/cdk/scrolling";

@NgModule({
  declarations: [
    HeaderComponent,
    ChatNotificationComponent
  ],
  exports: [
    HeaderComponent
  ],
    imports: [
        CommonModule,
        ClickOutsideModule,
        UiModule,
        RouterModule,
        NotificationsModule,
        TranslateModule,
        InfiniteScrollModule,
        ScrollingModule
    ]
})
export class HeaderModule {

}
