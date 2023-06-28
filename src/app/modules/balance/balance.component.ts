import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";

import {ActivatedRoute, Router} from "@angular/router";
import {BalanceFacade} from "./services/balance.facade";

import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  delay,
  filter,
  map,
  Observable,
  startWith,
  switchMap,
  takeUntil,
} from "rxjs";
import {Unsubscribe} from "../../shared/unsubscriber/unsubscribe";
import {FilterByStatusEnum} from "../vacancy/constants/filter-by-status.enum";
import {IMyVacancyFilter} from "../vacancy/interfaces/my-vacancy-filter.interface";
import {ISearchableSelectData} from "../../shared/interfaces/searchable-select-data.interface";
import {MyVacancyFilterEnum} from "../vacancy/constants/my-vacancy-filter.enum";
import {PopupMessageEnum} from "../../shared/enum/popup-message.enum";
import {FilterByStatus} from "../vacancy/constants/filter-by-status";
import {VacancyStatusEnum} from "../vacancy/constants/vacancy-status.enum";
import {LocalStorageService} from "../../shared/services/local-storage.service";
import {ProgressBarEnum} from "../../shared/enum/progress-bar.enum";
import {IVacancy} from "../../shared/interfaces/vacancy.interface";
import {IUnpaidList} from "src/app/shared/interfaces/unpaid-list.interface";
import {IPaidList} from "src/app/shared/interfaces/paid-list.interface";
import {PayedStatusEnum} from "src/app/shared/enum/payed-status.enum";
import {CompanyFacade} from "../company/services/company.facade";

