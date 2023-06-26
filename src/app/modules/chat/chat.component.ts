import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import {ChatFacade} from "./chat.facade";
import {SpecialistFacade} from "../specialists/specialist.facade";
import {BehaviorSubject, delay, Observable, of, Subject, take, takeUntil, tap} from "rxjs";
import {CompanyFacade} from "../company/company.facade";
import {CompanyOrNull} from "../app/interfaces/company.interface";
import {Specialist} from "../specialists/interfaces/specialist.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {AcceptOrDeclineEnum} from "./constants/accept-or-decline.enum";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {ScreenSizeService} from "../app/services/screen-size.service";
import {BottomChatSettings, ChatHelperService} from "../app/services/chat-helper.service";
import {LocalStorageService} from "../app/services/local-storage.service";
import {IConversation} from "./interfaces/conversations";
import {WindowNotificationService} from "../app/services/window-notification.service";

export interface MessageInterface {
  message: string;
  messageStatus?: boolean;
  senderUuid?: string;
  senderFirstName?: string;
  senderLastName?: string;
  recipientUuid: string;
  conversationUuid: string;
  senderLogo: string;
  role: string;
  uuid: string;
  createdAt: Date;
}

export type StringOrNull = string | null;

@Component({
  selector: "hr-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent extends Unsubscribe implements OnDestroy, OnInit, AfterViewInit {
  @Input("scrollToBottom") scrollToBottom!: boolean;
  public chatPopupState = false;
  public isScroll: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public message: string = "";
  public popupName$: BehaviorSubject<StringOrNull> = new BehaviorSubject<StringOrNull>(null);
  public foundSpecialistsUuid!: string;
  public company$: Observable<CompanyOrNull>;
  public specialist$: Observable<any>;
  public isSpecialistAccepted$: BehaviorSubject<boolean | undefined> = new BehaviorSubject<boolean | undefined>(undefined);
  public isSpecialistRejected$: BehaviorSubject<boolean | undefined> = new BehaviorSubject<boolean | undefined>(undefined);
  public messages$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public conversationUuid$!: Observable<string>;
  public currentConversation: IConversation | null = null;
  public openAcceptOrDeclinePopup$!: boolean;
  public AcceptOrDeclineEnum = AcceptOrDeclineEnum;

  @ViewChild("textarea") textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild("chat") chat!: ElementRef;
  @ViewChild("infiniteScroll") infiniteScroll!: ElementRef;
  @ViewChild("button") button!: ElementRef;

  public isHelper!: boolean;
  public openCandidates!: boolean;

  private scrollToIndex$: Subject<MessageInterface[]> = new Subject();

  private allData!: MessageInterface[];
  private allDataCopy!: MessageInterface[];
  private readonly rangeOfMsg: number = 20;
  private currentIndex = 0;
  private start: number = 0;
  private end: number = this.rangeOfMsg;

  public bottomChatSettings: Observable<BottomChatSettings> = of(
    {isOpen: false, isMessagesContent: false}
  );

  public isFirst: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isMsgLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly _chatFacade: ChatFacade,
    private readonly _companyFacade: CompanyFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _renderer: Renderer2,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _screenSizeService: ScreenSizeService,
    private readonly _chatHelperService: ChatHelperService,
    private readonly _localStorage: LocalStorageService,
    private readonly _windowNotificationService: WindowNotificationService
  ) {
    super();
    this.foundSpecialistsUuid = this._route.snapshot.queryParams?.["foundSpecialistUuid"];
    this.company$ = of(JSON.parse(this._localStorage.getItem("company")));
    this.specialist$ = this._specialistFacade.getSpecialist$().pipe(
      takeUntil(this.ngUnsubscribe),
      tap(specialist => {
        this.isSpecialistAcceptedOrRejected(specialist);
      }));
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

  public scroll(event: any) {
    const element = event.target;
    this._chatFacade
      .getChatMessages$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        take(1))
      .subscribe((data) => {
        if (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1) {
          if (this.allData.length <= this.rangeOfMsg && data.length !== this.allData.length) {
            this.setMessages(data);
          }
          this.changeStatus();
        }
      });
  }

  public ngOnInit(): void {
    let isChatOpen: boolean = false;
    this.isMsgLoading$.next(true);
    this.bottomChatSettings = this._chatHelperService.getIsBottomChatOpen()
      .pipe(tap((data) => {
        isChatOpen = data.isOpen;
      }));
    this._chatFacade.getConversation$()
      .pipe(takeUntil(this.ngUnsubscribe),
        tap(data => {
          if (data) {
            this.isFirst.next(true);
            this.currentConversation = data;
            this.conversationUuid$ = of(this.currentConversation?.last_message?.conversationUuid);
            this._chatFacade.emitGetConversationMessagesRequest(
              this.currentConversation?.last_message?.conversationUuid
            );
            this.isMsgLoading$.next(true);
            this._cdr.detectChanges();
          }
        })
      )
      .subscribe();

    this._chatFacade
      .getChatMessages$()
      .pipe(
        delay(500),
        takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        if (isChatOpen && data?.length) {
          this.setMessages(data);
          this.scrollToIndex$.next(data);
          this.isMsgLoading$.next(false);
        }
      });

    this._chatFacade
      .getAcceptOrDeclinePopupStatus$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        this.openAcceptOrDeclinePopup$ = data;
      });
  }

  public ngAfterViewInit(): void {
    this.scrollToIndex$
      .pipe(
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((data) => {
        if (data[data?.length - 1]?.senderUuid === this.currentConversation?.userTwo) {
          if (this.chat.nativeElement.scrollTop + this.chat.nativeElement.clientHeight >=
            this.chat.nativeElement.scrollHeight - 200) {
            this.changeStatus();
            this.chatOpen();
          }
        } else {
          this.changeStatus();
          this.chatOpen();
        }
        if (this.isFirst.value) {
          this.isFirst.next(false);
        }
      });
  }

  private setMessages(data: MessageInterface[]): void {
    this.currentIndex = 0;
    this.allData = [...data];
    this.allDataCopy = [...this.allData];
    if (this.allDataCopy.length - this.rangeOfMsg - 1 > 0) {
      this.messages$.next([...this.allDataCopy.splice(this.allDataCopy.length - this.rangeOfMsg - 1,
        this.allDataCopy.length - 1)]);
    } else {
      this.messages$.next([...this.allDataCopy]);
    }
  }

  public get isUnreadMsgStatus() {
    const conversations = this._chatFacade.getConversations();
    const currentConversation = conversations.filter(item =>
      item.last_message.conversationUuid === this.currentConversation?.last_message.conversationUuid);
    if (currentConversation?.length
      && currentConversation[0].last_message.senderUuid
      && currentConversation[0].last_message.senderUuid !== currentConversation[0].userOne
    ) {
      return !currentConversation[0]?.last_message?.messageStatus;
    }
    return false;
  }

  private changeStatus(): void {
    const conversations = this._chatFacade.getConversations();
    if (this.currentConversation?.last_message.conversationUuid) {
      const currentConversationIndex = conversations.findIndex(item =>
        item.last_message.conversationUuid === this.currentConversation?.last_message.conversationUuid);

      if (!conversations[currentConversationIndex]?.last_message?.messageStatus) {

        if (currentConversationIndex > -1) {
          conversations[currentConversationIndex].last_message.messageStatus = true;
          this.currentConversation.last_message.messageStatus = true;
          this._chatFacade.setConversations(conversations);
        }

        const unreadConversations = conversations.filter((item) =>
          !item?.last_message?.messageStatus
          && !!item.last_message.senderUuid
        );

        if (unreadConversations?.length) {
          this._chatFacade.setIsUnreadMessage(true);
        } else {
          this._chatFacade.setIsUnreadMessage(false);
        }

        this._windowNotificationService.createNotification("", unreadConversations.length);

        this._chatFacade.updateConversationMessage(this.currentConversation?.last_message?.messageUuid, {
          status: true,
        });
      }
    }
  }

  public senderLogo(): Observable<string> {
    return this._companyFacade.getCompanyLogo$();
  }

  public isSpecialistAcceptedOrRejected(specialist: Specialist): void {
    this.isSpecialistAccepted$.next(
      !!(specialist?.found_specialist_for_company_succeed &&
        specialist?.found_specialist_for_company_succeed.length)
    );
    this.isSpecialistRejected$.next(
      !!(specialist?.found_specialist_for_company_rejected &&
        specialist?.found_specialist_for_company_rejected.length)
    );
  }

  public agreeAction(): void {
    this._chatFacade.setAcceptOrDeclinePopupStatus$(true);
    this.popupName$.next(AcceptOrDeclineEnum.ACCEPTED);
  }

  public refuseAction(): void {
    this._chatFacade.setAcceptOrDeclinePopupStatus$(true);
    this.popupName$.next(AcceptOrDeclineEnum.REJECTED);
  }

  public closePopup(): void {
    // this._chatFacade.setChatPopupStatus(false);
    this._chatFacade.setAcceptOrDeclinePopupStatus$(false);
    this.popupName$.next(null);
  }

  public acceptOrDecline(event: { reason: string; type: AcceptOrDeclineEnum }): void {
    this.closePopup();
    this._chatFacade.setIsAvailableAfterAcceptOrReject(false);
    if (event.type === AcceptOrDeclineEnum.ACCEPTED) {
      this.isSpecialistAccepted$.next(true);
    } else {
      this.isSpecialistRejected$.next(true);
    }

    if (this.currentConversation) {
      this.foundSpecialistsUuid = this.currentConversation["other_info"]?.foundSpecialistUuid;
      this._chatFacade
        .acceptOrDeclineSpecialistRequest(event.type, this.foundSpecialistsUuid, event.reason)
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
    this._chatHelperService.isBottomChatOpen$.next({
      isOpen: false,
      isMessagesContent: false,
    });
    this._chatFacade.destroyGetCompanyConversationUuidHandler();
    this._chatFacade.destroyGetMessageFromSpecialistToCompanyHandler();
  }

  public closeChatOnBottom() {
    this._chatFacade.destroyGetCompanyConversationUuidHandler();
    this._chatFacade.destroyGetMessageFromSpecialistToCompanyHandler();
  }

  public chatOpen(): void {
    if (!!this.chat) {
      setTimeout(() => {
        this.currentIndex = 0;
        this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
      });
    }
  }

  public openChatInfo() {
    this.openCandidates = true;
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

  public scrollToBottomForSend(): void {
    this._renderer.listen(this.button.nativeElement, "click", (_) => {
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    });
  }

  public scrollToBottomForEnterSend(): void {
    this._renderer.listen(this.textarea.nativeElement, "keydown.enter", (_) => {
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    });
  }

  public onKeydown(
    event: KeyboardEvent,
    company: CompanyOrNull,
    specialist: Specialist,
    conversationUuid: string | null | undefined
  ) {
    if (event.key === "Enter" && !event.shiftKey && !!conversationUuid && !!this.message.trim().length) {
      this.sendMessageAction(company, specialist, conversationUuid);
      event.preventDefault();
    }
  }

  public sendMessageAction(
    company: CompanyOrNull,
    specialist: Specialist,
    conversationUuid: string | null | undefined
  ): void {
    if (!!conversationUuid) {
      this.mappengDataBeforeSendMessage(company, specialist, conversationUuid);
      this.scrollToBottomForSend();
    }
  }

  private mappengDataBeforeSendMessage(company: CompanyOrNull, specialist: Specialist, conversationUuid: string) {
    this._chatFacade.setChatMessage({
      message: this.message,
      messageStatus: true,
      role: "company",
      senderUuid: company?.uuid,
      senderFirstName: company?.name,
      senderLastName: company?.name,
      recipientUuid: specialist?.uuid,
      senderLogo: "",
      uuid: "",
      conversationUuid: conversationUuid,
      createdAt: new Date(),
    });

    this.message = "";
    this.textarea.nativeElement.style.height = "31px";
    setTimeout(() => {
      this.currentIndex = 0;
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    });
  }

  public ngOnDestroy(): void {
    this._chatFacade.destroyGetCompanyConversationUuidHandler();
    this.unsubscribe();
  }
}
