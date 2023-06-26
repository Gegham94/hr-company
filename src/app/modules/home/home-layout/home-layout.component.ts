import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import {AuthService} from "../../auth/auth.service";
import {NavigateButtonFacade} from "../../../ui-kit/navigate-button/navigate-button.facade";
import {Router, Scroll} from "@angular/router";
import {HomeLayoutState} from "./home-layout.state";
import {BehaviorSubject, Observable, of, switchMap, takeUntil, tap} from "rxjs";
import {CompanyFacade} from "../../company/company.facade";
import {VacancyFacade} from "../../vacancy/vacancy.facade";
import {SpecialistFacade} from "../../specialists/specialist.facade";
import {NavigateButton} from "./home-layout.interface";
import {LocalStorageService} from "../../app/services/local-storage.service";
import {CompanyInterface} from "../../app/interfaces/company.interface";
import {RobotHelperService} from "../../app/services/robot-helper.service";
import {RobotHelper} from "../../app/interfaces/robot-helper.interface";
import {Unsubscribe} from "src/app/shared-modules/unsubscriber/unsubscribe";
import {ChatFacade} from "../../chat/chat.facade";
import {BottomChatSettings, ChatHelperService} from "../../app/services/chat-helper.service";
import {CompanyState} from "../../company/company.state";
import {IConversation} from "../../chat/interfaces/conversations";
import {MessageInterface} from "../../chat/chat.component";
import {SocketService} from "../../chat/socket.service";
import {WindowNotificationService} from "../../app/services/window-notification.service";
import {ChatState} from "../../chat/chat.state";
import {SignInFacade} from "../../auth/signin/signin.facade";
import {RedirectUrls} from "../../app/constants/redirectRoutes.constant";
import {BalanceService} from "../../balance/balance.service";

