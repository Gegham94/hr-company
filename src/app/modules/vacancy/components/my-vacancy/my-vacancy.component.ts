import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {VacancyFacade} from "../../services/vacancy.facade";
import {IVacancy} from "../../../../shared/interfaces/vacancy.interface";
import {ISearchableSelectData} from "../../../../shared/interfaces/searchable-select-data.interface";
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter, finalize,
  forkJoin, map,
  Observable,
  of, startWith,
  switchMap,
  takeUntil, tap
} from "rxjs";
import {MyVacancyFilterEnum} from "../../constants/my-vacancy-filter.enum";
import {IMyVacancyFilter} from "../../interfaces/my-vacancy-filter.interface";
import {FilterByPayedStatus} from "../../constants/filter-by-status";
import {FilterByStatusEnum} from "../../constants/filter-by-status.enum";
import {PayedStatusList, StatusList} from "./mock";
import {RoutesEnum} from "../../../../shared/enum/routes.enum";
import {ICompany} from "../../../../shared/interfaces/company.interface";
import {LocalStorageService} from "../../../../shared/services/local-storage.service";
import {Unsubscribe} from "../../../../shared/unsubscriber/unsubscribe";
import {HomeLayoutState} from "../../../home/home-layout/home-layout.state";
import {CompanyFacade} from "../../../company/services/company.facade";
import {getDiffDays} from "../../../../shared/helpers/get-diff-days.helper";
import {ProgressBarEnum} from "../../../../shared/enum/progress-bar.enum";
import {BalanceService} from "../../../balance/services/balance.service";
import {IBalanceTariff} from "../../../../shared/interfaces/balance-tariff.interface";
import {BalanceFacade} from "../../../balance/services/balance.facade";
import {BalanceState} from "../../../balance/services/balance.state";
import {NavigateButtonFacade} from "../../../../ui-kit/navigate-button/navigate-button.facade";
import { ANALYITIC_ICON } from "src/app/shared/constants/images.constant";
import { RobotHelperService } from "src/app/shared/services/robot-helper.service";
import { PopupMessageEnum } from "src/app/shared/enum/popup-message.enum";


@Component({
  selector: "hr-my-vacancy",
  templateUrl: "./my-vacancy.component.html",
  styleUrls: ["./my-vacancy.component.scss"]
})
export class MyVacancyComponent extends Unsubscribe implements OnInit, OnDestroy {

  public ANALYITIC_ICON = ANALYITIC_ICON;

  public vacancyList: IVacancy[] = [];
  public isBuyVacancyPopup: boolean = false;
  public isTariffBoughtFromVacancy: boolean = false;
  protected filterOptions: Object = {};
  public vacanciesCount!: number;
  public paymentMessage: BehaviorSubject<string> = new BehaviorSubject("");
  public vacancyUuid?: string = "";
  public getBalanceTariff$: Observable<IBalanceTariff[]> = this._balanceFacade.getCompanyBalance();
  public company$: Observable<ICompany> = this._companyFacade.getCompanyData$();
  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();
  public isRobotMap: Observable<boolean> = this._homeLayoutState.getIsRobotMap();
  public statusList: ISearchableSelectData[] = StatusList;
  public payedStatusList: ISearchableSelectData[] = PayedStatusList;
  public searchParams: IMyVacancyFilter = {};
  public myVacancyFilterEnum = MyVacancyFilterEnum;
  public progressTypeProps = ProgressBarEnum;
  public filterByStatusEnum = FilterByStatusEnum;
  public popupMessageEnum = PopupMessageEnum;
  public Routes = RoutesEnum;
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public tariffCount: number = 0;
  public isChooseModalOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isBuyVacancyModal: boolean = false;
  public vacancyBuyFromCurrentPage?: boolean = false;
  public updatePagination: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private companyData!: ICompany;

  private subject: BehaviorSubject<string> = new BehaviorSubject("");
  private sendValueChangeEvent$: BehaviorSubject<{ data: string, field: string }> = new BehaviorSubject({
    data: "",
    field: ""
  });

