import { Injectable } from "@angular/core";
import { AuthService } from "../../service/auth.service";
import { SignUpState } from "./signup.state";
import { BehaviorSubject, catchError, filter, finalize, Observable, of, tap, throwError } from "rxjs";
import { ICompany } from "../../../../shared/interfaces/company.interface";
import { HttpErrorResponse } from "@angular/common/http";
import { ErrorMsgType } from "../../interface/error-message.type";
import { SignUpErrorType, SignUpRequestKeysType } from "../../../../shared/interfaces/signup.interface";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { ToastsService } from "src/app/shared/services/toasts.service";

@Injectable({
  providedIn: "root",
})
export class SignUpFacade {
  constructor(
    private readonly _authService: AuthService,
    private readonly _registerState: SignUpState,
    private readonly _translateService: TranslateService,
    private readonly _router: Router,
    private readonly _toastService: ToastsService,
  ) {}

  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public signUp(companyRaw: ICompany): Observable<ICompany> {
    this.isLoader$.next(true);
    return this._authService.singUp(companyRaw).pipe(
      finalize(() => this.isLoader$.next(false)),
      catchError((error: HttpErrorResponse) => {
        const errorMessages: string[] = [];
        const errorObj = error.error as SignUpErrorType;
        if (errorObj.messages) {
          for (const key in errorObj.messages) {
            if (key in errorObj.messages) {
              errorMessages.push(errorObj.messages[key as SignUpRequestKeysType]);
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
        return throwError(() => new Error("Sing up attempt failed"));
      })
    );
  }

  public clearErrorMessage(): void {
    this._registerState.setError(null);
  }

  public getErrorMessage$(): Observable<ErrorMsgType> {
    return this._registerState.getErrorMessage$().pipe(filter((error: ErrorMsgType) => (error && error.status === 502) || !error?.error));
  }

  public getErrorMessage(): ErrorMsgType {
    return this._registerState.getErrorMessage();
  }

  public getSignUpForm(): FormGroup {
   return this._registerState.getSignUpForm();
  }

  public getSignUpCompleted(): Observable<ICompany> {
    const policy = this.getSignUpForm().get("policy");
    if (this.getSignUpForm().valid && !this.getErrorMessage() && policy?.value) {
      if (typeof policy.value === "boolean") {
       this.getSignUpForm().patchValue({policy: String(policy.value)})
      }
      return this.signUp(this.getSignUpForm().value).pipe(tap(() => {
        const message =
            this._translateService.instant("AUTHORIZATION.SIGN_UP.SUCCESS_MESSAGE.1") +
            "\n" +
            this._translateService.instant("AUTHORIZATION.SIGN_UP.SUCCESS_MESSAGE.3");
          this._toastService.addToast({ title: message }, 6000);
          this._router.navigateByUrl("/signIn");
      })
      )
    }
    return of()
  }
}
