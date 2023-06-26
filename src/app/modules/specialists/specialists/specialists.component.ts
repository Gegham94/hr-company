import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from "@angular/core";
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  of,
  Subject,
  switchMap, take,
  takeUntil
} from "rxjs";
import {SearchableSelectDataInterface} from "../../app/interfaces/searchable-select-data.interface";
import {AddVacancyInterfaceOrNull} from "../../vacancy/interfaces/add-vacancy-filter.interface";
import {SpecialistFilterInterface, SpecialistInterviewStatusEnum} from "../interfaces/specialist-filter-interface";
import {SelectedTabEnum} from "../../app/constants/selectedTab.enum";
import {Experiences, FilteredSpecialistsListResult} from "../interfaces/specialist.interface";
import {SpecialistFacade} from "../specialist.facade";
import {VacancyFacade} from "../../vacancy/vacancy.facade";
import {HomeLayoutState} from "../../home/home-layout/home-layout.state";
import {CompanyInterface} from "../../app/interfaces/company.interface";
import {Router} from "@angular/router";
import {RobotHelperService} from "../../app/services/robot-helper.service";
import {LocalStorageService} from "../../app/services/local-storage.service";
import {Unsubscribe} from "../../../shared-modules/unsubscriber/unsubscribe";
import {CompanyFacade} from "../../company/company.facade";
import {RoutesEnum} from "../../app/constants/routes.enum";
import {BalanceState} from "../../balance/balance.state";
import {PayedVacancyEnum, VacancyStatusEnum} from "../../vacancy/constants/filter-by-status.enum";
import {BalanceService} from "../../balance/balance.service";
import {ChatFacade} from "../../chat/chat.facade";
import {ButtonTypeEnum} from "../../app/constants/button-type.enum";
import {IConversation} from "../../chat/interfaces/conversations";
import {NavigateButtonFacade} from "../../../ui-kit/navigate-button/navigate-button.facade";
import {PopupMessageEnum} from "../../app/model/popup-message.enum";

