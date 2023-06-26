import {Injectable} from "@angular/core";
import {AuthService} from "../auth.service";
import {CompanyInterface} from "../../app/interfaces/company.interface";
import {Router} from "@angular/router";
import {CompanyState} from "../../company/company.state";
import {BehaviorSubject, catchError, finalize, map, Observable, of, switchMap, tap, throwError} from "rxjs";
import {ErrorMsg} from "../error-message.type";
import {SignInState} from "./signin.state";
import {SendPhoneInterface} from "../../app/interfaces/send-phone.interface";
import {ResetPasswordInterface} from "../../app/interfaces/reset-password.interface";
import {errorMock} from "../errorMock/error-mock";
import {ErrorMessageEnum} from "../../app/model/error-message-enum";
import {CompanyFacade} from "../../company/company.facade";
import {LocalStorageService} from "../../app/services/local-storage.service";
import {RedirectUrls} from "../../app/constants/redirectRoutes.constant";
import {BalanceService} from "../../balance/balance.service";
import {CookieService} from "../../app/services/cookie.service";

@Injectable({
  providedIn: "root",
})
export class SignInFacade {
  private phoneNumber: string = "+7";

  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly _authService: AuthService,
    private readonly _companyState: CompanyState,
    private readonly _signInState: SignInState,
    private readonly _companyFacade: CompanyFacade,
    private readonly _localStorage: LocalStorageService,
    private readonly _router: Router,
    private readonly _balanceService: BalanceService,
    private readonly _cookieService: CookieService,
  ) {
  }

  public signIn(company: CompanyInterface, rememberUser: boolean): void {
    this.isLoader$.next(true);
    this._authService
      .signIn(company, rememberUser)
      .pipe(
        map((companyRaw: CompanyInterface) => {
          if (companyRaw) {
            // TODO: ENV
            // const cookieValue = this._cookieService.getCookie("access_token");
            // console.log(cookieValue, "access_token");
            this._authService.setToken(companyRaw.access_token);
            this._authService.logInEvent();
            // if(!!cookieValue) {
            //   this._authService.setToken(cookieValue);
            // }
          }
        }),
        switchMap(() => this.isBuyTariffId())
      )
      .subscribe(
        () => {},
        (error) => {
          this.phoneNumber += company?.phone;
          this.isLoader$.next(false);
          this._signInState.setError({
            status: error.status,
            message: error.message,
          });
          this._companyState.removeCompanyData();
        }
      );
  }

  private isBuyTariffId(): Observable<any> {
    if (this._localStorage.getItem("tariffUuid")) {
      const uuid = JSON.parse(this._localStorage.getItem("tariffUuid"));
      if (uuid) {
        this.setLoader(true);
      }
    }
    this._router.navigate(["/company"]);
    return of([]);
  }

  public setLoader(value: boolean): void {
    this._signInState.setLoader(value);
  }

  public getIsLoader$(): Observable<boolean> {
    return this._signInState.getIsLoader$();
  }

  public sendPhoneNumber(sendPhone: SendPhoneInterface): Observable<SendPhoneInterface> {
    return this._authService.sendPhoneNumber(sendPhone).pipe(
      catchError((err: ErrorMsg) => {
        if (err?.status && errorMock.includes(err?.status)) {
          this._signInState.setError(err);
        }
        return throwError(err);
      })
    );
  }

  public sendResetPassword(resetPassword: ResetPasswordInterface) {
    return this._authService.sendResetPassword(resetPassword).pipe(
      catchError((err: ErrorMsg) => {
        if (err?.status && errorMock.includes(err?.status)) {
          this._signInState.setError(err);
        }
        return throwError(err);
      })
    );
  }

  public clearErrorMessage$(): void {
    this._signInState.setError(null);
  }

  public getErrorMessage$(): Observable<string> {
    return this._signInState.getErrorMessage$().pipe(
      map((error: ErrorMsg) => {
        if (error?.status === 302 || error?.status === 401) {
          return ErrorMessageEnum.INVALID_PASSWORD;
        }
        if (error?.status === 403) {
          return ErrorMessageEnum.INVALID_LOGIN;
        }
        if (error?.status === 400 || error?.status === 502 || error?.status === 404) {
          return error.message;
        }
        return "";
      })
    );
  }

  public getErrorMessage(): ErrorMsg {
    return this._signInState.getErrorMessage();
  }
}
