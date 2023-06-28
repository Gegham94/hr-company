import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, filter, forkJoin, map, Observable, of, switchMap, takeUntil, tap } from "rxjs";
import { ISpecialistFilter } from "../interfaces/specialist-filter-interface";
import { SpecialistInterviewStatusEnum } from "../constants/interviev-status.enum";
import { FilteredSpecialistsListResult } from "../interfaces/specialist.interface";
import { SpecialistFacade } from "../services/specialist.facade";
import { Router } from "@angular/router";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ISearchableSelectData } from "src/app/shared/interfaces/searchable-select-data.interface";
import { ICompany } from "src/app/shared/interfaces/company.interface";
import { RoutesEnum } from "src/app/shared/enum/routes.enum";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { ButtonTypeEnum } from "src/app/shared/enum/button-type.enum";
import { VacancyFacade } from "../../vacancy/services/vacancy.facade";
import { HomeLayoutFacade } from "../../home/home-layout/home-layout.facade";
import { CompanyFacade } from "../../company/services/company.facade";
import { BalanceFacade } from "../../balance/services/balance.facade";
import { ChatFacade } from "../../chat/chat.facade";
import { NavigateButtonFacade } from "src/app/ui-kit/navigate-button/navigate-button.facade";
import { Conversation } from "../../chat/interfaces/conversations";
import { AcceptOrDeclineEnum } from "../../chat/constants/accept-or-decline.enum";
import { IAddVacancyOrNullType } from "../../vacancy/interfaces/add-vacancy-filter.interface";
import { VacancyStatusEnum } from "../../vacancy/constants/filter-by-status.enum";