@Component({
  selector: "hr-home-layout",
  templateUrl: "./home-layout.component.html",
  styleUrls: ["./home-layout.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeLayoutComponent extends Unsubscribe implements OnInit, OnDestroy {
  public navigations = this._navigateButtonFacade.getShowedNavigationsMenu$();
  public notificationCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public isRobotOpen$: Observable<boolean> = this._robotHelperService.getIsRobotOpen();
  public robotSettings$: Observable<RobotHelper> = this._robotHelperService.getRobotSettings();
  public robotMapInfo: string = "";
  public company$ = this._companyFacade.getCompanyData$();
  public buttonsStatuses = this._homeLayoutState.getButtonsStatuses();
  public slideActiveId: number = 0;
  public itemWidth: number = 250;
  public isCompletedVacancyCreate!: boolean;
  public isCompletedVacancyCreate$ = this._vacancyFacade.isCompletedVacancyCreate().subscribe((data) => {
    this.isCompletedVacancyCreate = data;
  });

  public company!: CompanyInterface;

  public readonly isModalOpened: Observable<boolean> = this._chatFacade.getCandidatesPopupStatus$();
  public readonly isChatOpened: Observable<boolean> = this._chatFacade.getChatPopupStatus$();
  public readonly isLoader$: Observable<boolean> = this._signInFacade.getIsLoader$();

  @ViewChildren("slickItem") slickItem!: QueryList<ElementRef<HTMLDivElement>>;

  public bottomChatStateSettings: Observable<BottomChatSettings> =
    this._chatHelperService.getIsBottomChatOpen()
    .pipe(tap(data => {
      this.isChat = data.isOpen;
    }));

  public conversations$: Observable<IConversation[]> = this._chatFacade.getConversations$();
  public isUnreadMessage$: Observable<boolean> = this._chatFacade.getIsUnreadMessage();

  public isChat: boolean = false;

  public slideConfig = {
    slidesToShow: 5,
    slidesToScroll: 5,
    infinite: false,
    speed: 200,
    responsive: [
      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          arrows: true,
          prevArrow: "<img class='a-left control-c prev slick-prev' src='./assets/img/icon/prev.svg' alt='prev'>",
          nextArrow: "<img class='a-right control-c next slick-next' src='./assets/img/icon/next.svg' alt='next'>",
          infinite: false,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          prevArrow: "<img class='a-left control-c prev slick-prev' src='./assets/img/icon/prev.svg' alt='prev'>",
          nextArrow: "<img class='a-right control-c next slick-next' src='./assets/img/icon/next.svg' alt='next'>",
          infinite: false,
        },
      },
    ],
  };

  public afterChange(e: { slick: { activeBreakpoint: number }; currentSlide: number }): void {
    if (e.slick.activeBreakpoint === 1500) {
      e.currentSlide > 2 ? (this.slideActiveId = 1) : (this.slideActiveId = 0);
    } else {
      this.slideActiveId = e.currentSlide;
    }
  }

  constructor(
    private readonly _authService: AuthService,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _companyFacade: CompanyFacade,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly cdr: ChangeDetectorRef,
    private readonly _router: Router,
    private readonly _localStorage: LocalStorageService,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _chatHelperService: ChatHelperService,
    private readonly _chatFacade: ChatFacade,
    private readonly _companyState: CompanyState,
    private readonly _socketService: SocketService,
    private readonly _windowNotificationService: WindowNotificationService,
    private readonly _chatState: ChatState,
    private readonly _signInFacade: SignInFacade,
    private readonly _balanceService: BalanceService
  ) {
    super();
    this._windowNotificationService.askPermission();
  }

  public get isBalancePage() {
    return this._router.url === "/balance";
  }

  public ngOnInit(): void {
    this._socketService.setSocket(this._authService.getToken || "");
    this._companyFacade.setCompanyData$()
      .pipe(takeUntil(this.ngUnsubscribe),
        switchMap((company: CompanyInterface) => {
          if (this._localStorage.getItem("tariffUuid")) {
            const uuid = JSON.parse(this._localStorage.getItem("tariffUuid"));
            if (company && company?.helper && uuid) {
              for (let i = 0; i < RedirectUrls.length; i++) {
                for (let k = 0; k < company.helper.length; k++) {
                  if (company.helper[k].link === RedirectUrls[i][0] + "/isActive") {
                    if (!Boolean(company.helper[k].hidden)) {
                      return this._balanceService.buyTariff(uuid, RedirectUrls[i][1]).pipe(
                        tap((payment) => {
                          window.location.replace(payment["robokassa_url"]);
                        })
                      );
                    } else {
                      return this._balanceService.buyTariff(uuid).pipe(
                        tap((payment) => {
                          window.location.replace(payment["robokassa_url"]);
                        })
                      );
                    }
                  }
                }
              }
              return of(null);
            }
            return of(null);
          } else {
            this._signInFacade.setLoader(false);
            return of(null);
          }
        })
      ).subscribe((data) => {
        if (data) {
          this._localStorage.removeData("tariffUuid");
        }
      }
    );


    this._router.events.subscribe((navigation) => {
        if (navigation instanceof Scroll) {
          this.company$
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
              if (Object.keys(data).length) {
                this.getConversations();
              }
            });
        }
      }
    );

    this._chatFacade.getConversations$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(data => {
        this.conversations$ = of(data);
      });

    this._chatFacade.getMessageFromCompanyToSpecialistHandler$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((message: MessageInterface) => {
          const conversations = this._chatFacade.getConversations();
          const index = conversations?.findIndex(item =>
            item.last_message?.conversationUuid === message.conversationUuid);
          if (conversations && index > -1) {
            const unread_conversation = {...conversations[index]};
            conversations?.splice(index, 1);
            conversations.unshift(unread_conversation);
            conversations[0].last_message.messageStatus = false;
            conversations[0].last_message.messageUuid = message?.uuid;
            conversations[0].last_message.message = message?.message;
            conversations[0].last_message.senderUuid = message?.senderUuid ?? "";
          }
          this._chatState.setChatMessage(message);
          return of(conversations);
        }),
      )
      .subscribe((conversations) => {
        if (conversations) {
          const unreadConversations =
            conversations.filter((item) => !item.last_message.messageStatus && !!item.last_message.senderUuid);
          if (unreadConversations.length) {
            this._chatFacade.setIsUnreadMessage(true);
          } else {
            this._chatFacade.setIsUnreadMessage(false);
          }
          this._windowNotificationService.createNotification(
            conversations[0].last_message.message,
            unreadConversations.length
          );
          this.conversations$ = of(conversations);
          this._chatFacade.setConversations(conversations);
        }
      });


    this._specialistFacade.updateSpecialistsNotificationCount();
    this._homeLayoutState.isNavigationButtonsUpdate().subscribe(() => {
      if (this._localStorage.getItem("company")) {
        this.company = JSON.parse(this._localStorage.getItem("company"));
        if (this.company?.logo) {
          this._companyState.setCompanyLogo$(this.company.logo);
        }
      }
      this.company?.helper?.forEach((page) => {
        const button = this.buttonsStatuses.find((btn: NavigateButton) => btn["link"] === page["link"]);
        if (button) {
          button.status = page["hidden"];
        }
      });
      this.cdr.detectChanges();
    });

    this._specialistFacade.getSpecialistsNotificationCount$().subscribe((data: number) => {
      if (data) {
        this.notificationCount.next(data);
      }
    });
  }

  private getConversations() {
    this._chatFacade
      .emitGetConversationsRequest()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((conversations) => {
        // this.conversations$ = of([]);
        if (!!conversations && conversations?.length) {
          const unreadConversations =
            conversations.filter((item) => !item.last_message.messageStatus && !!item.last_message.senderUuid);
          if (unreadConversations.length) {
            this._chatFacade.setIsUnreadMessage(true);
          } else {
            this._chatFacade.setIsUnreadMessage(false);
          }
          this._windowNotificationService.createNotification("", unreadConversations.length);
          this._chatFacade.setConversations(conversations);
          this.conversations$ = of(conversations);
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  public get isLogged(): boolean {
    return !!this._authService.getToken && this._authService.isTokenExpired;
  }

  public openRobot(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
    const width = (this.slickItem.first.nativeElement as HTMLDivElement).style.width;
    this.itemWidth = +width.slice(0, width.length - 2);
    this._robotHelperService.isRobotOpen$.next(true);
  }

  public openChat(): void {
    this.isChat = !this.isChat;
    this._chatFacade.setConversation(null);
    if (this.isChat) {
      this._chatHelperService.isBottomChatOpen$.next({
        isOpen: true,
        isMessagesContent: false,
        isConversationNeedSort: true
      });
    } else {
      this._chatHelperService.isBottomChatOpen$.next({
        isOpen: false,
        isMessagesContent: false,
        isConversationNeedSort: true
      });
    }
  }
}
