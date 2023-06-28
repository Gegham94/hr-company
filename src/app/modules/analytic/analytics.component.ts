import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Observable, filter, forkJoin, mergeMap, of, takeUntil } from "rxjs";
import { ISearchableSelectData, StringOrNumberType } from "src/app/shared/interfaces/searchable-select-data.interface";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { PayedVacancyEnum, VacancyStatusEnum } from "../vacancy/constants/filter-by-status.enum";
import { RoutesEnum } from "src/app/shared/enum/routes.enum";
import { SelectAllData } from "../app/constants";
import { ICompany } from "src/app/shared/interfaces/company.interface";
import { IAnalyticData, IAnalytics } from "./interfaces/vacancy-analytics.interface";
import { AnalyticsFacade } from "./service/analytics.facade";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { RobotHelperService } from "src/app/shared/services/robot-helper.service";
import { CompanyFacade } from "../company/services/company.facade";

@Component({
  selector: "hr-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent extends Unsubscribe implements OnInit, OnDestroy {
  public readonly VacancyStatusEnum = VacancyStatusEnum;
  public readonly PayedVacancyEnum = PayedVacancyEnum;
  public readonly RoutesEnum = RoutesEnum;
  public readonly uuid?: string;
  public analyticsData!: IAnalytics | null;

  public isChooseModalOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private company$: Observable<ICompany> = this._companyFacade.getCompanyData$();
  private defaultValue1: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private defaultValue2: BehaviorSubject<string> = new BehaviorSubject<string>(SelectAllData);
  private vacancyUuid!: StringOrNumberType;

  constructor(
    private readonly _analyticsFacade: AnalyticsFacade,
    private readonly _companyFacade: CompanyFacade,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _localStorage: LocalStorageService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _robotHelperService: RobotHelperService
  ) {
    super();
    this.uuid = this._route.snapshot.queryParams?.["uuid"];
  }

  public ngOnInit(): void {
    if (this._router.url.includes("payment")) {
      this.isChooseModalOpen.next(true);
    } else {
      this.isRobot();
    }
    if (!this.uuid) {
      this.getAllAnalyticsByStatus(false);
    } else {
      this.getRouteUrl();
    }
    this.getAnalytics();
  }

  private getRouteUrl(): void {
    this._route.queryParams
      .pipe(
        filter((params) => {
          const hasParams = Object.values(params).length;
          return hasParams > 0;
        }),
        mergeMap((params) => {
          this.vacancyUuid = Object.values(params)[0];
          this.isLoader$.next(true);
          return forkJoin([
            this._analyticsFacade.getVacancyByUuid(this.vacancyUuid),
            this._analyticsFacade.getVacancyAnalytics(this.vacancyUuid),
          ]);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe({
        next: ([vacancy, vacancyAnalytics]) => {
          this._analyticsFacade.setAnalytics(vacancy, vacancyAnalytics);
          this.isLoader$.next(false);
        },
        error: () => {
          this.isLoader$.next(false);
        },
      });
  }

  private getAnalytics(): void {
    this.isLoader$.next(true);
    this._analyticsFacade
      .getAnalytics()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (data) => {
          this.analyticsData = data;
          this.isLoader$.next(false);
          this._cdr.detectChanges();
        },
        error: () => {
          this.handleError();
        },
      });
  }

  public checkIsRobot(): void {
    window.history.pushState({}, document.title, window.location.pathname);
    this.isRobot();
  }

  private isRobot(): void {
      this.company$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
        const analytics = data.helper?.find((item) => item.link === RoutesEnum.analytic);
        this._analyticsFacade.setRobotSettings({
          content: "Analytics - helper text",
          navigationItemId: 4,
          isContentActive: true,
        });
        if (analytics && !analytics.hidden) {
          this._analyticsFacade.setRobotSettings({
            content: "Analytics",
            navigationItemId: 4,
            isContentActive: true,
            uuid: analytics.uuid,
          });
          this._analyticsFacade.openRobot();
        }
      });
  }

  public getDefaultValue1(): Observable<string> {
    return this.defaultValue1.asObservable();
  }

  public getDefaultValue2(): Observable<string> {
    return this.defaultValue2.asObservable();
  }

  public countPercent(value: number, totalCandidates: number): number {
    const analyticValueForPercent = ((value / totalCandidates) * 100).toFixed(2);
    return isNaN(+analyticValueForPercent) ? 0 : +analyticValueForPercent;
  }

  public showVacancyInfo(): void {
    this._router.navigate([`/vacancy-info`], { queryParams: { uuid: this.vacancyUuid } });
  }

  public getVacancyFromSelect(selectedVacancy: ISearchableSelectData, type?: VacancyStatusEnum): void {
    this.isLoader$.next(true);
    if (type === VacancyStatusEnum.Archived) {
      this.defaultValue2.next("");
      this.defaultValue1.next(selectedVacancy.displayName);
    } else {
      this.defaultValue1.next("");
      this.defaultValue2.next(selectedVacancy.displayName);
    }

    // When filter analytics of all vacancies by status
    if (selectedVacancy.id === 0) {
      const isArchived = type === VacancyStatusEnum.Archived;
      this.getAllAnalyticsByStatus(isArchived);
      return;
    }

      this.getVacancyAndItsAnalytic(selectedVacancy);
  }

  private getVacancyAndItsAnalytic(selectedVacancy: ISearchableSelectData) {
    forkJoin([
      this._analyticsFacade.getVacancyByUuid(selectedVacancy.id),
      this._analyticsFacade.getVacancyAnalytics(selectedVacancy.id),
    ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: ([vacancy, analyticsOfVacancy]) => {
          this.vacancyUuid = selectedVacancy.id;
          this._analyticsFacade.setAnalytics(vacancy, analyticsOfVacancy);
          this.isLoader$.next(false);
        },
        error: () => {
          this.handleError();
        },
      });
  }

  private getAllAnalyticsByStatus(isArchived: boolean) {
    this._analyticsFacade
      .getAllAnalytics(isArchived)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (allAnalytics: IAnalyticData) => {
          this._analyticsFacade.setAnalytics(null, allAnalytics);
          this.isLoader$.next(false);
        },
        error: () => {
          this.handleError();
        },
      });
  }

  private handleError(): void {
    this.analyticsData = null;
    this.isLoader$.next(false);
    this._cdr.detectChanges();
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
