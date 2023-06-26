import {Injectable} from "@angular/core";
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";
import {AuthService} from "../modules/auth/auth.service";
import {LocalStorageService} from "../modules/app/services/local-storage.service";

@Injectable({providedIn: "root"})
export class AuthGuard implements CanActivate {

  constructor(
    private readonly router: Router,
    private readonly _authService: AuthService,
    private readonly _localStorage: LocalStorageService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const tariffUuid = route.queryParams["uuid"];
    if (tariffUuid) {
      this._localStorage.setItem("tariffUuid", JSON.stringify(tariffUuid));
    }
    if (this._authService.getToken && this._authService.isTokenExpired) {
      this.router.navigate(["/company"]);
      return true;
    } else {
      this.router.navigate(["/signIn"]);
      return false;
    }
  }
}
