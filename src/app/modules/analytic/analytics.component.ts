import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {VacancyInterface} from "src/app/modules/app/interfaces/vacancy.interface";
import {EChartsOption} from "echarts/types/dist/echarts";
import {AnalyticData, VacancyStatisticInterface} from "src/app/modules/app/interfaces/vacancy-statistic.interface";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {VacancyFacade} from "../vacancy/vacancy.facade";
import {BehaviorSubject, filter, forkJoin, mergeMap, Observable, of, takeUntil} from "rxjs";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {AddVacancyInterface} from "../app/interfaces/add-vacancy.interface";
import {SearchableSelectDataInterface} from "../app/interfaces/searchable-select-data.interface";
import {analyticMock} from "./mock/analytic-mock";
import {HomeLayoutState} from "../home/home-layout/home-layout.state";
import {RobotHelperService} from "../app/services/robot-helper.service";
import {LocalStorageService} from "../app/services/local-storage.service";
import {CompanyInterface} from "../app/interfaces/company.interface";
import {PayedVacancyEnum, VacancyStatusEnum} from "../vacancy/constants/filter-by-status.enum";
import {SelectAllData} from "../app/constants";

@Component({
  selector: "hr-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.scss"]
})
export class AnalyticsComponent extends Unsubscribe implements OnInit, OnDestroy {

  public all = {
    id: 0,
    value: "Все",
    displayName: "Все",
    count: -1
  };