@Component({
  selector: "app-specialists",
  templateUrl: "./specialists.component.html",
  styleUrls: ["./specialists.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecialistsComponent extends Unsubscribe implements OnInit, OnDestroy {
  public ButtonTypeEnum = ButtonTypeEnum;
  public update: boolean = false;
  public specialistFilterAll: string = "Все";
  public readonly options: ISearchableSelectData[] = [
    { id: 1, value: "Все", displayName: "Все" },
    { id: 2, value: "Прошли тест", displayName: "Прошли тест" },
    { id: 3, value: "В процессе", displayName: "В процессе" },
    { id: 4, value: "Принятые", displayName: "Принятые" },
    { id: 5, value: "Избранное", displayName: "Избранное" },
  ];
  public specialists: BehaviorSubject<FilteredSpecialistsListResult[]> = new BehaviorSubject<
    FilteredSpecialistsListResult[]
  >([]);
  public selectedVacancy$: BehaviorSubject<IAddVacancyOrNullType> =
    new BehaviorSubject<IAddVacancyOrNullType>(null);
  public selectedSpecialistPossition = this.options[0];

  public readonly VacancyStatusEnum = VacancyStatusEnum;
  public readonly SpecialistInterviewStatusEnum = SpecialistInterviewStatusEnum;
  public searchParams: ISpecialistFilter = {};
  public specialistTotalPageCount: number = 0;
  public loader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isRobotHelper: Observable<boolean> = this._homeLayoutFacade.getIsRobotHelper$();
  public company$: Observable<ICompany> = this._companyFacade.getCompanyData$();
  public isChooseModalOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public vacancyType: VacancyStatusEnum = VacancyStatusEnum.NotArchived;
  public isUpdatePagination: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly Routes = RoutesEnum;
  private vacanciesListDefaultValue: BehaviorSubject<string> = new BehaviorSubject<string>("");

  // After accepting or rejecting specialist for selected vacancy from chat, make specialists available
  public selectedConversation$: Observable<Conversation | null> = this._chatFacade.getSelectedConversation$();
  public isAvailableSpecialist: boolean = true;
  private conversations$: Observable<Conversation[]> = this._chatFacade.getConversations$();

  public get vacancyDeadlineDate(): string {
    if (this.selectedVacancy$.value?.deadlineDate) {
      return this.selectedVacancy$.value?.deadlineDate.split("-").join("/");
    }
    return "";
  }

  constructor(
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly _homeLayoutFacade: HomeLayoutFacade,
    private readonly _router: Router,
    private readonly _localStorage: LocalStorageService,
    private readonly _companyFacade: CompanyFacade,
    private readonly _balanceFacade: BalanceFacade,
    private readonly _chatFacade: ChatFacade,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this.conversations$ = this._chatFacade.getConversations$();
    this.checkIsRobot();
    if (this._router.url.includes("payment")) {
      this.questionForBuyVacancyAccept();
    }

    // subscribe to the selected conversation
    // to check the acceptance and rejection of events
    // for opening and closing specialist cards
    this.selectedConversation$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((selectedConversation) => {
          if (
            this.selectedVacancy$?.value &&
            selectedConversation?.other_info.vacancyUuid === this.selectedVacancy$.value.uuid
          ) {
            this.isAvailableSpecialist =
              selectedConversation?.other_info?.interviewStatus !==
              (AcceptOrDeclineEnum.ACCEPTED || AcceptOrDeclineEnum.REJECTED);
          }
          this.isAvailableSpecialist = true;
        })
      )
      .subscribe(() => {
        this._cdr.markForCheck();
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public getPercentage(): Observable<number> {
    return this.selectedVacancy$.pipe(
      takeUntil(this.ngUnsubscribe),
      map((vacancy) => {
        return this._specialistFacade.getPercentage(vacancy);
      })
    );
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
        switchMap((company: ICompany | null) => {
          const navigationBtns = this._navigateButtonFacade.getShowedNavigationsMenu();
          if (navigationBtns) {
            const currentBtnIndex = navigationBtns.findIndex((btn) => btn.id === 4);
            const specialistBtnIndex = navigationBtns.findIndex((btn) => btn.id === 5);
            if (currentBtnIndex > -1 && specialistBtnIndex > -1) {
              navigationBtns[currentBtnIndex].statusType = "default";
              navigationBtns[specialistBtnIndex].statusType = "default";
            }
            this._navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
          }
          this.isRobot();
          if (company) {
            const analyticPageIndex =
              company.helper?.findIndex((data) => data["link"] === this.Routes.analytic + "/isActive") ?? -1;
            const specialistsPageIndex =
              company.helper?.findIndex((data) => data["link"] === this.Routes.specialists + "/isActive") ?? -1;
            if (company?.helper && analyticPageIndex >= 0) {
              return forkJoin([this._companyFacade.updateCurrentPageRobot(company.helper[analyticPageIndex]["uuid"]),
              this._companyFacade.updateCurrentPageRobot(company.helper[specialistsPageIndex]["uuid"]),
              ]);
            }
          }
          return of(company);
        })
      )
      .subscribe();
  }

  public getvacanciesListDefaultValue(): Observable<string> {
    return this.vacanciesListDefaultValue.asObservable();
  }

  public navOptions(searchSelectData: ISearchableSelectData): void {
    this.selectedSpecialistPossition = searchSelectData;
    this.isUpdatePagination.next(true);
    this._specialistFacade
      .getNavOptions(searchSelectData)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap((searchParams) => (this.searchParams = searchParams))
      )
      .subscribe(() => this.getFilteredSpecialistList(1, this.searchParams));
  }

  public getAllVacancyList(vacancies: ISearchableSelectData[]): void {
    const filteredVacancies = localStorage.getItem("filtered_vacancies");
    if (filteredVacancies && filteredVacancies.length > 0) {
      const parsedFilteredVacancies = JSON.parse(filteredVacancies);
      this.vacanciesListDefaultValue.next(parsedFilteredVacancies[0].displayName);
      this.searchParams["vacancyUuid"] = parsedFilteredVacancies[0].id.toString();
    } else if (vacancies[vacancies.length - 1]) {
      this.vacanciesListDefaultValue.next(vacancies[vacancies.length - 1].displayName);
      this.searchParams["vacancyUuid"] = vacancies[vacancies.length - 1].id.toString();
    }
  }

  public setSelectedVacancy(vacancy: ISearchableSelectData, type: VacancyStatusEnum): void {
    this.isUpdatePagination.next(true);
    this.loader$.next(true);
    this.vacancyType = type;
    if (type === VacancyStatusEnum.Archived) {
      this.vacanciesListDefaultValue.next("");
      localStorage.removeItem("filtered_vacancies");
      if ([3, 4].includes(this.selectedSpecialistPossition.id as number)) {
        this.selectedSpecialistPossition = this.options[0];
      }
    } else {
      this.vacanciesListDefaultValue.next(this.vacanciesListDefaultValue.value);
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
      this._specialistFacade.isRobot({
        content: "/specialists - helper",
        navigationItemId: null,
        isContentActive: true,
      });
      if (specialists && !specialists?.hidden) {
        this._specialistFacade.isRobot({
          content: "/specialist",
          navigationItemId: 5,
          isContentActive: true,
          uuid: specialists.uuid,
        });
        this._specialistFacade.openRobot(true);
      }
    });
  }

  public getFilteredSpecialistList(pageNumber: number, searchParams: ISpecialistFilter = this.searchParams): void {
    this.isUpdatePagination.next(false);
    this.specialists.next([]);
    const limit = 12;
    const skip = pageNumber * limit - limit;
    if (this.searchParams["vacancyUuid"]) {
      this.conversations$
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap((data) => {
            if (data.length) {
              searchParams["orderSpecialistUuids"] = data.map((item: Conversation) => {
                return item?.other_info.foundSpecialistUuid;
              });
            }
            if (searchParams.vacancyUuid) {
              return this._specialistFacade.getFilteredSpecialistList(skip, searchParams);
            }
            return of(null);
          })
        )
        .subscribe((data) => {
          this.loader$.next(false);
          if (data) {
            if (data.result?.length) {
              this._localStorage.setItem("isFirstChat", JSON.stringify(data.result[0]?.newSpecialist));
              this.specialists.next(data.result);
            }
            this.specialistsTotalPages(data.count);
          }
        });
    }
  }

  private questionForBuyVacancyAccept(): void {
    const vacancyUuid = localStorage.getItem("vacancyUuid");
    if (vacancyUuid) {
      this._balanceFacade
        .buyNotPayedVacancy(vacancyUuid)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.company$.pipe(
              takeUntil(this.ngUnsubscribe),
              tap((company) => {
                if (company) {
                  this._specialistFacade.questionForBuyVacancyAccept(company, false);
                }
              })
            );
          },
          error: () => {
            this._specialistFacade.questionForBuyVacancyAccept({}, true);
          },
        });
    }
    this.loader$.next(false);
  }

  private specialistsTotalPages(count: number): void {
    const limit = 12;
    this.specialistTotalPageCount = Math.ceil(count / limit);
  }
}