  constructor(
    protected readonly _vacancyFacade: VacancyFacade,
    private readonly _router: Router,
    private readonly _localStorage: LocalStorageService,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _companyFacade: CompanyFacade,
    private readonly _balanceFacade: BalanceFacade,
    private readonly _service: BalanceService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _balanceState: BalanceState,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
  ) {
    super();
  }

  public ngOnInit(): void {
    this._companyFacade.getCompanyData$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(data => {
        this.companyData = data;
        this.tariffCount = this.companyData.packageCount as number;
      })).subscribe();

    combineLatest([
      this._balanceState.getTariffBouth().pipe(startWith(null), takeUntil(this.ngUnsubscribe))
    ]).subscribe(([isBought]) => {
      if (isBought) {
        this.isTariffBoughtFromVacancy = isBought;
        this.questionForBuyVacancyAccept();
      }
    });

    if (this._router.url.includes("payment")) {
      this.isChooseModalOpen.next(true);
    } else {
      this.isRobot();
    }

    this.sendValueChangeEvent$.pipe(
      takeUntil(this.ngUnsubscribe),
      debounceTime(500),
      map((sendValue) => {
        switch (sendValue.field) {
          case this.myVacancyFilterEnum.name: {
            !!sendValue.data ? this.searchParams["name_query"] = sendValue.data : delete this.searchParams.name_query;
            break;
          }
          case this.myVacancyFilterEnum.payedStatus: {
            this.formatPayedStatusData(sendValue.data) ?
              this.searchParams["payedStatus"] = this.formatPayedStatusData(sendValue.data) :
              delete this.searchParams.payedStatus;
            break;
          }
          default:
            this.searchParams = {};
        }
        this.getSelectedPaginationValue(1, this.searchParams);
      })).subscribe();

