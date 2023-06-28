import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ChatFacade } from "./chat.facade";
import { Conversation } from "./interfaces/conversations";
import { IMessage, Message } from "./interfaces/messages";
import { delay, shareReplay, take, takeUntil, tap } from "rxjs";
import { CompanyFacade } from "../company/services/company.facade";
import { Unsubscribe } from "../../shared/unsubscriber/unsubscribe";
import { WindowNotificationService } from "../../shared/services/window-notification.service";

export type StringOrNull = string | null;

@Component({
  selector: "hr-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent extends Unsubscribe implements OnDestroy, OnInit {
  public selectedConversation$ = this._chatFacade.getSelectedConversation$().pipe(shareReplay(1));

  private selectedConversation!: Conversation | null;

  public getIsChatOpen$ = this._chatFacade.getChatSettings();

  public isMessagesLoading: boolean = true;

  private _messages: Message[] = [];
  private _conversations: Conversation[] = [];

  public get messages(): Message[] {
    return this._messages;
  }

  public set messages(value: Message[]) {
    this._messages = [...value];
  }

  public get conversations(): Conversation[] {
    return this._conversations;
  }

  public set conversations(value: Conversation[]) {
    this._conversations = [...value];
  }
  constructor(
    private readonly _chatFacade: ChatFacade,
    private readonly _companyFacade: CompanyFacade,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _windowNotificationService: WindowNotificationService
  ) {
    super();
  }

  public ngOnInit(): void {
    this._chatFacade
      .getConversations$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.conversations = res;
        this._cdr.markForCheck();
      });

    this._chatFacade
      .getChatMessages$()
      .pipe(takeUntil(this.ngUnsubscribe), delay(200))
      .subscribe((res) => {
        this.messages = res;
        this.isMessagesLoading = false;
        this._cdr.markForCheck();
      });

    this._chatFacade
      .getConversationsRequest()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((conversations) => {
        if (conversations?.length) {
          this.isUnreadConversations(conversations);
        }
      });

    this.selectedConversation$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((selectedConversation) => {
      if (selectedConversation) {
        this.isMessagesLoading = true;
        this.selectedConversation = selectedConversation;
        this._chatFacade
          .emitGetConversationMessagesRequest(selectedConversation.last_message.conversationUuid)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((messages) => {
            const companyUuid = this._companyFacade.getCompanyData().uuid;
            const modifiedMessages = messages
              .filter((message) => message.senderUuid)
              .map((message: IMessage) => {
                const isMyMessage = message.senderUuid === companyUuid;
                return new Message(message).setPosition(isMyMessage);
              });
            this._chatFacade.addChatMessage(modifiedMessages);
          });
      }
    });

    this._chatFacade
      .getMessageFromSpecialistToCompanyHandler$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((message: IMessage) => {
          const conversations = this._chatFacade.getConversations();
          const conversation = conversations?.find(
            (item) => item.last_message?.conversationUuid === message.conversationUuid
          );

          if (conversation) {
            conversation.setUpdateLastMessage(
              message.senderUuid ?? "",
              message.message,
              message?.uuid,
              message.createdAt as string,
              false
            );

            const rearrangedConversations = this._chatFacade.rearrangeConversation(conversations);

            if (rearrangedConversations) {
              this._chatFacade.setConversations(rearrangedConversations);
              rearrangedConversations[0].setUpdateStatus(true);
            }

            const newMessage = new Message(message).setPosition(false);
            if (
              conversation.last_message.conversationUuid === this.selectedConversation?.last_message.conversationUuid
            ) {
              this._chatFacade.addChatMessage(newMessage);
            }
          }
        })
      )
      .subscribe();
  }

  public isUnreadConversations(conversations: Conversation[]): boolean {
    const unreadConversations = conversations.filter((item) => item.hasUpdate);
    this._windowNotificationService.createNotification("", unreadConversations.length);
    return !!unreadConversations.length;
  }

  public toggleChatState(): void {
    this.getIsChatOpen$
      .pipe(
        take(1),
        tap((data) => {
          this._chatFacade.setChatSettings({
            isOpen: !data.isOpen,
            isMessagesContent: false,
          });
          this._cdr.markForCheck();
        })
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
