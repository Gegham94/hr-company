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
import {AuthService} from "../../auth/service/auth.service";
import {NavigateButtonFacade} from "../../../ui-kit/navigate-button/navigate-button.facade";
import {Router} from "@angular/router";
import {HomeLayoutState} from "./home-layout.state";
import {BehaviorSubject, Observable, of, switchMap, takeUntil, tap} from "rxjs";
import {CompanyFacade} from "../../company/services/company.facade";
import {LocalStorageService} from "../../../shared/services/local-storage.service";
import {ICompany} from "../../../shared/interfaces/company.interface";
import {RobotHelperService} from "../../../shared/services/robot-helper.service";
import {RobotHelper} from "../../../shared/interfaces/robot-helper.interface";
import {Unsubscribe} from "src/app/shared/unsubscriber/unsubscribe";
import {ChatFacade} from "../../chat/chat.facade";
import {ChatHelperService} from "../../../shared/services/chat-helper.service";
import {CompanyState} from "../../company/services/company.state";
import {SocketService} from "../../chat/socket.service";
import {WindowNotificationService} from "../../../shared/services/window-notification.service";
import {ChatState} from "../../chat/chat.state";
import {SignInFacade} from "../../auth/signin/services/signin.facade";
import {RedirectUrls} from "../../../shared/constants/redirectRoutes.constant";
import {BalanceService} from "../../balance/services/balance.service";
import {VacancyFacade} from "../../vacancy/services/vacancy.facade";
import {SpecialistFacade} from "../../specialists/services/specialist.facade";
import {BalanceFacade} from "../../balance/services/balance.facade";

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

  public company!: ICompany;

  public readonly isModalOpened: Observable<boolean> = this._chatFacade.getCandidatesPopupStatus$();
  public readonly isChatOpened: Observable<boolean> = this._chatFacade.getChatPopupStatus$();
  public readonly isLoader$: Observable<boolean> = this._signInFacade.getIsLoader$();

  @ViewChildren("slickItem") slickItem!: QueryList<ElementRef<HTMLDivElement>>;

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
    private readonly _balanceService: BalanceService,
    private readonly _balanceFacade: BalanceFacade,
    private readonly _specialistsFacade: SpecialistFacade
  ) {
    super();
    this._windowNotificationService.askPermission();
  }

  public get isBalancePage() {
    return this._router.url === "/balance";
  }

  public ngOnInit(): void {
    this.getTariffInfo();
    this._socketService.setSocket(this._authService.getToken || "");
    this._companyFacade.setCompanyData$().pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((company: ICompany) => {
          if (this._localStorage.getItem("tariffUuid")) {
            const uuid = JSON.parse(this._localStorage.getItem("tariffUuid"));
            if (company && company?.helper && uuid) {
              for (let i = 0; i < RedirectUrls.length; i++) {
                for (let k = 0; k < company.helper.length; k++) {
                  if (company.helper[k].link === RedirectUrls[i][0] + "/isActive") {
                    const url = !Boolean(company.helper[k].hidden) ? RedirectUrls[i][1] : undefined;
                    return this._balanceService.buyTariff(uuid, url).pipe(
                      tap((payment) => {
                        window.location.replace(payment.robokassa_url);
                      })
                    );
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
      )
      .subscribe((data) => {
        if (data) {
          this._localStorage.removeData("tariffUuid");
        }
      });


    this._specialistFacade.updateSpecialistsNotificationCount();

    this._specialistFacade.getSpecialistsNotificationCount$().subscribe((data: number) => {
      if (data) {
        this.notificationCount.next(data);
      }
    });
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

  public openConversationModals(): void {
    this._specialistFacade.openConversationModals$.next();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private getTariffInfo(): void {
    this._balanceFacade.setAllBalanceTariff().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
  }
}
