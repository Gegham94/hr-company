import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs";
import { ErrorMsgType } from "../../interface/error-message.type";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationError } from "src/app/shared/services/validation-error.service";

@Injectable({
  providedIn: "root"
})
export class SignUpState {
  private signUpError$ = new BehaviorSubject<ErrorMsgType>(null);

  private signUpForm = this._formBuilder.group({
    phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    password: [null, [Validators.required, Validators.pattern(this._validationErrorService.patternModel.pattern)]],
    policy: [false, [Validators.required]],
  });

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _validationErrorService: ValidationError,
  ) {}

  public setError(error: ErrorMsgType): void {
    this.signUpError$.next(error);
  }

  public getErrorMessage$(): Observable<ErrorMsgType> {
    return this.signUpError$.asObservable();
  }

  public getErrorMessage(): ErrorMsgType {
    return this.signUpError$.value;
  }

  public getSignUpForm(): FormGroup {
   return this.signUpForm;
  }

}
