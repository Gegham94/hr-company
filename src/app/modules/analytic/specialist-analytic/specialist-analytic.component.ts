import {ChangeDetectorRef, Component, ElementRef, ViewChild} from "@angular/core";
import {VacancyFacade} from "../../vacancy/vacancy.facade";
import {ActivatedRoute} from "@angular/router";
import {filter, Observable, of} from "rxjs";
import {HomeLayoutState} from "../../home/home-layout/home-layout.state";
import {CompanyInterface} from "../../app/interfaces/company.interface";
import {RobotHelperService} from "../../app/services/robot-helper.service";
import {LocalStorageService} from "../../app/services/local-storage.service";
import {ProgressBarEnum} from "../../app/constants/progress-bar.enum";
import {PayedStatusEnum} from "../../app/constants/payed-status.enum";
import {FilterByStatusEnum} from "../../vacancy/constants/filter-by-status.enum";
import {VacancyInterface} from "../../app/interfaces/vacancy.interface";

@Component({
  selector: "hr-specialist-analytic",
  templateUrl: "./specialist-analytic.component.html",
  styleUrls: ["./specialist-analytic.component.scss"]
})
export class SpecialistAnalyticComponent {

  @ViewChild("jobVacancies") jobVacanciesTemplate!: ElementRef;
  public vacancies!: any;
  public isRobotHelper: Observable<boolean> = this._homeLayoutState.getIsRobotHelper$();
  public company$: Observable<CompanyInterface> = of(JSON.parse(this._localStorage.getItem("company")));
  public readonly ProgressBarEnum = ProgressBarEnum;
  public readonly PayedStatusEnum = PayedStatusEnum;
  public readonly FilterByStatusEnum = FilterByStatusEnum;

  constructor(
    private _vacancyFacade: VacancyFacade,
    private _homeLayoutState: HomeLayoutState,
    private router: ActivatedRoute,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _localStorage: LocalStorageService,
    private cdr: ChangeDetectorRef) {

    this.router.queryParams.subscribe((params) => {
      const uuid = Object.values(params)[0];
      this._vacancyFacade.getVacancie(uuid)
        .subscribe((vacancy) => {
          this.vacancies = vacancy.result;
          this.cdr.detectChanges();
        });
    });
  }

  public ngOnInit(): void {
    this.isRobot();
  }

  public getCreatedDate(date: string): string {
    return new Date(date).toISOString().slice(0, 10);
  }

  public progress(vacancyProps: VacancyInterface): string {
    return this._vacancyFacade.progress(vacancyProps);
  }

  public getProgressPercent(vacancyProps: VacancyInterface): number {
    return this._vacancyFacade.getProgressPercent(vacancyProps);
  }

  public isRobot(): void {
    this.company$
      .pipe(filter(data => !!data?.phone))
      .subscribe(data => {
        const vacancyInfo = data.helper?.find((item => item.link === "/vacancy-info"));

        this._robotHelperService.setRobotSettings({
          content: "Vacancy info - helper text",
          navigationItemId: null,
          isContentActive: true,
        });

        if (vacancyInfo && !vacancyInfo?.hidden) {
          this._robotHelperService.setRobotSettings({
            content: "Vacancy info",
            navigationItemId: null,
            isContentActive: true,
            uuid: vacancyInfo?.uuid
          });
          this._robotHelperService.isRobotOpen$.next(true);
        }
      });
  }

}
