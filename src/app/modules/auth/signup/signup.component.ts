import { Component, OnDestroy, OnInit } from "@angular/core";
import { ButtonTypeEnum } from "../../../shared/enum/button-type.enum";
import { FormControl } from "@angular/forms";
import { InputTypeEnum } from "../../../shared/enum/input-type.enum";
import { SignUpFacade } from "./services/signup.facade";
import { BehaviorSubject, takeUntil } from "rxjs";
import { InputStatusEnum } from "../../../shared/enum/input-status.enum";
import { phone_number_prefix } from "../../app/constants";
import { ValidationError } from "../../../shared/services/validation-error.service";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";

@Component({
  selector: "hr-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent extends Unsubscribe implements OnInit, OnDestroy {
  public buttonType = ButtonTypeEnum;
  public inputTypeProps = InputTypeEnum.password;
  public alreadyBeenLoggedError = this._signUpFacade.getErrorMessage$();
  public inputStatusList = InputStatusEnum;
  public prefix = phone_number_prefix;

  constructor(
    private readonly _signUpFacade: SignUpFacade,
    private readonly _validationErrorService: ValidationError,
  ) {
    super();
  }

  public ngOnInit(): void {
    this._signUpFacade.getSignUpForm().valueChanges.pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(() => {
      this._signUpFacade.clearErrorMessage();
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  public signUpCompleted(): void {
    this._signUpFacade.getSignUpCompleted().pipe(takeUntil(this.ngUnsubscribe)).subscribe();
  }

  get validates(): string {
    if (this._validationErrorService.validator.bind(this.signUpPasswordControl)) {
      const error = this._validationErrorService.validator()(this.signUpPasswordControl);
      return error?.required ?? error?.pattern ?? "";
    }
    return "";
  }

  public get isFormValid(): boolean {
    return this._signUpFacade.getSignUpForm().invalid || !this.signUpPrivacyPolicyControl.value;
  }

  public get signUpPhoneControl(): FormControl {
    return this._signUpFacade.getSignUpForm().get("phone") as FormControl;
  }

  public get signUpPasswordControl(): FormControl {
    return this._signUpFacade.getSignUpForm().get("password") as FormControl;
  }

  public get signUpPrivacyPolicyControl(): FormControl {
    return this._signUpFacade.getSignUpForm().get("policy") as FormControl;
  }

  public get loader$(): BehaviorSubject<boolean> {
    return this._signUpFacade.isLoader$;
  }

  public changeSignUpPrivacyPolicy(event?: Event): void {
    if (event) {
      return;
    }
    this.signUpPrivacyPolicyControl.setValue(!this.signUpPrivacyPolicyControl.value);
  }
}
