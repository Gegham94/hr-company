import {Injectable} from "@angular/core";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import {AuthService} from "../modules/auth/auth.service";
import {RoutesEnum} from "../modules/app/constants/routes.enum";
import {LocalStorageService} from "../modules/app/services/local-storage.service";
import {CompanyInterface} from "../modules/app/interfaces/company.interface";

@Injectable({
  providedIn: "root",
})
export class AccountGuard implements CanActivateChild {
  private readonly isLogged = !!(
    this._authService.getToken && this._authService.isTokenExpired
  );
  public readonly Routes = RoutesEnum;
  public localCompanyData!: Partial<CompanyInterface>;

  constructor(
    private readonly _authService: AuthService,
    private readonly _localStorage: LocalStorageService,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute
  ) {
  }

  public canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    if (this.isLogged) {
      if (state.url === this.Routes.company) {
        return true;
      } else {
        if (this._localStorage.getItem("company")) {
          const storedCompany: CompanyInterface = JSON.parse(
            this._localStorage.getItem("company")
          );
          this.localCompanyData = {
            helper: storedCompany.helper,
            packageCount: storedCompany.packageCount,
          };
        }
        const requiredHelper = this.localCompanyData.helper?.find(
          (helper) => helper.link === state.url + "/isActive"
        );

        if (requiredHelper) {
          if (requiredHelper.hidden) {
            return true;
          }
          void this._router.navigateByUrl(RoutesEnum.forbidden);
          return false;
        } else {
          return true;
        }
      }
    }

    this._authService.logOut();
    void this._router.navigateByUrl(RoutesEnum.signIn);
    return false;
  }
}
