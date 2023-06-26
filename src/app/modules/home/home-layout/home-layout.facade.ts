import {Injectable} from "@angular/core";
import {delay, forkJoin, Observable, of, switchMap, takeUntil} from "rxjs";
import {CompanyInterface} from "../../app/interfaces/company.interface";
import {HomeLayoutState} from "./home-layout.state";
import {LocalStorageService} from "../../app/services/local-storage.service";
import {NavigateButtonFacade} from "../../../ui-kit/navigate-button/navigate-button.facade";
import {Router} from "@angular/router";
import {CompanyFacade} from "../../company/company.facade";
import {VacancyFacade} from "../../vacancy/vacancy.facade";
import {RoutesEnum} from "../../app/constants/routes.enum";
import {RobotHelperService} from "../../app/services/robot-helper.service";

@Injectable({
  providedIn: "root"
})
export class HomeLayoutFacade {
  public company$!: Observable<CompanyInterface>;
  public isCompletedVacancyCreate!: boolean;
  public isCompletedVacancyCreate$ = this._vacancyFacade.isCompletedVacancyCreate().subscribe(data => {
    this.isCompletedVacancyCreate = data;
  });
  public readonly Routes = RoutesEnum;

  constructor(
    private readonly _homeLayoutState: HomeLayoutState,
    private readonly _localStorage: LocalStorageService,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _companyFacade: CompanyFacade,
    private readonly _vacancyFacade: VacancyFacade,
    private readonly _robotHelperService: RobotHelperService,
    private readonly _router: Router,
  ) {
  }

  public close(): void {
    this._robotHelperService.isRobotOpen$.next(false);

    const robotSettings = this._robotHelperService.robot$.value;
    if (robotSettings?.uuid && this._localStorage.getItem("company")) {
      this.company$ = of(JSON.parse(this._localStorage.getItem("company")));
      this.company$.pipe(
        switchMap((data: CompanyInterface) => {
          const currentPageRobotSettings =
            data.helper?.findIndex(page => page["uuid"] === robotSettings?.uuid) ?? -1;

          if (this._router.url === "/vacancy/create-information") {
            this._robotHelperService.setRobotSettings({
              content: "Step 2 - helper",
              navigationItemId: null,
              isContentActive: true,
            });
          }

          if (currentPageRobotSettings >= 0 && data?.helper && !data.helper[currentPageRobotSettings]["hidden"]) {
            data.helper[currentPageRobotSettings]["hidden"] = true;
            this._localStorage.setItem("company", JSON.stringify(data));
            return this._companyFacade.updateCurrentPageRobot(data.helper[currentPageRobotSettings].uuid);
          }
          return of([]);
        })
      ).subscribe(() => {
        if (robotSettings?.link && robotSettings?.link === "/company-after-save") {
          this._router.navigateByUrl("/vacancy/create-filter");
        }
      });
    }
  }

}
