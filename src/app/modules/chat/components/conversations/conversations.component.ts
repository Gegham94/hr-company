import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { BehaviorSubject, takeUntil } from "rxjs";
import { Conversation } from "../../interfaces/conversations";
import { ChatFacade } from "../../chat.facade";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { WindowNotificationService } from "src/app/shared/services/window-notification.service";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "hr-conversations",
  templateUrl: "./conversations.component.html",
  styleUrls: ["./conversations.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationsComponent extends Unsubscribe implements OnDestroy {
  @Input() conversations!: Conversation[];

  public selectedSpecialistUuid: BehaviorSubject<string> = new BehaviorSubject<string>("");

  get screenSize(): ScreenSizeType {
    return this._screenSizeService.calcScreenSize;
  }

  get virtualContainerHeight(): number {
    return this.screenSize === "DESKTOP" ? 350 : window.innerHeight - 55;
  }

  get virtualScrollItemSize(): number {
    return this.screenSize === "EXTRA_SMALL" ? 41 : 41;
  }

  constructor(
    private readonly _chatFacade: ChatFacade,
    private readonly _screenSizeService: ScreenSizeService,
    private readonly _windowNotificationService: WindowNotificationService,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this._chatFacade
      .getSelectedConversation$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((conversation) => {
        if (conversation) {
          if (conversation.last_message.senderUuid) {
            conversation.setUpdateStatus(false);
          }
          this.selectedSpecialistUuid.next(conversation.other_info.foundSpecialistUuid);
          this._cdr.markForCheck();
        }
      });
  }

  public inviteSpecialistInChatAction(conversation: Conversation): void {
    if (!conversation.last_message?.messageStatus) {
      conversation.setUpdateStatus(false);
      this._chatFacade
        .updateConversationMessage(conversation?.last_message?.messageUuid, {
          status: true,
        })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe();
    }
    this.checkUnreadConversations(this.conversations);
    this._chatFacade.setSelectedConversation$(conversation);
    this._chatFacade.setChatSettings({
      isOpen: true,
      isMessagesContent: true,
    });
  }

  private checkUnreadConversations(conversations: Conversation[]): void {
    const unreadConversations = conversations.filter((item) => item.hasUpdate);
    this._windowNotificationService.createNotification("", unreadConversations.length);
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
