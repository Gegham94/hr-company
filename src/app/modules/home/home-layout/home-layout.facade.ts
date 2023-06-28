import {Injectable} from "@angular/core";
import {Observable, takeUntil} from "rxjs";
import {HomeLayoutState} from "./home-layout.state";
import {LocalStorageService} from "../../../shared/services/local-storage.service";
import {NavigateButtonFacade} from "../../../ui-kit/navigate-button/navigate-button.facade";
import {Router} from "@angular/router";
import {CompanyFacade} from "../../company/services/company.facade";
import {VacancyFacade} from "../../vacancy/services/vacancy.facade";
import {RoutesEnum} from "../../../shared/enum/routes.enum";
import {RobotHelperService} from "../../../shared/services/robot-helper.service";
import {Unsubscribe} from "../../../shared/unsubscriber/unsubscribe";

@Injectable({
  providedIn: "root"
})
export class HomeLayoutFacade extends Unsubscribe {
  public isCompletedVacancyCreate!: boolean;
  public isCompletedVacancyCreate$ = this._vacancyFacade.isCompletedVacancyCreate()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(data => {
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
    super();
  }

  public close(): void {
    this._robotHelperService.isRobotOpen$.next(false);

    const robotSettings = this._robotHelperService.robot$.value;
    if (robotSettings?.uuid) {

      const company = this._companyFacade.getCompanyData();

      const currentPageRobotSettings =
        company.helper?.findIndex(page => page["uuid"] === robotSettings?.uuid) ?? -1;

      if (this._router.url === "/vacancy/create-information") {
        this._robotHelperService.setRobotSettings({
          content: "Step 2 - helper",
          navigationItemId: null,
          isContentActive: true,
        });
      }

      if (robotSettings?.link && robotSettings?.link === "/company-after-save") {
        this._router.navigateByUrl("/vacancy/create-filter");
      } else
      if (currentPageRobotSettings >= 0 && company?.helper && !company.helper[currentPageRobotSettings]["hidden"]) {
        company.helper[currentPageRobotSettings]["hidden"] = true;
        this._companyFacade.setCompanyData(company);
        this._companyFacade.updateCurrentPageRobot(company.helper[currentPageRobotSettings].uuid)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe();
      }

    }
  }

  public getIsRobotHelper$(): Observable<boolean> {
    return this._homeLayoutState.getIsRobotHelper$();
  }

}
