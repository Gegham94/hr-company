import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { BehaviorSubject, Observable, Subject, takeUntil } from "rxjs";
import { Conversation } from "../../interfaces/conversations";
import { ChatFacade } from "../../chat.facade";
import { AcceptOrDeclineEnum } from "../../constants/accept-or-decline.enum";
import { Message } from "../../interfaces/messages";
import { CompanyFacade } from "src/app/modules/company/services/company.facade";
import { SpecialistFacade } from "src/app/modules/specialists/services/specialist.facade";
import { BottomChatSettings } from "src/app/shared/services/chat-helper.service";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ICompany } from "src/app/shared/interfaces/company.interface";

export type StringOrNull = string | null;

@Component({
  selector: "hr-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesComponent extends Unsubscribe implements OnDestroy, AfterViewInit {
  @Input() scrollToBottom!: boolean;

  @Input() set messages(value: Message[]) {
    this._allMessages = value;
    this.scrollToIndex$.next(value);
  }

  @Input() selectedConversation!: Conversation | null;
  @Input() isLoading: boolean = true;

  public company = this._companyFacade.getCompanyData();
  public messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  public message: string = "";

  public popupName$: BehaviorSubject<StringOrNull> = new BehaviorSubject<StringOrNull>(null);
  public AcceptOrDeclineEnum = AcceptOrDeclineEnum;

  @ViewChild("textarea") textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild("chat") chat!: ElementRef;
  @ViewChild("button") button!: ElementRef;

  public isHelper!: boolean;
  public openCandidates!: boolean;

  public chatSettings: Observable<BottomChatSettings> = this._chatFacade.getChatSettings();

  private _allMessages!: Message[];
  private readonly rangeOfMsg: number = 20;
  private scrollToIndex$: Subject<Message[]> = new Subject();
  private allData!: Message[];
  private allDataCopy!: Message[];
  private currentIndex = 0;
  private start: number = 0;
  private end: number = this.rangeOfMsg;

  constructor(
    private readonly _chatFacade: ChatFacade,
    private readonly _companyFacade: CompanyFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
  }

  onScrollUp() {
    if (this.allData.length - this.currentIndex * this.rangeOfMsg > 0) {
      this.currentIndex++;
      this.end = this.allData.length - this.currentIndex * this.rangeOfMsg;
      this.start =
        this.allData.length - this.currentIndex * this.rangeOfMsg - this.rangeOfMsg < 0
          ? 0
          : this.allData.length - this.currentIndex * this.rangeOfMsg - this.rangeOfMsg;
      const allDataCopy = [...this.allData];
      this.messages$.next([...allDataCopy.slice(this.start, this.end), ...this.messages$.value]);
    }
  }

  public scroll(event: any): void {
    const element = event.target;
    if (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1) {
      if (this._allMessages.length !== this.allData.length) {
        const newMessages = this._allMessages.slice(this.allData.length, this._allMessages.length);
        this.messages$.next([...this.messages$.value, ...newMessages]);
        this.allData = this._allMessages;
        this.openChat();
      }
      this.changeStatus();
    }
  }

  public ngAfterViewInit(): void {
    this.scrollToIndex$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      const lastData = data[data?.length - 1];
      const isLastDataFromUserTwo = lastData?.senderUuid === this.selectedConversation?.userTwo;
      const isScrolledToBottom =
        this.chat.nativeElement.scrollTop + this.chat.nativeElement.clientHeight >=
        this.chat.nativeElement.scrollHeight - 200;
      if (isLastDataFromUserTwo) {
        if (isScrolledToBottom) {
          this.setMessages(data);
          this.changeStatus();
          this.allData = this._allMessages;
          this.openChat();
        }
      } else {
        this.setMessages(data);
        this.changeStatus();
        this.allData = this._allMessages;
        this.openChat();
      }
    });
  }

  private setMessages(data: Message[]): void {
    this.currentIndex = 0;
    this.allData = [...data];
    this.allDataCopy = [...this.allData];
    if (this.allDataCopy.length - this.rangeOfMsg - 1 > 0) {
      this.messages$.next([
        ...this.allDataCopy.splice(this.allDataCopy.length - this.rangeOfMsg - 1, this.allDataCopy.length - 1),
      ]);
    } else {
      this.messages$.next([...this.allDataCopy]);
    }
  }

  private changeStatus(): void {
    const conversations = this._chatFacade.getConversations();
    if (this.selectedConversation?.last_message.conversationUuid) {
      if (!this.selectedConversation?.last_message?.messageStatus) {
        this.selectedConversation.setUpdateStatus(false);
        this._chatFacade
          .updateConversationMessage(this.selectedConversation?.last_message?.messageUuid, {
            status: true,
          })
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe();
      }
    }
    this._chatFacade.setConversations(conversations);
    this._cdr.markForCheck();
  }

  public agreeAction(): void {
    this.popupName$.next(AcceptOrDeclineEnum.ACCEPTED);
    this._chatFacade.openAcceptOrRejectModal$.next();
  }

  public refuseAction(): void {
    this.popupName$.next(AcceptOrDeclineEnum.REJECTED);
    this._chatFacade.openAcceptOrRejectModal$.next();
  }

  public acceptOrDecline(event: { reason: string; type: AcceptOrDeclineEnum }): void {
    if (event.type === AcceptOrDeclineEnum.ACCEPTED) {
      this.selectedConversation?.setChangeInterviewStatus(AcceptOrDeclineEnum.ACCEPTED);
    } else {
      this.selectedConversation?.setChangeInterviewStatus(AcceptOrDeclineEnum.REJECTED);
    }

    this._chatFacade.setSelectedConversation$(this.selectedConversation);

    if (this.selectedConversation) {
      const foundSpecialistUuid = this.selectedConversation?.other_info.foundSpecialistUuid;
      this._chatFacade
        .acceptOrDeclineSpecialistRequest(event.type, foundSpecialistUuid, event.reason)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.popupName$.next(null);
        });
    }
  }

  public get popupName(): StringOrNull {
    return this.popupName$.value;
  }

  public msgLength(): number {
    return this.message?.length;
  }

  public closeChat() {
    this._chatFacade.setChatSettings({
      isOpen: false,
      isMessagesContent: false,
    });
  }

  public openChat(): void {
    if (!!this.chat) {
      setTimeout(() => {
        this.messagesScrollToBottom();
      });
    }
  }

  public openChatInfo(conversation: Conversation | null): void {
    this._specialistFacade.openCandidatesModal$.next({
      isHelper: true,
      specialist: {
        name: conversation ? conversation.specialist.name : "",
        surname: conversation ? conversation.specialist.surname : "",
        vacancy: conversation ? conversation.other_info.name : "",
      },
    });
    this.isHelper = true;
  }

  public closeChatInfo() {
    this.openCandidates = false;
    this.isHelper = false;
  }

  public auto_grow() {
    this.textarea.nativeElement.style.height = "31px";
    this.textarea.nativeElement.style.height = `${this.textarea.nativeElement.scrollHeight}px`;
  }

  private messagesScrollToBottom(): void {
    this.currentIndex = 0;
    this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
  }

  public onKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey && !!this.message.trim().length) {
      this.sendMessageAction();
      event.preventDefault();
    }
  }

  public sendMessageAction(): void {
    if (this.selectedConversation && this.company) {
      this.mappingDataBeforeSendMessage(
        this.company,
        this.selectedConversation?.specialist.uuid,
        this.selectedConversation?.last_message.conversationUuid
      );
      this.messagesScrollToBottom();
    }
  }

  private mappingDataBeforeSendMessage(company: ICompany, recipientUuid: string, conversationUuid: string): void {
    const message = new Message({
      message: this.message,
      messageStatus: true,
      role: "company",
      senderUuid: company.uuid,
      senderFirstName: company.name,
      senderLastName: company.name,
      recipientUuid: recipientUuid,
      senderLogo: "",
      uuid: "",
      conversationUuid: conversationUuid,
      createdAt: new Date(),
    }).setPosition(true);

    this._chatFacade.setChatMessage(message);

    this.message = "";
    this.textarea.nativeElement.style.height = "31px";
    setTimeout(() => {
      this.messagesScrollToBottom();
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
