import {Component, OnDestroy, OnInit} from "@angular/core";
import {ButtonTypeEnum} from "../../../shared/enum/button-type.enum";
import {FormControl } from "@angular/forms";
import {InputTypeEnum} from "../../../shared/enum/input-type.enum";
import {SignInFacade} from "./services/signin.facade";
import {InputStatusEnum} from "../../../shared/enum/input-status.enum";
import {phone_number_prefix} from "../../app/constants";
import {ErrorMsgType} from "../interface/error-message.type";
import {BehaviorSubject, takeUntil} from "rxjs";
import {ErrorMessageEnum} from "../../../shared/enum/error-message.enum";
import {Unsubscribe} from "src/app/shared/unsubscriber/unsubscribe";

@Component({
  selector: "hr-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"]
})

export class SignInComponent extends Unsubscribe implements OnInit, OnDestroy {
  public buttonType = ButtonTypeEnum;
  public isPasswordModalOpen: boolean = false;
  public inputTypeProps: InputTypeEnum = InputTypeEnum.password;
  public prefix = phone_number_prefix;
  public inputStatusList = InputStatusEnum;
  public userDoesNotExistsError = this._signInFacade.getErrorMessage$();
  public getError!: ErrorMsgType;
  public resetPsw: boolean = false;
  public isRememberUser: boolean = false;
  public errorMessageEnum = ErrorMessageEnum;
  public isLoader$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly _signInFacade: SignInFacade,
  ) {
    super();
  }

  public ngOnInit(): void {
    this._signInFacade.navigateToCreateVacancyPage();
    this._signInFacade.isLoader$.next(false);
    this._initializeValue();
    this.clearErrorDuringValueChanges();
  }

  public ngOnDestroy(): void {
    this.isLoader$.next(false);
    this.unsubscribe();
  }


  public rememberUser(isRememberUser: boolean): void {
    this.isRememberUser = isRememberUser;
  }

  public sendPhone(event?: boolean): void {
    if (this.sendPhoneControl.valid) {
      const phone = {
        phone: this.sendPhoneControl.value,
        prefix: this.prefix
      };

      this._signInFacade.sendPhoneNumber(phone).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (!event) {
          this.resetPsw = !this.resetPsw;
          this.isPasswordModalOpen = !this.isPasswordModalOpen;
        }
      });
    }
  }

  public passwordModal(state: boolean): void {
    if (state ? state : !this.isPasswordModalOpen) {
      this._signInFacade.getSendPhoneForm().reset();
    }
    this.resetPsw = false;
  }

  public signIn(): void {
    if (this._signInFacade.getSignInForm().valid && !this._signInFacade.getErrorMessage()) {
      this.isLoader$.next(true);
      this._signInFacade.signIn(this._signInFacade.getSignInForm().value, this.isRememberUser);
    }
  }

  public get signInPhoneNumberControl(): FormControl {
    return (this._signInFacade.getSignInForm().get("phone") as FormControl);
  }

  public get signInPasswordControl(): FormControl {
    return (this._signInFacade.getSignInForm().get("password") as FormControl);
  }

  public get sendPhoneControl() {
    return this._signInFacade.getSendPhoneForm().get("phone") as FormControl;
  }

  public get loader$(): BehaviorSubject<boolean> {
    return this._signInFacade.isLoader$;
  }

  private clearErrorDuringValueChanges(): void {
    this._signInFacade.clearErrorDuringValueChanges()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(() => this._signInFacade.clearErrorMessage$());
  }

  private _initializeValue(): void {
    this._signInFacade.getSignInForm();
    this._signInFacade.getSendPhoneForm();
  }
}
