import { Component, OnDestroy, OnInit } from "@angular/core";
import { ButtonTypeEnum } from "../../app/constants/button-type.enum";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { InputTypeEnum } from "../../app/constants/input-type.enum";
import { SignUpFacade } from "./signup.facade";
import { BehaviorSubject, Observable, takeUntil } from "rxjs";
import { InputStatusEnum } from "../../app/constants/input-status.enum";
import { phone_number_prefix } from "../../app/constants";
import { ValidationError } from "../../app/services/validation-error.service";
import { Unsubscribe } from "src/app/shared-modules/unsubscriber/unsubscribe";
import { Router } from "@angular/router";
import { ToastsService } from "../../app/services/toasts.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "hr-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
})
export class SignupComponent extends Unsubscribe implements OnInit, OnDestroy {
  public buttonType = ButtonTypeEnum;
  public signUpForm!: FormGroup;
  public inputTypeProps = InputTypeEnum.password;
  public isCompanySuccessSignUp$!: Observable<boolean>;
  public alreadyBeenLoggedError = this._signUpFacade.getErrorMessage$();
  public inputStatusList = InputStatusEnum;
  public prefix = phone_number_prefix;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _signUpFacade: SignUpFacade,
    private readonly _validationErrorService: ValidationError,
    private readonly _router: Router,
    private readonly _toastService: ToastsService,
    private readonly _translateService: TranslateService,
  ) {
    super();
    this.isCompanySuccessSignUp$ = this._signUpFacade.isUserSuccessRegister$();
  }

  public ngOnInit(): void {
    this._initializeFormValues();

    this.signUpForm?.valueChanges.subscribe(() => {
      this._signUpFacade.clearErrorMessage();
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe();
  }

  private _initializeFormValues(): void {
    this.signUpForm = this._formBuilder.group({
      phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      password: [null, [Validators.required, Validators.pattern(this._validationErrorService.patternModel.pattern)]],
      policy: [false, [Validators.required]],
    });
  }

  public signUpCompleted(form: FormGroup): void {
    this._signUpFacade.setUpdating(false);
    if (form.valid && !this._signUpFacade.getErrorMessage() && this.signUpPrivacyPolicyControl.value) {
      const sendFormValue = [form.value].map((value) => {
        if (typeof value?.policy == "boolean") {
          return {
            ...form.value,
            policy: String(value?.policy),
          };
        }
      });
      this._signUpFacade.signUp(sendFormValue[0]).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        const message =
            this._translateService.instant("AUTHORIZATION.SIGN_UP.SUCCESS_MESSAGE.1") +
            "\n" +
            this._translateService.instant("AUTHORIZATION.SIGN_UP.SUCCESS_MESSAGE.3");
          this._toastService.addToast({ title: message }, 6000);
          this._router.navigateByUrl("/signIn");
      });
    }
  }

  get validates(): string {
    if (this._validationErrorService.validator.bind(this.signUpPasswordControl)) {
      const error = this._validationErrorService.validator()(this.signUpPasswordControl);
      return error?.required ?? error?.pattern ?? "";
    }
    return "";
  }

  public get isFormValid(): boolean {
    return this.signUpForm.invalid || !this.signUpPrivacyPolicyControl.value;
  }

  public get signUpPhoneControl(): FormControl {
    return this.signUpForm.get("phone") as FormControl;
  }

  public get signUpPasswordControl(): FormControl {
    return this.signUpForm.get("password") as FormControl;
  }

  public get signUpPrivacyPolicyControl(): FormControl {
    return this.signUpForm.get("policy") as FormControl;
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
