import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import {PaidListInterface} from "../app/interfaces/paidList.interface";
import {UnPaidListInterface} from "../app/interfaces/unPaidList.interface";
import {ButtonTypeEnum} from "../app/constants/button-type.enum";
import {ActivatedRoute, Router} from "@angular/router";
import {BalanceFacade} from "./balance.facade";
import {PayedStatusEnum} from "../app/constants/payed-status.enum";
import {
  BehaviorSubject, combineLatest,
  debounceTime, delay,
  filter,
  map,
  Observable,
  of, startWith,
  switchMap,
  takeUntil,
} from "rxjs";
import {BalanceService} from "./balance.service";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {FilterByStatusEnum} from "../vacancy/constants/filter-by-status.enum";
import {MyVacancyFilterInterface} from "../vacancy/interfaces/my-vacancy-filter.interface";
import {VacancyFacade} from "../vacancy/vacancy.facade";
import {SearchableSelectDataInterface} from "../app/interfaces/searchable-select-data.interface";
import {TranslateService} from "@ngx-translate/core";
import {MyVacancyFilterEnum} from "../vacancy/constants/my-vacancy-filter.enum";
import {PopupMessageEnum} from "../app/model/popup-message.enum";
import {FilterByStatus} from "../vacancy/constants/filter-by-status";
import {VacancyStatusEnum} from "../vacancy/constants/vacancy-status.enum";
import {HomeLayoutState} from "../home/home-layout/home-layout.state";
import {CompanyInterface} from "../app/interfaces/company.interface";
import {LocalStorageService} from "../app/services/local-storage.service";
import {RobotHelperService} from "../app/services/robot-helper.service";
import {BalanceState} from "./balance.state";
import {ProgressBarEnum} from "../app/constants/progress-bar.enum";
import {VacancyInterface} from "../app/interfaces/vacancy.interface";
import {getDiffDays} from "../../helpers/get-diff-days.helper";

@Component({
  selector: "hr-balance",
  templateUrl: "./balance.component.html",
  styleUrls: ["./balance.component.scss"],
})
export class BalanceComponent extends Unsubscribe implements OnInit {
  private payedStatusEnum = PayedStatusEnum;
  private filterByStatusEnum = FilterByStatusEnum;
  private filterByStatus = FilterByStatus;
  private subject: BehaviorSubject<string> = new BehaviorSubject("");
  private sendValueChangeEvent$: BehaviorSubject<{
    value: string;
    type: string;
    statusRequest: string;
  }> = new BehaviorSubject({value: "", type: "", statusRequest: ""});
  private value: { [key: string]: string } = {};

  public isTariffBoughtFromVacancy: boolean = false;
  public vacancyBuyFromCurrentPage?: boolean = false;

  public notificationCountForBalance: number = 0;
  public unPaidListVacancies$!: Observable<UnPaidListInterface[]>;
  public paidListVacancies$!: Observable<PaidListInterface[]>;
  public paidLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public unPaidLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public unPaidVacancyContentHeight = 0;
  public paidVacancyContentHeight = 0;
  public isBuyVacancyModal: boolean = false;
  public isBuyVacancyPopup: boolean = false;
  public buyVacancyMessage!: string;
  public vacancyUuid!: string;
  public paidVacanciesCount: number = 0;
  public unpaidVacanciesCount: number = 0;
  public myVacancyFilterEnum = MyVacancyFilterEnum;
  public popupMessageEnum = PopupMessageEnum;
  public vacancyStatusEnum = VacancyStatusEnum;
  public buttonTypesList = ButtonTypeEnum;
  public progressTypeProps = ProgressBarEnum;
  public isRobotHelper: Observable<boolean> =
    this._homeLayoutState.getIsRobotHelper$();
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public readonly statusList: SearchableSelectDataInterface[] = [
    {
      id: 1,
      value: this._translateService
        .instant("MY_VACANCY.SEARCH.STATUS.ALL")
        .toLowerCase(),
      displayName: this._translateService.instant(
        "MY_VACANCY.SEARCH.STATUS.ALL"
      ),
    },
    {
      id: 2,
      value: this._translateService
        .instant("MY_VACANCY.SEARCH.STATUS.COMPLETED")
        .toLowerCase(),
      displayName: this._translateService.instant(
        "MY_VACANCY.SEARCH.STATUS.COMPLETED"
      ),
    },
    {
      id: 3,
      value: this._translateService
        .instant("MY_VACANCY.SEARCH.STATUS.NOT_PAYED")
        .toLowerCase(),
      displayName: this._translateService.instant(
        "MY_VACANCY.SEARCH.STATUS.NOT_PAYED"
      ),
    },
  ];

