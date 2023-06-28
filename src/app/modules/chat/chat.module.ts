import {NgModule} from "@angular/core";
import {ChatComponent} from "./chat.component";
import {UiModule} from "../../ui-kit/ui.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {ChatOpenModalComponent} from "./components/chat-open-modal/chat-open-modal.component";
import {ConfirmationModalsComponent} from "../../ui-kit/confirmation-modals/confirmation-modals.component";
import {ConversationsComponent} from "./components/conversations/conversations.component";
import {MessagesComponent} from "./components/messages/messages.component";
import {TooltipModule} from "ng2-tooltip-directive-ng13fix";
import {AcceptOrDeclineComponent} from "./components/accept-or-decline/accept-or-decline.component";

@NgModule({
  declarations: [
    ChatComponent,
    ChatOpenModalComponent,
    ConfirmationModalsComponent,
    ConversationsComponent,
    MessagesComponent,
    AcceptOrDeclineComponent,
  ],
    imports: [
        UiModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        ScrollingModule,
        InfiniteScrollModule,
        TooltipModule,
        ReactiveFormsModule
    ],
  exports: [
    ChatComponent,
    ChatOpenModalComponent,
    ConfirmationModalsComponent
  ],
  providers: []
})
export class ChatModule {

}
