import {Injectable} from "@angular/core";
import {AuthService} from "../../service/auth.service";
import {ICompany} from "../../../../shared/interfaces/company.interface";
import {Router} from "@angular/router";
import {CompanyState} from "../../../company/services/company.state";
import {BehaviorSubject, catchError, combineLatest, map, Observable, of, startWith, switchMap, throwError} from "rxjs";
import {ErrorMsgType} from "../../interface/error-message.type";
import {SignInState} from "./signin.state";
import {ISendPhone} from "../../../../shared/interfaces/send-phone.interface";
import {IResetPassword} from "../../../../shared/interfaces/reset-password.interface";
import {errorMock} from "../../errorMock/error-mock";
import {ErrorMessageEnum} from "../../../../shared/enum/error-message.enum";
import {LocalStorageService} from "../../../../shared/services/local-storage.service";
import { FormGroup } from "@angular/forms";

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
    private readonly _localStorage: LocalStorageService,
    private readonly _router: Router,
  ) {
  }

  public signIn(company: ICompany, rememberUser: boolean): void {
    this.isLoader$.next(true);
    this._authService.signIn(company, rememberUser)
      .pipe(
        map((companyRaw: ICompany) => {
          if (companyRaw) {
            this._authService.setToken(companyRaw.access_token);
            this._authService.logInEvent();
          }
        }),
        switchMap(() => this.isBuyTariffId())
      )
      .subscribe({
        next: () => {},
        error: (error) => {
          this.phoneNumber += company?.phone;
          this.isLoader$.next(false);
          this._signInState.setError({
            status: error.status,
            message: error.message,
          });
          this._companyState.removeCompanyData();
        }
      })
  }

  public setLoader(value: boolean): void {
    this._signInState.setLoader(value);
  }

  public getIsLoader$(): Observable<boolean> {
    return this._signInState.getIsLoader$();
  }

  public sendPhoneNumber(sendPhone: ISendPhone): Observable<ISendPhone> {
    return this._authService.sendPhoneNumber(sendPhone).pipe(
      catchError((err: ErrorMsgType) => {
        if (err?.status && errorMock.includes(err?.status)) {
          this._signInState.setError(err);
        }
        return throwError(() => new Error(err?.message));
      })
    );
  }

  public sendResetPassword(resetPassword: IResetPassword) {
    return this._authService.sendResetPassword(resetPassword).pipe(
      catchError((err: ErrorMsgType) => {
        if (err?.status && errorMock.includes(err?.status)) {
          this._signInState.setError(err);
        }
        return throwError(() => new Error(err?.message));
      })
    );
  }

  public clearErrorMessage$(): void {
    this._signInState.setError(null);
  }

  public getErrorMessage$(): Observable<string> {
    return this._signInState.getErrorMessage$().pipe(
      map((error: ErrorMsgType) => {
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

  public getErrorMessage(): ErrorMsgType {
    return this._signInState.getErrorMessage();
  }

  public getSignInForm(): FormGroup {
    return this._signInState.getSignInForm();
  }

  public getSendPhoneForm(): FormGroup {
    return this._signInState.getSendPhoneForm();
  }

  public navigateToCreateVacancyPage(): void {
    if (this._authService.getToken && this._authService.isTokenExpired) {
      this._router.navigateByUrl("/company");
    }
  }

  public clearErrorDuringValueChanges() {
   return combineLatest([
      this.getSignInForm()?.valueChanges.pipe(startWith(null)),
      this.getSendPhoneForm()?.valueChanges.pipe(startWith(null)),
    ])
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
}
