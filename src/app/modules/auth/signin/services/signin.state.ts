import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ErrorMsgType } from "../../interface/error-message.type";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Injectable({
  providedIn: "root"
})
export class SignInState {
  private signInError$ = new BehaviorSubject<ErrorMsgType>(null);
  private loader$ = new BehaviorSubject<boolean>(true);

  private signInForm: FormGroup = this._formBuilder.group({
    phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    password: [null, [Validators.required, Validators.minLength(8)]]
  });

  private sendPhoneForm: FormGroup = this._formBuilder.group({
    phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
  });

  constructor(
    private readonly _formBuilder: FormBuilder,
   ){}


  public setError(error: ErrorMsgType): void {
    this.signInError$.next(error);
  }

  public setLoader(value: boolean): void {
    this.loader$.next(value);
  }

  public getIsLoader$(): Observable<boolean> {
    return this.loader$;
  }

  public getErrorMessage$(): Observable<ErrorMsgType> {
    return this.signInError$.asObservable();
  }

  public getErrorMessage(): ErrorMsgType {
    return this.signInError$.value;
  }

  public getSignInForm(): FormGroup {
    return this.signInForm;
  }

  public getSendPhoneForm(): FormGroup {
    return this.sendPhoneForm;
  }
}
