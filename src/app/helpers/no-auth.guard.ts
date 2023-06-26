import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../modules/auth/auth.service";


@Injectable({ providedIn: "root" })
export class NoAuthGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    private readonly _authService: AuthService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return !this._authService.getToken;
  }
}
