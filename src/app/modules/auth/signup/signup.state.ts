import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs";
import { ErrorMsg } from "../error-message.type";

@Injectable({
  providedIn: "root"
})
export class SignUpState {
  private updating$ = new BehaviorSubject<boolean>(false);
  private signUpCompanySubject$: Observable<boolean> = this.updating$.asObservable();
  private signUpError$ = new BehaviorSubject<ErrorMsg>(null);

  public isCompanySuccessSignUp$(): Observable<boolean> {
    return this.signUpCompanySubject$;
  }

  public setUpdating(isUpdating: boolean): void {
    this.updating$.next(isUpdating);
  }

  public setError(error: ErrorMsg): void {
    this.signUpError$.next(error);
  }

  public getErrorMessage$(): Observable<ErrorMsg> {
    return this.signUpError$.asObservable();
  }

  public getErrorMessage(): ErrorMsg {
    return this.signUpError$.value;
  }
}
