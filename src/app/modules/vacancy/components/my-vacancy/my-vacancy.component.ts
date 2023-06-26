import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {VacancyFacade} from "../../vacancy.facade";
import {TranslateService} from "@ngx-translate/core";
import {VacancyInterface} from "../../../app/interfaces/vacancy.interface";
import {SearchableSelectDataInterface} from "../../../app/interfaces/searchable-select-data.interface";
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  filter, finalize,
  forkJoin, map,
  Observable,
  of, startWith,
  switchMap,
  takeUntil
} from "rxjs";
import {MyVacancyFilterEnum} from "../../constants/my-vacancy-filter.enum";
import {MyVacancyFilterInterface} from "../../interfaces/my-vacancy-filter.interface";
import {FilterByPayedStatus, FilterByStatus} from "../../constants/filter-by-status";
import {FilterByStatusEnum} from "../../constants/filter-by-status.enum";
import {PayedStatusList, StatusList} from "./mock";
import {RoutesEnum} from "../../../app/constants/routes.enum";
import {CompanyInterface} from "../../../app/interfaces/company.interface";
import {LocalStorageService} from "../../../app/services/local-storage.service";
import {Unsubscribe} from "../../../../shared-modules/unsubscriber/unsubscribe";
import {HomeLayoutState} from "../../../home/home-layout/home-layout.state";
import {CompanyFacade} from "../../../company/company.facade";
import {getDiffDays} from "../../../../helpers/get-diff-days.helper";
import {ProgressBarEnum} from "../../../app/constants/progress-bar.enum";
import {BalanceService} from "../../../balance/balance.service";
import {BalanceTariffInterface} from "../../../app/interfaces/balance-tariff.interface";
import {BalanceFacade} from "../../../balance/balance.facade";
import {PopupMessageEnum} from "../../../app/model/popup-message.enum";
import {SpecialistFacade} from "../../../specialists/specialist.facade";
import {RobotHelperService} from "../../../app/services/robot-helper.service";
import {BalanceState} from "../../../balance/balance.state";
import {NavigateButtonFacade} from "../../../../ui-kit/navigate-button/navigate-button.facade";


@Component({
  selector: "hr-my-vacancy",
  templateUrl: "./my-vacancy.component.html",
  styleUrls: ["./my-vacancy.component.scss"]
})
export class MyVacancyComponent extends Unsubscribe implements OnInit, OnDestroy {

  public vacancyList: VacancyInterface[] = [];
  public isBuyVacancyPopup: boolean = false;
  public isTariffBoughtFromVacancy: boolean = false;
  protected filterOptions: Object = {};
  public vacanciesCount!: number;
  public paymentMessage: BehaviorSubject<string> = new BehaviorSubject("");
  public vacancyUuid?: string = "";
  public getBalanceTariff$: Observable<BalanceTariffInterface[]> = this._balanceFacade.getCompanyBalance();
  public company$: Observable<CompanyInterface> = of(JSON.parse(this._localStorage.getItem("company")));
  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();
  public isRobotMap: Observable<boolean> = this._homeLayoutState.getIsRobotMap();
  public statusList: SearchableSelectDataInterface[] = StatusList;
  public payedStatusList: SearchableSelectDataInterface[] = PayedStatusList;
  public searchParams: MyVacancyFilterInterface = {};
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

  private subject: BehaviorSubject<string> = new BehaviorSubject("");
  private sendValueChangeEvent$: BehaviorSubject<{ data: string, field: string }> = new BehaviorSubject({
    data: "",
    field: ""
  });

  constructor(
    protected readonly _vacancyFacade: VacancyFacade,
    private readonly _translateService: TranslateService,
    private readonly _router: Router,
    private readonly _localStorage: LocalStorageService,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _companyFacade: CompanyFacade,
    private readonly _balanceFacade: BalanceFacade,
    private readonly service: BalanceService,
    private readonly _specialistFacade: SpecialistFacade,
    private readonly cdr: ChangeDetectorRef,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _balanceState: BalanceState,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
  ) {
    super();
  }

  public ngOnInit(): void {
    const companyData = JSON.parse(this._localStorage.getItem("company"));
    this.tariffCount = companyData.packageCount;

    // this._balanceState.getTariffCount()
    //   .pipe(takeUntil(this.ngUnsubscribe))
    //   .subscribe((count) => {
    //     this.tariffCount = count;
    //   });

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

          case this.myVacancyFilterEnum.status: {
            if (!!this.formatStatusData(sendValue.data).toString()) {
              this.searchParams["status"] = <boolean>this.formatStatusData(sendValue.data);
            } else {
              delete this.searchParams.status;
            }
            break;
          }
          default:
            this.searchParams = {};
        }