  public company$: Observable<CompanyInterface> = of(
    JSON.parse(this._localStorage.getItem("company"))
  );
  public isChooseModalOpen: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  @ViewChild("cards") cards!: ElementRef;
  @ViewChild("paymentHistory") paymentHistory!: ElementRef;
  @ViewChild("unpaidVacancies") unpaidVacancies!: ElementRef;
  @ViewChild("unpaidVacanciesList") unpaidVacanciesList!: ElementRef;

  public isBlockActive: BehaviorSubject<boolean[]> = new BehaviorSubject<boolean[]>([true, false, false]);

  constructor(
    private readonly _router: Router,
    private readonly _balanceFacade: BalanceFacade,
    private readonly service: BalanceService,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly cdr: ChangeDetectorRef,
    private readonly _translateService: TranslateService,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _localStorage: LocalStorageService,
    private readonly _balanceState: BalanceState,
    private readonly _activatedRoute: ActivatedRoute
  ) {
    super();
  }

  public ngOnInit(): void {
    this._balanceFacade.getSelectedContentReference()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        switch (data) {
          case "cards": {
            this.isBlockActive.next([true, false, false]);
            this.scrollToReference(this.cards);
            break;
          }
          case "unpaidVacancies": {
            this.isBlockActive.next([false, true, false]);
            this.scrollToReference(this.unpaidVacancies);
            break;
          }
          case "paymentHistory": {
            this.isBlockActive.next([false, false, true]);
            this.scrollToReference(this.paymentHistory);
            break;
          }
          default: {
          }
        }
      });

    this.getCompanyBalanceOrders(1);

    if (!this._activatedRoute.snapshot.queryParams["fromVacancy"]) {
      localStorage.removeItem("vacancyUuid");
    }

    combineLatest([
      this._balanceState.getTariffBouth().pipe(startWith(null), takeUntil(this.ngUnsubscribe))
    ]).subscribe(([isBought]) => {
      if (isBought) {
        this.isTariffBoughtFromVacancy = isBought;
        this.questionForBuyVacancyAccept();
      }
    });

    this.getUnpaidVacancyList(1);

    if (this._router.url.includes("payment")) {
      this.isChooseModalOpen.next(true);
    } else {
      this.isRobot();
    }

    this.sendValueChangeEvent$
      .pipe(
        debounceTime(500),
        map((data) => {
          let objectForSearchValue: { [x: string]: string };
          if (data.value === this.payedStatusEnum.COMPLETED) {
            objectForSearchValue = {
              [data.type]: this.filterByStatusEnum.COMPLETED,
            };
          } else if (data.value === this.payedStatusEnum.NOT_PAYED) {
            objectForSearchValue = {
              [data.type]: this.filterByStatusEnum.NOT_PAYED,
            };
          } else {
            objectForSearchValue = {
              [data.type]: data.value,
            };
          }

          Object.assign(this.value, objectForSearchValue);

          const objectValue = Object.values(this.value);
          const objectKey = Object.keys(this.value);

          objectValue.forEach((item, index) => {
            if (
              Object.values(this.value)[index] === "" ||
              Object.values(this.value)[index] === this.filterByStatus.ALL
            ) {
              delete this.value[objectKey[index]];
            }
          });

          if (data.statusRequest === this.vacancyStatusEnum.UNPAID) {
            this.getUnpaidVacancyList(1, this.value);
          }
        })
      )
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  public checkIsRobot(): void {
    window.history.pushState({}, document.title, window.location.pathname);
    this.isRobot();
  }

  public scrollToReference(item: ElementRef): void {
    item?.nativeElement.scrollIntoView({behavior: "smooth", block: "center"});
  }

  public isRobot() {
    if (this._localStorage.getItem("company")) {
      this.company$ = of(JSON.parse(this._localStorage.getItem("company")));
    }
    this.company$.pipe(filter((data) => !!data?.phone)).subscribe((company) => {
      const balance = company.helper?.find(
        (item) => item.link === this._router.url
      );

      this._balanceFacade.setSelectedContentReference("cards");

      this._robotHelperService.setRobotSettings({
        content: [
          `<p id="cards" style="cursor: pointer"> cards</p>`,
          `<span id="paymentHistory" style="cursor: pointer"> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. </span>`,
          `<span id="unpaidVacancies" style="cursor: pointer"> unpaidVacancies </span>`,
        ],
        navigationItemId: null,
        isContentActive: true,
      });

      if (balance && !balance?.hidden) {
        this._robotHelperService.setRobotSettings({
          content: [
            `<span id="cards" style="cursor: pointer"> cards </span>`,
            `<span id="paymentHistory" style="cursor: pointer"> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. </span>`,
            `<span id="unpaidVacancies" style="cursor: pointer"> unpaidVacancies </span>`,
          ],
          navigationItemId: 6,
          isContentActive: false,
          uuid: balance.uuid,
        });
        this._robotHelperService.isRobotOpen$.next(true);
      }
    });
  }

  public getCompanyBalanceOrders(pageNumber: number): void {
    this.paidLoader.next(true);
    const limit = 10;
    const end = pageNumber * limit;
    const start = end - limit;
    delete this.value["name_query"];
    this.paidListVacancies$ = this.subject.pipe(
      delay(500),
      switchMap(() => this.service.getCompanyBalanceOrders(start, this.value)),
      map((vacancies) => {
        this.paidVacanciesPagesCount(vacancies.count);
        this.isLoader$.next(false);
        this.paidLoader.next(false);
        return vacancies.result;
      })
    );
  }

  public closeBuyVacancyPopup(): void {
    this.isBuyVacancyModal = !this.isBuyVacancyModal;
  }

  public updateVacancy(uuid: string | undefined) {
    this._router.navigate(["company/vacancies/add-description-part"], {
      queryParams: {
        uuid: uuid,
      },
    });
  }

  public postponeModal() {
    this.isBuyVacancyPopup = !this.isBuyVacancyPopup;
  }

  public buyNotPayedVacancy(vacancyUuid: string): void {
    this.vacancyUuid = vacancyUuid;
    if (this._localStorage.getItem("company")) {
      this.company$ = of(JSON.parse(this._localStorage.getItem("company")));
    }
    this.company$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((data) => !!data?.phone)
      )
      .subscribe((company) => {
        this.notificationCountForBalance =
          (company.packageCount ?? 0) > 0 ? company.packageCount ?? 0 : 0;
        if (!this.notificationCountForBalance) {
          window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
          this._balanceFacade.setSelectedContentReference("cards");
          this._robotHelperService.setRobotSettings({
            content: [
              `<p id="cards" style="cursor: pointer"> cards </p>`,
              `<span id="paymentHistory" style="cursor: pointer"> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. </span>`,
              `<span id="unpaidVacancies" style="cursor: pointer"> unpaidVacancies </span>`,
            ],
            navigationItemId: null,
            isContentActive: true,
          });
          this._robotHelperService.isRobotOpen$.next(true);
          if (vacancyUuid) {
            localStorage.setItem("vacancyUuid", vacancyUuid);
          }
          return;
        } else {
          this.isBuyVacancyPopup = !this.isBuyVacancyPopup;
        }
      });

    this.vacancyBuyFromCurrentPage = true;
  }

  public questionForBuyVacancyAccept(): void {
    this._balanceState.setTariffBoughtFromVacancy(true);

    if (!this.vacancyUuid && this.isTariffBoughtFromVacancy) {
      // @ts-ignore
      this.vacancyUuid = localStorage.getItem("vacancyUuid");
    }
    else {
      localStorage.removeItem("vacancyUuid");
    }

    this.service.buyNotPayedVacancy(this.vacancyUuid).subscribe(
      () => {
        this.getUnpaidVacancyList(1);
        this.buyVacancyMessage = this.popupMessageEnum.SUCCESS;
        if (this.vacancyBuyFromCurrentPage) {
          this.isBuyVacancyModal = true;
        }
        this.isBuyVacancyPopup = false;
        const companyData = JSON.parse(this._localStorage.getItem("company"));
        this._balanceState.setTariffCountChanged();
        companyData.packageCount--;
        this._localStorage.setItem("company", JSON.stringify(companyData));
        if (companyData.packageCount === 0) {
          this._balanceFacade.getAllBalanceTariff();
        }
        this._balanceState.setTariffBouth(false);
        localStorage.removeItem("vacancyUuid");
        this.cdr.detectChanges();
      },
      () => {
        this.isBuyVacancyPopup = false;
        if (this.vacancyBuyFromCurrentPage) {
          this.isBuyVacancyModal = true;
        }
        localStorage.removeItem("vacancyUuid");
        this.buyVacancyMessage = this.popupMessageEnum.FAILED;
        this.cdr.detectChanges();
      }
    );
  }

  public sendValue(value: string, type: string, statusRequest: string): void {
    this.sendValueChangeEvent$.next({value, type, statusRequest});
  }

  public getUnpaidVacancyList(
    pageNumber: number,
    searchParams: MyVacancyFilterInterface = {}
  ): void {
    this.unPaidVacancyContentHeight = this.unpaidVacanciesList?.nativeElement.scrollHeight;
    this.unPaidLoader.next(true);
    const limit = 10;
    const end = pageNumber * limit;
    const start = end - limit;
    searchParams["payedStatus"] = this.filterByStatusEnum.NOT_PAYED;
    delete searchParams["status"];
    delete searchParams["from"];
    delete searchParams["to"];
    this.unPaidListVacancies$ = this._vacancyFacade
      .getAllVacancy(start, searchParams)
      .pipe(
        delay(500),
        map((vacancies) => {
          this.isLoader$.next(false);
          this.unPaidLoader.next(false);
          this.unPaidVacanciesPagesCount(vacancies.count);
          return vacancies.result;
        })
      );
  }

  private paidVacanciesPagesCount(count: number): void {
    const limit = 10;
    this.paidVacanciesCount = Math.ceil(count / limit);
  }

  private unPaidVacanciesPagesCount(count: number): void {
    const limit = 10;
    this.unpaidVacanciesCount = Math.ceil(count / limit);
  }

  public changeStatusText(status: string): string {
    return status == this.filterByStatusEnum.COMPLETED
      ? this.payedStatusEnum.COMPLETED
      : this.payedStatusEnum.NOT_PAYED;
  }

  public status(vacancyProps: VacancyInterface): string {
    return vacancyProps.status
      ? this._translateService.instant("MY_VACANCY.SEARCH.STATUS.COMPLETED")
      : this._translateService.instant("MY_VACANCY.SEARCH.STATUS.OPEN");
  }

  public progress(vacancyProps: VacancyInterface): string {
    const day = getDiffDays(vacancyProps.deadlineDate);
    const days = [2, 3, 4];
    if (day < 0) {
      return "100%";
    } else if (day === 0) {
      return this._translateService.instant("MY_VACANCY.DAY", {
        days: 1,
      });
    } else if (days.includes(day)) {
      return this._translateService.instant("MY_VACANCY.DAYS", {
        days: day,
      });
    }
    return this._translateService.instant("MY_VACANCY.DAYS_INFINITE", {
      days: day,
    });
  }

  public getProgressPercent(vacancyProps: VacancyInterface): number {
    const x = getDiffDays(vacancyProps.deadlineDate);
    let y: number = 0;
    if (vacancyProps.createdAt) {
      y = getDiffDays(vacancyProps.deadlineDate, vacancyProps.createdAt);
    }
    if (x < 0) {
      return 100;
    }
    return ((y - x) * 100) / y;
  }

  public questionForBuyVacancyField(): void {
    this.isBuyVacancyPopup = !this.isBuyVacancyPopup;
  }
}
