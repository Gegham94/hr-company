import {Component, OnDestroy, OnInit} from "@angular/core";
import {ButtonTypeEnum} from "../../app/constants/button-type.enum";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {InputTypeEnum} from "../../app/constants/input-type.enum";
import {AuthService} from "../auth.service";
import {SignInFacade} from "./signin.facade";
import {InputStatusEnum} from "../../app/constants/input-status.enum";
import {phone_number_prefix} from "../../app/constants";
import {ErrorMsg} from "../error-message.type";
import {BehaviorSubject, combineLatest, startWith} from "rxjs";
import {ErrorMessageEnum} from "../../app/model/error-message-enum";

@Component({
  selector: "hr-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"]
})

export class SignInComponent implements OnInit, OnDestroy {
  public buttonType = ButtonTypeEnum;
  public isPasswordModalOpen: boolean = false;
  public inputTypeProps: InputTypeEnum = InputTypeEnum.password;
  public signInForm!: FormGroup;
  public sendPhoneForm!: FormGroup;
  public prefix = phone_number_prefix;
  public inputStatusList = InputStatusEnum;
  public userDoesNotExistsError = this._signInFacade.getErrorMessage$();
  public getError!: ErrorMsg;
  public resetPsw: boolean = false;
  public isRememberUser: boolean = false;
  public errorMessageEnum = ErrorMessageEnum;
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router,
    private readonly _signInFacade: SignInFacade,
    private readonly _authService: AuthService
  ) {
    this._navigateToCreateVacancyPage();
  }

  public ngOnInit(): void {
    this._signInFacade.isLoader$.next(false);
    this._initializeValue();
    this.clearErrorDuringValueChanges();
  }

  public ngOnDestroy(): void {
    this.isLoader$.next(false);
  }

  private _navigateToCreateVacancyPage(): void {
    if (this._authService.getToken && this._authService.isTokenExpired) {
      this._router.navigateByUrl("/company");
    }
  }

  rememberUser(isRememberUser: boolean): void {
    this.isRememberUser = isRememberUser;
  }

  private clearErrorDuringValueChanges(): void {
    combineLatest([
      this.signInForm?.valueChanges.pipe(startWith(null)),
      this.sendPhoneForm?.valueChanges.pipe(startWith(null)),
    ]).subscribe(() => this._signInFacade.clearErrorMessage$());
  }

  public get sendPhoneControl() {
    return this.sendPhoneForm.get("phone") as FormControl;
  }

  public sendPhone(event?: boolean): void {
    if (this.sendPhoneControl.valid) {

      const phone = {
        phone: this.sendPhoneControl.value,
        prefix: this.prefix
      };

      this._signInFacade.sendPhoneNumber(phone).subscribe(() => {
        if (!event) {
          this.resetPsw = !this.resetPsw;
          this.isPasswordModalOpen = !this.isPasswordModalOpen;
        }
      });
    }
  }

  private _initializeValue(): void {
    this.signInForm = this._formBuilder.group({
      phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      password: [null, [Validators.required, Validators.minLength(8)]]
    });
    this.sendPhoneForm = this._formBuilder.group({
      phone: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    });
  }

  public passwordModal(state: boolean): void {
    this.isPasswordModalOpen = state ? state : !this.isPasswordModalOpen;
    if (!this.isPasswordModalOpen) {
      this.sendPhoneForm.reset();
    }
    this.resetPsw = false;
  }

  public signIn(form: FormGroup): void {
    if (form.valid && !this._signInFacade.getErrorMessage()) {
      this.isLoader$.next(true);
      this._signInFacade.signIn(form.value, this.isRememberUser);
    }
  }

  public get signInPhoneNumberControl(): FormControl {
    return (this.signInForm.get("phone") as FormControl);
  }

  public get signInPasswordControl(): FormControl {
    return (this.signInForm.get("password") as FormControl);
  }

  public get loader$(): BehaviorSubject<boolean> {
    return this._signInFacade.isLoader$;
  }
}