        this.getSelectedPaginationValue(1, this.searchParams);
      })).subscribe();

    if (this._router.url !== RoutesEnum.vacancies) {
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
    if (this._localStorage.getItem("company")) {
      this.company$ = of(JSON.parse(this._localStorage.getItem("company")));
      this.company$
        .pipe(
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
                company.helper[balancePageIndex]["hidden"] = true;
                company.helper[specialistsPageIndex]["hidden"] = true;
                company.helper[analyticPageIndex]["hidden"] = true;
                this._localStorage.setItem("company", JSON.stringify(company));
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
  }

  public getSelectedPaginationValue(pageNumber: number,
                                    searchParams: MyVacancyFilterInterface = this.searchParams): void {

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
        this.cdr.detectChanges();
        this.isLoader$.next(false);
      }
    });

  }

  private vacanciesPagesCount(count: number): void {
    const limit = 10;
    this.vacanciesCount = Math.ceil(count / limit);
  }

  public filterData(data: string, field: string): void {
    this.sendValueChangeEvent$.next({data, field});
  }

  public formatPayedStatusData(data: string): string {
    switch (data) {
      case FilterByPayedStatus.COMPLETED: {
        return FilterByStatusEnum.COMPLETED;
      }
      case FilterByPayedStatus.IN_PROGRESS: {
        return FilterByStatusEnum.IN_PROGRESS;
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

  public formatStatusData(data: string): boolean | string {
    switch (data) {
      case FilterByStatus.COMPLETED: {
        return true;
      }
      case FilterByStatus.NOT_PAYED: {
        return false;
      }
      case FilterByStatus.ALL: {
        return "";
      }
      default:
        return "";
    }
  }

  public openVacancyAnalytics(vacancy: VacancyInterface): void {
    if (vacancy.payedStatus === this.filterByStatusEnum.COMPLETED) {
      this._router.navigate([`/analytic`], {queryParams: {uuid: vacancy.uuid}});
    }
  }

  public openVacancyInfoPage(vacancy: VacancyInterface): void {
    this._router.navigate([`/vacancy-info`], {queryParams: {uuid: vacancy.uuid}});
  }

  public checkIsRepay(vacancyProps: VacancyInterface) {
    const day = getDiffDays(vacancyProps.deadlineDate);
    return day < 0;
  }

  public progress(vacancyProps: VacancyInterface): string {
    return this._vacancyFacade.progress(vacancyProps);
  }

  public getProgressPercent(vacancyProps: VacancyInterface): number {
    return this._vacancyFacade.getProgressPercent(vacancyProps);
  }

  public buyNotPayedVacancy(vacancyUuid?: string): void {
    this.vacancyUuid = vacancyUuid;
    const companyData = JSON.parse(this._localStorage.getItem("company"));
    this.tariffCount = companyData.packageCount;
    if (this._localStorage.getItem("company")
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
        switchMap((company: CompanyInterface) => {
          const balancePageIndex = company.helper?.findIndex((data) =>
            data["link"] === this.Routes.balance + "/isActive") ?? -1;
          if (company?.helper && balancePageIndex >= 0) {
            company.helper[balancePageIndex]["hidden"] = true;
            this._localStorage.setItem("company", JSON.stringify(company));
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
      // @ts-ignore
      this.vacancyUuid = localStorage.getItem("vacancyUuid");
    } else {
      localStorage.removeItem("vacancyUuid");
    }

    if (this.vacancyUuid) {
      this._balanceState.setTariffBouth(false);
      this.service.buyNotPayedVacancy(this.vacancyUuid)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          const companyData = JSON.parse(this._localStorage.getItem("company"));
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
            this.cdr.detectChanges();
          }
          this._balanceState.setTariffCountChanged();
          this.isBuyVacancyPopup = false;
          if (this.vacancyBuyFromCurrentPage) {
            this.isBuyVacancyModal = true;
          }
          companyData.packageCount--;
          this._localStorage.setItem("company", JSON.stringify(companyData));
          this.paymentMessage.next(this.popupMessageEnum.SUCCESS);
          localStorage.removeItem("vacancyUuid");
          this._balanceState.setTariffBouth(false);
        }, (err) => {
          this.isBuyVacancyPopup = false;
          this.paymentMessage.next(this.popupMessageEnum.FAILED);
          localStorage.removeItem("vacancyUuid");
          if (this.vacancyBuyFromCurrentPage) {
            this.isBuyVacancyModal = true;
          }
        });
    }
  }

  public questionForBuyVacancyField(): void {
    this.isBuyVacancyPopup = !this.isBuyVacancyPopup;
  }

  public payedStatus(vacancyProps: VacancyInterface): string {
    return vacancyProps.payedStatus === this.filterByStatusEnum.COMPLETED ?
      this._translateService.instant("MY_VACANCY.SEARCH.STATUS.COMPLETED") :
      vacancyProps.payedStatus === this.filterByStatusEnum.NOT_PAYED ?
        this._translateService.instant("MY_VACANCY.SEARCH.STATUS.NOT_PAYED") :
        this._translateService.instant("MY_VACANCY.SEARCH.STATUS.IN_PROGRESS");
  }

  public status(vacancyProps: VacancyInterface): string {
    return vacancyProps.status ?
      this._translateService.instant("MY_VACANCY.SEARCH.STATUS.COMPLETED") :
      this._translateService.instant("MY_VACANCY.SEARCH.STATUS.OPEN");
  }

  public postponeModal(): void {
    this.isChooseModalOpen.next(false);
  }

  ngOnDestroy(): void {
    // localStorage.removeItem("vacancyUuid");
  }
}
