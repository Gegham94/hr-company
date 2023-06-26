import {NgModule} from "@angular/core";
import {ChatComponent} from "./chat.component";
import {UiModule} from "../../ui-kit/ui.module";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {ChatOpenModalComponent} from "./chat-open-modal/chat-open-modal.component";
import {ConfirmationModalsComponent} from "../../ui-kit/confirmation-modals/confirmation-modals.component";

@NgModule({
  declarations: [
    ChatComponent,
    ChatOpenModalComponent,
    ConfirmationModalsComponent
  ],
  imports: [
    UiModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    ScrollingModule,
    InfiniteScrollModule,
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