@Component({
  selector: "app-specialists",
  templateUrl: "./specialists.component.html",
  styleUrls: ["./specialists.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecialistsComponent extends Unsubscribe implements OnInit {
  public update: boolean = false;
  public currentPage: number = 1;
  public readonly options: SearchableSelectDataInterface[] = [
    {id: 1, value: "Все", displayName: "Все"},
    {id: 2, value: "Прошли тест", displayName: "Прошли тест"},
    {id: 3, value: "В процессе", displayName: "В процессе"},
    {id: 4, value: "Принятые", displayName: "Принятые"},
    {id: 5, value: "Избранное", displayName: "Избранное"},
  ];

  public selectedItem = this.options[0];

  public specialists: BehaviorSubject<FilteredSpecialistsListResult[]> = new BehaviorSubject<FilteredSpecialistsListResult[]>([]);

  public selectedVacancy$: BehaviorSubject<AddVacancyInterfaceOrNull> = new BehaviorSubject<AddVacancyInterfaceOrNull>(
    null
  );

  public vacancyDeadlineDate$: Subject<string> = new Subject<string>();

  public isSpecialistAvailableAfterAcceptOrReject$ = this._chatFacade.getIsAvailableAfterAcceptOrReject$().pipe(
    switchMap(data => {
      return this._chatFacade.getConversation$()
        .pipe(
          map(conv => {
            if(this._localStorage.getItem("filtered_vacancies")) {
              const selectedVacancy = JSON.parse(this._localStorage.getItem("filtered_vacancies"));
              if (selectedVacancy?.length && conv?.other_info.vacancyUuid === selectedVacancy[0].id) {
                return data;
              }
            }
            return true;
          })
        );
    })
  );

  public searchParams: SpecialistFilterInterface = {};
  public specialistTotalPageCount: number = 0;
  public loader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();
  public isRobotMap: Observable<boolean> = this._homeLayoutState.getIsRobotMap();
  public company$: Observable<CompanyInterface> = of(JSON.parse(this._localStorage.getItem("company")));
  public isChooseModalOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public defaultValue1: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public defaultValue2: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public ButtonTypeEnum = ButtonTypeEnum;
  public readonly VacancyStatusEnum = VacancyStatusEnum;
  public readonly PayedVacancyEnum = PayedVacancyEnum;
  public readonly SpecialistInterviewStatusEnum = SpecialistInterviewStatusEnum;
  private readonly Routes = RoutesEnum;
  private conversations$!: Observable<IConversation[]>;
  public vacancyType: VacancyStatusEnum = VacancyStatusEnum.NotArchived;
  public filter$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  public isBuyVacancyModal: boolean = false;
  public paymentMessage: BehaviorSubject<string> = new BehaviorSubject("");
  public popupMessageEnum = PopupMessageEnum;

  constructor(
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _router: Router,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _localStorage: LocalStorageService,
    private readonly _companyFacade: CompanyFacade,
    private readonly _balanceState: BalanceState,
    private readonly _balanceService: BalanceService,
    private readonly _chatFacade: ChatFacade,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this.conversations$ = this._chatFacade.getConversations$();
    this.isRobot();
    if (this._router.url.includes("payment")) {
      this.isBuyVacancyModal = true;
      this.questionForBuyVacancyAccept();
    }
  }

  public navigateToBalance(): void {
    this._router.navigateByUrl("/balance");
  }

  public checkIsRobot(): void {
    this.update = true;
    this.getFilteredSpecialistList(1, this.searchParams);
    window.history.pushState({}, document.title, window.location.pathname);
    if (this._localStorage.getItem("company")) {
      this.company$ = of(JSON.parse(this._localStorage.getItem("company")));
    }
    this.company$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((company: CompanyInterface | null) => {
          const navigationBtns = this._navigateButtonFacade.getShowedNavigationsMenu();
          if (navigationBtns) {
            const currentBtnIndex = navigationBtns.findIndex((btn) => btn.id === 4);
            if (currentBtnIndex > -1) {
              navigationBtns[currentBtnIndex].statusType = "default";
            }
            this._navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
          }
          return of(company);
        })
      )
      .subscribe((company) => {
        this.isRobot();
        if (company) {
          const analyticPageIndex =
            company.helper?.findIndex((data) => data["link"] === this.Routes.analytic + "/isActive") ?? -1;

          if (company?.helper && analyticPageIndex >= 0) {
            company.helper[analyticPageIndex]["hidden"] = true;
            this._localStorage.setItem("company", JSON.stringify(company));
            this._companyFacade.updateCurrentPageRobot(company.helper[analyticPageIndex]["uuid"]).subscribe();
          }
        }
      });
  }

  public questionForBuyVacancyAccept(): void {
    const vacancyUuid = localStorage.getItem("vacancyUuid");
    if (vacancyUuid) {
      this._balanceService
        .buyNotPayedVacancy(vacancyUuid)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          () => {
            const companyData = JSON.parse(this._localStorage.getItem("company"));
            companyData.packageCount--;
            this._localStorage.setItem("company", JSON.stringify(companyData));
            localStorage.removeItem("vacancyUuid");
            this._balanceState.setTariffBouth(false);
            this.paymentMessage.next(this.popupMessageEnum.SUCCESS);
          },
          () => {
            localStorage.removeItem("vacancyUuid");
            this._balanceState.setTariffBouth(false);
            this.paymentMessage.next(this.popupMessageEnum.FAILED);
          }
        );
    }
    this.loader$.next(false);
  }

  public getDefaultValue1() {
    return this.defaultValue1.asObservable();
  }

  public getDefaultValue2() {
    return this.defaultValue2.asObservable();
  }

  public isFilterDisabled(i: number): boolean {
    return this.vacancyType === VacancyStatusEnum.Archived && [3, 4].includes(i);
  }

  public navOptions(el: SearchableSelectDataInterface) {
    this.selectedItem = el;
    this.currentPage = 1;

    switch (el.displayName) {
      case SelectedTabEnum.Successfully:
        this.searchParams["status"] = SpecialistInterviewStatusEnum.SUCCESS;
        this.getFilteredSpecialistList(1, this.searchParams);
        break;
      case SelectedTabEnum.Process:
        this.searchParams["status"] = SpecialistInterviewStatusEnum.InProgress;
        this.getFilteredSpecialistList(1, this.searchParams);
        break;
      case SelectedTabEnum.Accepted:
        this.searchParams["status"] = SpecialistInterviewStatusEnum.ACCEPTED;
        this.getFilteredSpecialistList(1, this.searchParams);
        break;
      case SelectedTabEnum.Favorites:
        this.searchParams["status"] = SpecialistInterviewStatusEnum.FAVORITES;
        this.getFilteredSpecialistList(1, this.searchParams);
        break;
      default: {
        delete this.searchParams.status;
        this.getFilteredSpecialistList(1, this.searchParams);
      }
    }
  }

  getAllVacancyList(vacancies: SearchableSelectDataInterface[]) {
    const filteredVacancies = localStorage.getItem("filtered_vacancies");
    if (filteredVacancies && filteredVacancies.length > 0) {
      const parsedFilteredVacancies = JSON.parse(filteredVacancies);
      this.defaultValue2.next(parsedFilteredVacancies[0].displayName);
      this.searchParams["vacancyUuid"] = parsedFilteredVacancies[0].id.toString();
    } else if (vacancies[vacancies.length - 1]) {
      this.defaultValue2.next(vacancies[vacancies.length - 1].displayName);
      this.searchParams["vacancyUuid"] = vacancies[vacancies.length - 1].id.toString();
    }
  }

  public setSelectedVacancy(vacancy: SearchableSelectDataInterface, type: VacancyStatusEnum) {
    this.loader$.next(true);
    this.vacancyType = type;
    this.currentPage = 1;

    if (type === VacancyStatusEnum.Archived) {
      this.defaultValue2.next("");
      this.defaultValue1.next(vacancy.displayName);
      localStorage.removeItem("filtered_vacancies");
      if ([3, 4].includes(this.selectedItem.id as number)) {
        this.selectedItem = this.options[0];
      }
    } else {
      this.defaultValue1.next("");
      this.defaultValue2.next(this.defaultValue2.value);
      localStorage.setItem("filtered_vacancies", JSON.stringify([vacancy]));
    }

    if (vacancy.id) {
      this._vacancyFacade.getVacancy(vacancy.id).subscribe((data) => {
        const [selectedVacancy] = data.result;
        this.selectedVacancy$.next(selectedVacancy);
        this.searchParams["vacancyUuid"] = selectedVacancy.uuid;
        this.getFilteredSpecialistList(1, this.searchParams);
      });
    } else {
      delete this.searchParams.vacancyUuid;
      this.getFilteredSpecialistList(1, this.searchParams);
    }
  }

  public isRobot() {
    this.company$.pipe(filter((data) => !!data?.phone)).subscribe((company) => {
      const specialists = company.helper?.find((item) => item.link === "/specialists");

      this._robotHelperService.setRobotSettings({
        content: "/specialists - helper",
        navigationItemId: null,
        isContentActive: true,
      });

      if (specialists && !specialists?.hidden) {
        this._robotHelperService.setRobotSettings({
          content: "/specialist",
          navigationItemId: 5,
          isContentActive: true,
          uuid: specialists.uuid,
        });
        this._robotHelperService.isRobotOpen$.next(true);
      }
    });
  }

  public getFilteredSpecialistList(
    pageNumber: number,
    searchParams: SpecialistFilterInterface = this.searchParams
  ): void {
    this.currentPage = pageNumber;
    this.specialists.next([]);
    const limit = 12;
    const skip = pageNumber * limit - limit;

    this.conversations$.pipe(
      takeUntil(this.ngUnsubscribe),
      filter(data => !!data.length),
      take(1))
      .subscribe((data) => {
        searchParams["orderSpecialistUuids"] = data.map((item: IConversation) => {
          return item?.other_info.foundSpecialistUuid;
        });
        if (!!searchParams.vacancyUuid) {
          this._specialistFacade
            .getFilteredSpecialistList(skip, searchParams)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data) => {
              this.loader$.next(false);
              if (data.result.length) {
                this._localStorage.setItem("isFirstChat", JSON.stringify(data.result[0]?.newSpecialist));
                this.specialists.next(data.result);
              }
              this.specialistsTotalPages(data.count);
            });
        }
      });


  }

  public closeBuyVacancyPopup(): void {
    this.isBuyVacancyModal = !this.isBuyVacancyModal;
    this.isBuyVacancyModal = !this.isBuyVacancyModal;
    this._localStorage.removeData("vacancyUuid");
  }

  public get vacancyDeadlineDate(): string {
    if (this.selectedVacancy$.value?.deadlineDate) {
      return this.selectedVacancy$.value?.deadlineDate.split("-").join("/");
    }
    return "";
  }

  public getProfession(item: Experiences[]): string {
    let professions = "";
    item.forEach((data: Experiences) => {
      professions += data.position + " ";
    });
    return professions;
  }

  private specialistsTotalPages(count: number): void {
    const limit = 12;
    this.specialistTotalPageCount = Math.ceil(count / limit);
  }
}