  public statisticAllCount: number = 0;
  public showAnalytic: boolean = false;
  public showVacancyName: boolean = false;
  public isSelectShow: boolean = false;
  public vacancyAnalyticList!: VacancyInterface;
  public option!: EChartsOption;
  public vacancyStatisticList: VacancyStatisticInterface[] = [];
  public vacancyStatisticListByPercents: VacancyStatisticInterface[] = [];
  private userId!: string;
  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();
  public company$: Observable<CompanyInterface> = of(JSON.parse(this._localStorage.getItem("company")));
  public readonly VacancyStatusEnum = VacancyStatusEnum;
  public readonly PayedVacancyEnum = PayedVacancyEnum;
  public defaultValue1: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public defaultValue2: BehaviorSubject<string> = new BehaviorSubject<string>(SelectAllData);
  public isChooseModalOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public uuid?: string;
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private readonly _translateService: TranslateService,
              private route: ActivatedRoute,
              private router: Router,
              private _vacancyFacade: VacancyFacade,
              private _homeLayoutState: HomeLayoutState,
              private readonly _robotHelperService: RobotHelperService,
              private readonly _localStorage: LocalStorageService,
              private cdr: ChangeDetectorRef) {
    super();
    this.uuid = this.route.snapshot.queryParams?.["uuid"];
  }

  public ngOnInit(): void {
    if (this.router.url.includes("payment")) {
      this.isChooseModalOpen.next(true);
    } else {
      this.isRobot();
    }
    this.getRouteUrl();
  }

  public checkIsRobot(): void {
    window.history.pushState({}, document.title, window.location.pathname);
    this.isRobot();
  }

  public isRobot(): void {
    if (this._localStorage.getItem("company")) {
      this.company$ = of(JSON.parse(this._localStorage.getItem("company")));
    }
    this.company$
      .pipe(filter(data => !!data?.phone))
      .subscribe(data => {
        const analytics = data.helper?.find((item => item.link === "/analytic"));

        this._robotHelperService.setRobotSettings({
          content: "Analytics - helper text",
          navigationItemId: 4,
          isContentActive: true,
        });

        if (analytics && !analytics?.hidden) {
          this._robotHelperService.setRobotSettings({
            content: "Analytics",
            navigationItemId: 4,
            isContentActive: true,
            uuid: analytics?.uuid
          });
          this._robotHelperService.isRobotOpen$.next(true);
        }
      });
  }

  public getDefaultValue1() {
    return this.defaultValue1.asObservable();
  }

  public getDefaultValue2() {
    return this.defaultValue2.asObservable();
  }

  private getRouteUrl(): void {
    this.route.queryParams.pipe(
      filter((params) => {
        const hasParams = Object.values(params).length;
        if (!hasParams) {
          this.isSelectShow = true;
        }
        return hasParams > 0;
      }),
      mergeMap((params) => {
        const uuid = Object.values(params)[0];
        return forkJoin([
          this._vacancyFacade.getVacancie(uuid),
          this._vacancyFacade.getVacancyAnalytics(uuid)]);
      }),
      takeUntil(this.ngUnsubscribe))
      .subscribe(([vacancy, vacancyAnalytic]) => {
        this.getVacancyAndAnalytics(vacancy, vacancyAnalytic);
        this.isSelectShow = false;
        this.showVacancyName = true;
        this.showAnalytic = true;
        this.cdr.detectChanges();
      });
  }

  private getOptions(): void {
    this.option = {
      tooltip: {
        trigger: "item",
        formatter: "{b} : {c}"
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: "68%",
          itemStyle: {
            borderColor: "white",
            borderWidth: 2
          },
          data: this.vacancyStatisticListByPercents,
          label: {
            formatter: "{d}%",
            edgeDistance: 1,
            lineHeight: 1,
            fontWeight: 500
          },
          labelLine: {
            length: 4,
            length2: 4,
          },
        }
      ],
      animation: false,
      color: ["#008FFB", "#3BD252", "#FF4560", "#775DD0", "#FEB019", "brown"]
    };
  }

  private statisticsCount(): void {
    this.statisticAllCount = 0;
    this.vacancyStatisticList.map(vacancy => {
      this.statisticAllCount += vacancy.value;
    });
  }

  public countPercent(value: number): number {
    this.statisticsCount();
    const analyticValueForPercent = ((value / this.statisticAllCount) * 100).toFixed(2);
    return isNaN(+analyticValueForPercent) ? 0 : +analyticValueForPercent;
  }

  public showSpecialistAnalytic(): void {
    this.router.navigate([`/vacancy-info`], {queryParams: {uuid: this.userId}});
  }

  public getVacancyFromSelect(selectedVacancy: SearchableSelectDataInterface, type?: VacancyStatusEnum): void {
    if (type === VacancyStatusEnum.Archived) {
      this.defaultValue2.next("");
      this.defaultValue1.next(selectedVacancy.displayName);
    } else {
      this.defaultValue1.next("");
      this.defaultValue2.next(selectedVacancy.displayName);
    }
    this.isLoader$.next(true);
    if (selectedVacancy.id === 0 && !Boolean(this.uuid)) {
      const isArchived = type === VacancyStatusEnum.Archived;
      this._vacancyFacade.getAllAnalytics(isArchived)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((allAnalytics) => {

          this.getVacancyAnalytic(allAnalytics);
          this.showAnalytic = true;
          this.showVacancyName = false;
          this.isLoader$.next(false);
          this.cdr.detectChanges();
        }, () => {
          this.showAnalytic = true;
          this.showVacancyName = false;
          this.vacancyStatisticList = [];
          this.vacancyStatisticListByPercents = [];
          this.isLoader$.next(false);
          this.cdr.detectChanges();
        });
      return;
    }

    forkJoin([
      this._vacancyFacade.getVacancie(selectedVacancy.id),
      this._vacancyFacade.getVacancyAnalytics(selectedVacancy.id)])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([v, vacancyAnalytic]) => {
        this.getVacancyAndAnalytics(v, vacancyAnalytic);
        this.showAnalytic = true;
        this.showVacancyName = true;
        this.isLoader$.next(false);
        this.cdr.detectChanges();
      }, () => {
        this.isLoader$.next(false);
      });
  }

  private getVacancyAndAnalytics(_analyticVacancy: AddVacancyInterface, analyticStatistics: AnalyticData) {
    const analyticVacancy = _analyticVacancy.result[0];
    this.vacancyAnalyticList = {
      name: analyticVacancy?.name,
      deadlineDate: analyticVacancy?.deadlineDate,
      payedStatus: analyticVacancy?.payedStatus
    };
    this.userId = analyticVacancy?.uuid;
    this.getVacancyAnalytic(analyticStatistics);
  }

  private getVacancyAnalytic(analyticStatistics: AnalyticData): void {
    this.vacancyStatisticList = [];
    this.vacancyStatisticListByPercents = [];
    analyticMock.forEach((item) => {
      for (const [key, value] of Object.entries(item)) {
        const match = analyticStatistics.data.find(
          (status) => status.interviewStatus === key
        );
        this.vacancyStatisticList.push({
          name: value.name,
          value: match ? match.count : 0,
        });
        this.vacancyStatisticListByPercents.push({
          name: value.name,
          value: match ? match.count : 0,
        });
      }
    });
    this.getOptions();
    this.statisticsCount();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

}
