import {ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";

import {LocalStorageService} from "../services/local-storage.service";
import {ICompany} from "../interfaces/company.interface";
import {AuthService} from "../../modules/auth/service/auth.service";
import {RoutesEnum} from "../enum/routes.enum";
import {NavigateButtonFacade} from "../../ui-kit/navigate-button/navigate-button.facade";
import {CompanyFacade} from "../../modules/company/services/company.facade";
import {NavigationButton} from "../interfaces/navigateButton.interface";

@Injectable({
  providedIn: "root",
})
export class AccountGuard implements CanActivateChild {
  public readonly Routes = RoutesEnum;
  public localCompanyData!: Partial<ICompany>;

  constructor(
    private readonly _authService: AuthService,
    private readonly _localStorage: LocalStorageService,
    private readonly _companyFacade: CompanyFacade,
    private readonly _navigateButtonFacade: NavigateButtonFacade,
    private readonly _router: Router
  ) {}

  public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isLogged = this._authService.getToken && this._authService.isTokenExpired;

    if (isLogged) {
      if (state.url === this.Routes.company) {
        return true;
      } else {
        const navigations: NavigationButton[] | undefined =
          localStorage.getItem("navigationState") ? JSON.parse(atob(localStorage.getItem("navigationState")!)) : undefined;
        if (navigations) {
          const requiredHelper = navigations.find((helper) => helper.link === state.url);
          if (requiredHelper) {
            if (requiredHelper.statusType === "default") {
              return true;
            }
            void this._router.navigateByUrl(RoutesEnum.forbidden);
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      }
    }

    this._authService.logOut();
    void this._router.navigateByUrl(RoutesEnum.signIn);
    return false;
  }
}
