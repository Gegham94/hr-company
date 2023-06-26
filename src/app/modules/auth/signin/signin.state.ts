import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ErrorMsg } from "../error-message.type";

@Injectable({
  providedIn: "root"
})
export class SignInState {
  private signInError$ = new BehaviorSubject<ErrorMsg>(null);
  private loader$ = new BehaviorSubject<boolean>(true);

  public setError(error: ErrorMsg): void {
    this.signInError$.next(error);
  }

  public setLoader(value: boolean): void {
    this.loader$.next(value);
  }

  public getIsLoader$(): Observable<boolean> {
    return this.loader$;
  }

  public getErrorMessage$(): Observable<ErrorMsg> {
    return this.signInError$.asObservable();
  }

  public getErrorMessage(): ErrorMsg {
    return this.signInError$.value;
  }
}
