import {Injectable} from "@angular/core";
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from "@angular/common/http";

import {Observable} from "rxjs";
import {AuthService} from "../modules/auth/auth.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private readonly _authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this._authService.getToken;
    if (token && this._authService.isTokenExpired) {

      // TODO: ENV - MODE

      request = request.clone({
        setHeaders: {Authorization: `Bearer ${token}`, mode: "dev"}
      });
    }
    return next.handle(request);
  }
}
