import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AnalyticsState} from "./analytics.state";
import {
  IAnalyticData,
  IAnalytics,
  ISelectedVacancy,
  IVacancyStatistics
} from "../interfaces/vacancy-analytics.interface";
import {AnalyticsService} from "./analytics.service";
import {AnalyticMock, AnalyticsChartOptions} from "../mock/analytic-mock";
import {HomeLayoutState} from "../../home/home-layout/home-layout.state";
import { RobotHelperService } from "src/app/shared/services/robot-helper.service";
import { IRobotHelper } from "src/app/shared/interfaces/robot-helper.interface";
import { IAddVacancy } from "src/app/shared/interfaces/add-vacancy.interface";
import { StringOrNumberType } from "src/app/shared/interfaces/searchable-select-data.interface";

@Injectable({
  providedIn: "root"
})
export class AnalyticsFacade {
  constructor(
    private readonly _analyticsState: AnalyticsState,
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _analyticsService: AnalyticsService,
    private readonly _robotHelperService: RobotHelperService
  ) {
  }

  public setRobotSettings(settings: IRobotHelper): void {
    this._robotHelperService.setRobotSettings(settings);
  }

  public openRobot(): void {
    this._robotHelperService.isRobotOpen$.next(true);
  }

  public getIsRobotHelper$(): Observable<boolean> {
    return this._homeLayoutState.getIsRobotHelper$();
  }

  public getAnalytics(): Observable<IAnalytics> {
    return this._analyticsState.getAnalytics();
  }

  public setAnalytics(vacancy: IAddVacancy | null, analytics: IAnalyticData): void {
    let selectedVacancy!: ISelectedVacancy;
    const vacancyStatisticList: IVacancyStatistics[] = [];

    if (vacancy) {
      const analyticVacancy = vacancy.result[0];
      selectedVacancy = {
        name: analyticVacancy?.name,
        deadlineDate: analyticVacancy?.deadlineDate,
        payedStatus: analyticVacancy?.payedStatus
      };
    }

    AnalyticMock.forEach((item) => {
      for (const [key, value] of Object.entries(item)) {
        const match = analytics.data.find(
          (status) => status.interviewStatus === key
        );
        vacancyStatisticList.push({
          name: value.name,
          value: match ? match.count : 0,
        });
      }
    });

    const totalCandidates =
      vacancyStatisticList.reduce((total, item) => total + item.value, 0);

    if (Array.isArray(AnalyticsChartOptions.series)) {
      AnalyticsChartOptions.series[0].data = vacancyStatisticList;
    }

    const data: IAnalytics = {
      analyticsChartOptions: {...AnalyticsChartOptions},
      selectedVacancy: selectedVacancy ?? [],
      vacancyStatisticList: vacancyStatisticList,
      totalCandidates: totalCandidates
    };
    this._analyticsState.setAnalytics(data);
  }


  public getVacancyAnalytics(uuid: StringOrNumberType): Observable<IAnalyticData> {
    return this._analyticsService.getVacancyAnalytic(uuid);
  }

  public getAllAnalytics(isArchived?: boolean): Observable<IAnalyticData> {
    return this._analyticsService.getAllAnalytic(isArchived);
  }

  public getVacancyByUuid(uuid: StringOrNumberType): Observable<IAddVacancy> {
    return this._analyticsService.getVacancyByUuid(uuid);
  }


}