    if (this._router.url !== RoutesEnum.vacancies) {
      // TODO: check wih robokaasssa
      this._companyFacade
        .setCompanyData$()
        .pipe(
          takeUntil(this.ngUnsubscribe),
          finalize(() => {
            this.isChooseModalOpen.next(true);
          })
        )
        .subscribe();
    }
  }

  public closeBuyVacancyPopup(): void {
    this.isBuyVacancyModal = !this.isBuyVacancyModal;
    this._localStorage.removeData("vacancyUuid");
  }

  public checkIsRobot(): void {
    window.history.pushState({}, document.title, window.location.pathname);
    this.isRobot();
  }

  public isRobot() {
      this.company$.pipe(
          takeUntil(this.ngUnsubscribe),
          filter(data => !!data?.phone),
          switchMap((company) => {
            if (company.packageCount && company.packageCount > 0) {
              const navigationBtns = this._navigateButtonFacade.getShowedNavigationsMenu();
              if (navigationBtns) {
                const analyticsBtnIndex = navigationBtns.findIndex(btn => btn.id === 4);
                const specialistsBtnIndex = navigationBtns.findIndex(btn => btn.id === 5);
                const balanceBtnIndex = navigationBtns.findIndex(btn => btn.id === 6);
                if (analyticsBtnIndex > -1 && specialistsBtnIndex > -1 && balanceBtnIndex > -1) {
                  navigationBtns[analyticsBtnIndex].statusType = "default";
                  navigationBtns[specialistsBtnIndex].statusType = "default";
                  navigationBtns[balanceBtnIndex].statusType = "default";
                }
                this._navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
              }
            }
            return of(company);
          }),
          switchMap(company => {
            const vacancies = company.helper?.find((item => item.link === this._router.url));

            this._robotHelperService.setRobotSettings({
              content: `All vacancies-helper&ensp;<button class="green_btn"> Оплатить </button>`,
              navigationItemId: null,
              isContentActive: true,
            });

            if (vacancies && vacancies?.hidden) {
              this._robotHelperService.setRobotSettings({
                content: "All vacancies&ensp;<button class=\"green_btn\"> Оплатить </button>",
                navigationItemId: 3,
                isContentActive: false,
              });
            }

            if (vacancies && !vacancies?.hidden) {
              this._robotHelperService.setRobotSettings({
                content: "All vacancies page &ensp;<button class=\"green_btn\" id='payment'> Оплатить </button>",
                navigationItemId: 3,
                isContentActive: true,
                uuid: vacancies.uuid
              });
              this._robotHelperService.isRobotOpen$.next(true);
            }

            if (company.packageCount && company.packageCount > 0) {
              const specialistsPageIndex = company.helper?.findIndex((data) =>
                data["link"] === this.Routes.specialists + "/isActive") ?? -1;
              const balancePageIndex = company.helper?.findIndex((data) =>
                data["link"] === this.Routes.balance + "/isActive") ?? -1;
              const analyticPageIndex = company.helper?.findIndex((data) =>
                data["link"] === this.Routes.analytic + "/isActive") ?? -1;

              if (company?.helper && analyticPageIndex >= 0 && specialistsPageIndex >= 0
                && !company.helper[specialistsPageIndex]["hidden"]
                && !company.helper[analyticPageIndex]["hidden"]
              ) {
                return forkJoin([
                  this._companyFacade.updateCurrentPageRobot(company.helper[balancePageIndex]?.uuid),
                  this._companyFacade.updateCurrentPageRobot(company.helper[specialistsPageIndex]?.uuid),
                  this._companyFacade.updateCurrentPageRobot(company.helper[analyticPageIndex]?.uuid)
                ]);
              }
            }
            return of(null);
          })
        ).subscribe();
  }

  public getSelectedPaginationValue(pageNumber: number,
                                    searchParams: IMyVacancyFilter = this.searchParams): void {
    this.updatePagination.next(false);
    this.isLoader$.next(true);
    const limit = 10;
    const end = pageNumber * limit;
    const start = end - limit;

    this.subject.pipe(
      switchMap(() => this._vacancyFacade.getAllVacancy(start, searchParams)),
      takeUntil(this.ngUnsubscribe)
    ).subscribe((vacancies) => {
      if (vacancies) {
        this.vacancyList = vacancies.result ?? [];
        if (this.vacancyList.length === 1 && this.vacancyList[0]?.uuid) {
          localStorage.setItem("vacancyUuid", this.vacancyList[0].uuid);
        }
        this.vacanciesPagesCount(vacancies.count);
        this._cdr.detectChanges();
        this.isLoader$.next(false);
      }
    });
  }

  private vacanciesPagesCount(count: number): void {
    const limit = 10;
    this.vacanciesCount = Math.ceil(count / limit);
  }

  public filterData(data: string, field: string): void {
    this.updatePagination.next(true);
    this.sendValueChangeEvent$.next({data, field});
  }

  public formatPayedStatusData(data: string): string {
    switch (data) {
      case FilterByPayedStatus.COMPLETED: {
        return FilterByStatusEnum.COMPLETED;
      }
      case FilterByPayedStatus.NOT_PAYED: {
        return FilterByStatusEnum.NOT_PAYED;
      }
      case FilterByPayedStatus.ALL: {
        return "";
      }
      default:
        return "";
    }
  }

  public openVacancyAnalytics(vacancy: IVacancy): void {
    if (vacancy.payedStatus === this.filterByStatusEnum.COMPLETED) {
      this._router.navigate([`/analytic`], {queryParams: {uuid: vacancy.uuid}});
    }
  }

  public openVacancyInfoPage(vacancy: IVacancy): void {
    this._router.navigate([`/vacancy-info`], {queryParams: {uuid: vacancy.uuid}});
  }

  public checkIsRepay(vacancyProps: IVacancy) {
    const day = getDiffDays(vacancyProps.deadlineDate);
    return day < 1;
  }

  public progress(vacancyProps: IVacancy): string {
    return this._vacancyFacade.progress(vacancyProps);
  }

  public getProgressPercent(vacancyProps: IVacancy): number {
    return this._vacancyFacade.getProgressPercent(vacancyProps);
  }

  public buyNotPayedVacancy(vacancyUuid?: string): void {
    this.vacancyUuid = vacancyUuid;
    this.tariffCount = this.companyData.packageCount as number;
    if (this.companyData
      && this.tariffCount <= 0
      || this.tariffCount === null) {
      this.company$.pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap((company) => {
          const navigationBtns = this._navigateButtonFacade.getShowedNavigationsMenu();
          if (navigationBtns) {
            const currentBtnIndex = navigationBtns.findIndex(btn => btn.id === 6);
            if (currentBtnIndex > -1) {
              navigationBtns[currentBtnIndex].statusType = "default";
            }
            this._navigateButtonFacade.setShowedNavigationsMenu$(navigationBtns);
          }
          return of(company);
        }),
        switchMap((company: ICompany) => {
          const balancePageIndex = company.helper?.findIndex((data) =>
            data["link"] === this.Routes.balance + "/isActive") ?? -1;
          if (company?.helper && balancePageIndex >= 0) {
            company.helper[balancePageIndex]["hidden"] = true;
            this._companyFacade.updateCompany$(company);
            return this._companyFacade.updateCurrentPageRobot(company.helper[balancePageIndex]["uuid"]);
          }
          return of(null);
        }))
        .subscribe(() => {
          if (vacancyUuid) {
            localStorage.setItem("vacancyUuid", vacancyUuid);
          }
          this._router.navigate(["/balance"], {queryParams: {fromVacancy: true}});
        });
      return;
    }
    this.vacancyBuyFromCurrentPage = true;
    localStorage.removeItem("vacancyUuid");
    this.isBuyVacancyPopup = !this.isBuyVacancyPopup;
  }

  public questionForBuyVacancyAccept(): void {
    this._balanceState.setTariffBoughtFromVacancy(true);

    if (!this.vacancyUuid && this.isTariffBoughtFromVacancy) {
      this.vacancyUuid = localStorage.getItem("vacancyUuid")!;
    } else {
      localStorage.removeItem("vacancyUuid");
    }

    if (this.vacancyUuid) {
      this._balanceState.setTariffBouth(false);
      this._service.buyNotPayedVacancy(this.vacancyUuid)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
         next: () => {
          if (this.isTariffBoughtFromVacancy) {
            this.isBuyVacancyPopup = !this.isBuyVacancyPopup;
          }

          for(const i in this.vacancyList) {
            if (this.vacancyList[i].uuid === this.vacancyUuid) {
              this.vacancyList[i].payedStatus = this.filterByStatusEnum.COMPLETED;
              this.vacancyList[i].payedDate = new Date().toISOString().slice(0, 10);
              const deadlineDate = new Date(this.vacancyList[i].deadlineDate);
              const createdAt = new Date(this.vacancyList[i].createdAt ?? this.vacancyList[i].deadlineDate);
              const todayDate = new Date();
              this.vacancyList[i].deadlineDate =
                new Date(todayDate.getTime() +
                  (deadlineDate.getTime() - createdAt.getTime())).toISOString().slice(0, 10);
            }
          }
          this._cdr.detectChanges();
          this._balanceState.setTariffCountChanged();
          this.isBuyVacancyPopup = false;
          if (this.vacancyBuyFromCurrentPage) {
            this.isBuyVacancyModal = true;
          }
          this.companyData.packageCount!--;
          this._companyFacade.updateCompany$(this.companyData);
          this.paymentMessage.next(this.popupMessageEnum.SUCCESS);
          localStorage.removeItem("vacancyUuid");
          this._balanceState.setTariffBouth(false);
        },
        error: () => {
          this.isBuyVacancyPopup = false;
          this.paymentMessage.next(this.popupMessageEnum.FAILED);
          localStorage.removeItem("vacancyUuid");
          if (this.vacancyBuyFromCurrentPage) {
            this.isBuyVacancyModal = true;
          }
        }
      })
    }
  }

  public questionForBuyVacancyField(): void {
    this.isBuyVacancyPopup = !this.isBuyVacancyPopup;
  }

  public postponeModal(): void {
    this.isChooseModalOpen.next(false);
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