@Component({
  selector: "hr-balance",
  templateUrl: "./balance.component.html",
  styleUrls: ["./balance.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalanceComponent extends Unsubscribe implements OnInit, OnDestroy {
  @ViewChild("cards") cards!: ElementRef;
  @ViewChild("paymentHistory") paymentHistory!: ElementRef;
  @ViewChild("unpaidVacancies") unpaidVacancies!: ElementRef;
  @ViewChild("unpaidVacanciesList") unpaidVacanciesList!: ElementRef;

  public isChooseModalOpen: Observable<boolean> = this._balanceFacade.getIsChooseModalOpen();
  public notificationCountForBalance: number = 0;
  public unpaidListVacancies$!: Observable<IUnpaidList[]>;
  public paidListVacancies$!: Observable<IPaidList[]>;
  public paidLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public unpaidLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public unpaidVacancyContentHeight = 0;
  public paidVacancyContentHeight = 0;
  public boughtVacancyModal: boolean = false;
  public isBuyVacancyModal: boolean = false;
  public buyVacancyMessage!: string;
  public paidVacanciesCount: number = 0;
  public unpaidVacanciesCount: number = 0;
  public myVacancyFilterEnum = MyVacancyFilterEnum;
  public vacancyStatusEnum = VacancyStatusEnum;
  public progressTypeProps = ProgressBarEnum;
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isBlockActive: BehaviorSubject<boolean[]> = new BehaviorSubject<boolean[]>([true, false, false]);

  public readonly statusList: ISearchableSelectData[] = [
    {
      id: 1,
      value: "Все".toLowerCase(),
      displayName: "Все",
    },
    {
      id: 2,
      value: "Завершенные".toLowerCase(),
      displayName: "Завершенные",
    },
    {
      id: 3,
      value: "Не оплачено".toLowerCase(),
      displayName: "Не оплачено",
    },
  ];

  private popupMessageEnum = PopupMessageEnum;
  private vacancyUuid!: string;
  private vacancyBuyFromCurrentPage?: boolean = false;
  private isTariffBoughtFromVacancy: boolean = false;
  private payedStatusEnum = PayedStatusEnum;
  private filterByStatusEnum = FilterByStatusEnum;
  private filterByStatus = FilterByStatus;
  private subject: BehaviorSubject<string> = new BehaviorSubject("");
  private value: { [key: string]: string } = {};
  private sendValueChangeEvent$: BehaviorSubject<{
    value: string;
    type: string;
    statusRequest: string;
  }> = new BehaviorSubject({value: "", type: "", statusRequest: ""});

  constructor(
    private readonly _router: Router,
    private readonly _balanceFacade: BalanceFacade,
    private readonly _companyFacade: CompanyFacade,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _localStorage: LocalStorageService,
    private readonly _activatedRoute: ActivatedRoute,
  ) {
    super();
  }

  public ngOnInit(): void {
    this._balanceFacade
      .getSelectedContentReference()
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
        this._cdr.markForCheck();
      });

    if (this._router.url.includes("payment")) {
      this._balanceFacade.setIsChooseModalOpen(true);
      this.isChooseModalOpen = this._balanceFacade.getIsChooseModalOpen();
    } else {
      this._companyFacade.getCompanyData$()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(company => {
          this._balanceFacade.isRobot(company);
        });
    }

    this.getCompanyBalanceOrders(1);

    if (!this._activatedRoute.snapshot.queryParams["fromVacancy"]) {
      localStorage.removeItem("vacancyUuid");
    }

    combineLatest([
      this._balanceFacade.getTariffBouth().pipe(startWith(null), takeUntil(this.ngUnsubscribe)),
    ]).subscribe(([isBought]) => {
      if (isBought) {
        this.isTariffBoughtFromVacancy = isBought;
        this.questionForBuyVacancyAccept();
      }
    });

    this.getUnpaidVacancyList(1);

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
        this._cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  public checkIsRobot(): void {
    window.history.pushState({}, document.title, window.location.pathname);
    this._companyFacade.getCompanyData$()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(company => {
        this._balanceFacade.isRobot(company);
      });
  }

  public scrollToReference(item: ElementRef): void {
    item?.nativeElement.scrollIntoView({behavior: "smooth", block: "center"});
  }

  public getCompanyBalanceOrders(pageNumber: number): void {
    this.paidLoader.next(true);
    const limit = 10;
    const end = pageNumber * limit;
    const start = end - limit;
    delete this.value["name_query"];
    this.paidListVacancies$ = this.subject.pipe(
      delay(500),
      switchMap(() => this._balanceFacade.getCompanyBalanceOrders(start, this.value)),
      map((vacancies) => {
        this.paidVacanciesPagesCount(vacancies.count);
        this.isLoader$.next(false);
        this.paidLoader.next(false);
        return vacancies.result;
      })
    );
  }

  public closeBoughtVacancyModal(): void {
    this.boughtVacancyModal = !this.boughtVacancyModal;
  }

  public closeBuyVacancyModal() {
    this.isBuyVacancyModal = !this.isBuyVacancyModal;
  }

  public updateVacancy(uuid: string | undefined) {
    this._router.navigate(["company/vacancies/add-description-part"], {
      queryParams: {
        uuid: uuid,
      },
    });
  }

  public buyNotPayedVacancy(vacancyUuid: string): void {
    this.vacancyUuid = vacancyUuid;
    this._companyFacade.getCompanyData$()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        filter((data) => !!data?.phone)
      )
      .subscribe((company) => {
        this.notificationCountForBalance = (company.packageCount ?? 0) > 0 ? company.packageCount ?? 0 : 0;
        if (!this.notificationCountForBalance) {
          window.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
          this._balanceFacade.setSelectedContentReference("cards");
          this._balanceFacade.setRobotSettings({
            content: [
              `<p id="cards" style="cursor: pointer"> cards </p>`,
              `<span id="paymentHistory" style="cursor: pointer"> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. </span>`,
              `<span id="unpaidVacancies" style="cursor: pointer"> unpaidVacancies </span>`,
            ],
            navigationItemId: null,
            isContentActive: true,
          });
          this._balanceFacade.setIsRobotOpen(true);
          if (vacancyUuid) {
            localStorage.setItem("vacancyUuid", vacancyUuid);
          }
          return;
        } else {
          this.isBuyVacancyModal = !this.isBuyVacancyModal;
        }
      });
    this.vacancyBuyFromCurrentPage = true;
  }

  public questionForBuyVacancyAccept(): void {
    this._balanceFacade.setTariffBoughtFromVacancy(true);

    if (!this.vacancyUuid && this.isTariffBoughtFromVacancy) {
      // @ts-ignore
      this.vacancyUuid = localStorage.getItem("vacancyUuid");
    } else {
      localStorage.removeItem("vacancyUuid");
    }

    this._balanceFacade.buyNotPayedVacancy(this.vacancyUuid).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.getUnpaidVacancyList(1);
          this.buyVacancyMessage = this.popupMessageEnum.SUCCESS;
          if (this.vacancyBuyFromCurrentPage) {
            this.boughtVacancyModal = true;
          }
          this.isBuyVacancyModal = false;
          const companyData = this._companyFacade.getCompanyData();
          this._balanceFacade.setTariffCountChanged();
          if (companyData.packageCount && companyData.packageCount > 0) {
            companyData.packageCount--;
            this._companyFacade.setCompanyData(companyData);
          }
          this._balanceFacade.setTariffBouth(false);
          localStorage.removeItem("vacancyUuid");
          this._cdr.detectChanges();
        },
        error: () => {
          this.isBuyVacancyModal = false;
          if (this.vacancyBuyFromCurrentPage) {
            this.boughtVacancyModal = true;
          }
          localStorage.removeItem("vacancyUuid");
          this.buyVacancyMessage = this.popupMessageEnum.FAILED;
          this._cdr.detectChanges();
        }
      });
  }

  public sendValue(value: string, type: string, statusRequest: string): void {
    this.sendValueChangeEvent$.next({value, type, statusRequest});
  }

  public getUnpaidVacancyList(pageNumber: number, searchParams: IMyVacancyFilter = {}): void {
    this.unpaidVacancyContentHeight = this.unpaidVacanciesList?.nativeElement.scrollHeight;
    this.unpaidLoader.next(true);
    this.unpaidListVacancies$ = this._balanceFacade.getUnpaidVacancyList(pageNumber, searchParams).pipe(
      delay(500),
      map((vacancies) => {
        this.isLoader$.next(false);
        this.unpaidLoader.next(false);
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

  public status(vacancyProps: IVacancy): string {
    return this._balanceFacade.getStatus(vacancyProps);
  }

  public progress(vacancyProps: IVacancy): string {
    return this._balanceFacade.getProgress(vacancyProps);
  }

  public getProgressPercent(vacancyProps: IVacancy): number {
    return this._balanceFacade.getProgressPercent(vacancyProps);
  }

  public questionForBuyVacancyField(): void {
    this.isBuyVacancyModal = !this.isBuyVacancyModal;
  }
}
