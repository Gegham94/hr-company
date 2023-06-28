import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, filter, Observable, of, takeUntil } from "rxjs";
import { FilterByStatusEnum } from "../../vacancy/constants/filter-by-status.enum";
import { AnalyticsFacade } from "../service/analytics.facade";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ProgressBarEnum } from "src/app/shared/enum/progress-bar.enum";
import { PayedStatusEnum } from "src/app/shared/enum/payed-status.enum";
import { RoutesEnum } from "src/app/shared/enum/routes.enum";
import { ICompany } from "src/app/shared/interfaces/company.interface";
import { VacancyFacade } from "../../vacancy/services/vacancy.facade";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";
import { IAddVacancy } from "src/app/shared/interfaces/add-vacancy.interface";
import { IVacancy } from "src/app/shared/interfaces/vacancy.interface";
import { CompanyFacade } from "../../company/services/company.facade";

@Component({
  selector: "hr-vacancy-info",
  templateUrl: "./vacancy-info.component.html",
  styleUrls: ["./vacancy-info.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacancyInfoComponent extends Unsubscribe implements OnInit, OnDestroy {
  public vacancies!: IAddVacancy | null;
  public isRobotHelper: Observable<boolean> = this._analyticsFacade.getIsRobotHelper$();
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly ProgressBarEnum = ProgressBarEnum;
  public readonly PayedStatusEnum = PayedStatusEnum;
  public readonly FilterByStatusEnum = FilterByStatusEnum;
  public readonly RoutesEnum = RoutesEnum;
  private readonly company$: Observable<ICompany> = this._companyFacade.getCompanyData$();

  constructor(
    private readonly _analyticsFacade: AnalyticsFacade,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _companyFacade: CompanyFacade,
    private readonly _router: ActivatedRoute,
    private readonly _localStorage: LocalStorageService,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this.isRobot();
    this.isLoader$.next(true);
    this._router.queryParams.subscribe((params) => {
      this._analyticsFacade
        .getVacancyByUuid(Object.values(params)[0])
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (vacancy) => {
            this.vacancies = vacancy.result[0];
            this.isLoader$.next(false);
            this._cdr.detectChanges();
          },
          error: () => {
            this.vacancies = null;
            this.isLoader$.next(false);
            this._cdr.detectChanges();
          },
        });
    });
  }

  public getCreatedDate(date: string): string {
    return new Date(date).toISOString().slice(0, 10);
  }

  public progress(vacancyProps: IVacancy | IAddVacancy): string {
    return this._vacancyFacade.progress(vacancyProps as IVacancy);
  }

  public getProgressPercent(vacancyProps: IVacancy | IAddVacancy): number {
    return this._vacancyFacade.getProgressPercent(vacancyProps as IVacancy);
  }

  private isRobot(): void {
    this.company$.pipe(filter((data) => !!data?.phone)).subscribe((data) => {
      const vacancyInfo = data.helper?.find((item) => item.link === RoutesEnum.vacancyInfo);
      this._analyticsFacade.setRobotSettings({
        content: "Vacancy info - helper text",
        navigationItemId: null,
        isContentActive: true,
      });
      if (vacancyInfo && !vacancyInfo?.hidden) {
        this._analyticsFacade.setRobotSettings({
          content: "Vacancy info",
          navigationItemId: null,
          isContentActive: true,
          uuid: vacancyInfo?.uuid,
        });
        this._analyticsFacade.openRobot();
      }
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }
}
