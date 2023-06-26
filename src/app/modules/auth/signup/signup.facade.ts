import { Injectable } from "@angular/core";
import { AuthService } from "../auth.service";
import { SignUpState } from "./signup.state";
import { BehaviorSubject, catchError, filter, finalize, map, Observable, throwError } from "rxjs";
import { CompanyInterface } from "../../app/interfaces/company.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorMsg } from "../error-message.type";
import { SignInFacade } from "../signin/signin.facade";
import { SignUpError, SignUpRequestKeys } from "../../app/interfaces/signup.interface";

@Injectable({
  providedIn: "root",
})
export class SignUpFacade {
  constructor(
    private readonly _authService: AuthService,
    private readonly _signInFacade: SignInFacade,
    private readonly _registerState: SignUpState
  ) {}

  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject(false);


  public signUp(companyRaw: CompanyInterface): Observable<void> {
    this.isLoader$.next(true);
    return this._authService.singUp(companyRaw).pipe(
      finalize(() => this.isLoader$.next(false)),
      map((company: CompanyInterface) => {
        if (company) {
          this.setUpdating(true);
          // this._signInFacade.signIn(companyRaw, false);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const errorMessages: string[] = [];
        const errorObj = error.error as SignUpError;
        if (errorObj.messages) {
          for (const key in errorObj.messages) {
            if (key in errorObj.messages) {
              errorMessages.push(errorObj.messages[key as SignUpRequestKeys]);
            }
          }
        }
        if (errorObj.message) {
          errorMessages.push(errorObj.message);
        }
        this._registerState.setError({
          status: error.status,
          message: errorMessages.join(", "),
        });
        this.setUpdating(false);
        return throwError(() => new Error("Sing up attempt failed"));
      })
    );
  }

  public clearErrorMessage(): void {
    this._registerState.setError(null);
  }

  public getErrorMessage$(): Observable<ErrorMsg> {
    return this._registerState.getErrorMessage$().pipe(filter((error: ErrorMsg) => (error && error.status === 502) || !error?.error));
  }

  public getErrorMessage(): ErrorMsg {
    return this._registerState.getErrorMessage();
  }

  public isUserSuccessRegister$(): Observable<boolean> {
    return this._registerState.isCompanySuccessSignUp$();
  }

  public setUpdating(val: boolean): void {
    this._registerState.setUpdating(val);
  }
}
