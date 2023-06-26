import {Component, EventEmitter, Input, OnDestroy, Output} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MessageTimeService} from "../message-time/message-time.service";
import {InputTypeEnum} from "../../modules/app/constants/input-type.enum";
import {SignInFacade} from "../../modules/auth/signin/signin.facade";
import {phone_number_prefix} from "../../modules/app/constants";
import {formFieldsMustBeNumber} from "../../modules/app/validators/field-number";
import {Observable, takeUntil} from "rxjs";
import {Unsubscribe} from "../../shared-modules/unsubscriber/unsubscribe";
import {CustomValidatorForPassword} from "../../modules/app/validators/custom-validator-for-password";
import {ErrorMsg} from "../../modules/auth/error-message.type";
import {InputStatusEnum} from "../../modules/app/constants/input-status.enum";

@Component({
  selector: "hr-message-code",
  templateUrl: "./message-code.component.html",
  styleUrls: ["./message-code.component.scss"],
  providers: [MessageTimeService],
})
export class MessageCodeComponent extends Unsubscribe implements OnDestroy {

  @Input() resetPhoneValue!: string;
  public errorMessage$!: Observable<ErrorMsg | string>;
  public prefix = phone_number_prefix;
  public inputForm!: FormGroup;
  public confirmForm!: FormGroup;
  public inputTypeProps: InputTypeEnum = InputTypeEnum.password;
  public isFinishedTime: boolean = true;
  public inputStatusList = InputStatusEnum;

  @Output() sendPhone: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isResetPassword: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private _facade: SignInFacade,
    private messageTimeService: MessageTimeService) {
    super();
  }

  ngOnInit(): void {
    this.initialForm();
    this.errorMessage$ = this._facade.getErrorMessage$();
  }

  private initialForm(): void {
    this.inputForm = this.formBuilder.group({
      inputCodeFirst: [null, [Validators.required, Validators.maxLength(1)]],
      inputCodeSecond: [null, [Validators.required, Validators.maxLength(1)]],
      inputCodeThird: [null, [Validators.required, Validators.maxLength(1)]],
      inputCodeFourth: [null, [Validators.required, Validators.maxLength(1)]],
      inputCodeFifth: [null, [Validators.required, Validators.maxLength(1)]],
      inputCodeSixth: [null, [Validators.required, Validators.maxLength(1)]],
    }, {
      validators: formFieldsMustBeNumber
    });

    this.confirmForm = this.formBuilder.group({
        password: [null, [Validators.required, Validators.minLength(8)]],
        re_password: [null, [Validators.required, Validators.minLength(8)]]
      },
      {
        validators: CustomValidatorForPassword
      });
  }

  public sendCodeAgain(): void {
    this.sendPhone.emit(true);
    this.messageTimeService.setNewCode();
    this.inputForm.reset();
    this._facade.clearErrorMessage$();
  }

  public getFinishedTime(finishedTime: boolean): void {
    this.isFinishedTime = finishedTime;
  }

  public get newPasswordControl(): FormControl {
    return (this.confirmForm.get("password") as FormControl);
  }

  public get rePasswordControl(): FormControl {
    return this.confirmForm.get("re_password") as FormControl;
  }

  public confirmPassword(): void {

    const password = this.newPasswordControl.value;

    if (this.confirmForm.valid
      && this.inputForm.valid
      && !this.confirmForm.getError("passwordsMustBeEqual")
      && !this.inputForm.getError("formValueDoesntNumber")
    ) {
      const code = String(Object.values(this.inputForm.value).join(""));
      const resetPassword = String(password);

      const sendResetPassword = {
        phone: this.resetPhoneValue,
        prefix: this.prefix,
        code: code,
        password: resetPassword
      };

      // const sendResetPassword = {
      //   phone: "93045939",
      //   prefix: "+374",
      //   code: code,
      //   password: resetPassword
      // };

      this._facade.sendResetPassword(sendResetPassword)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (s) => {
            this.isResetPassword.emit();
          }, error => {
            this.inputForm.reset();
          });
    }
  }

  moveFocusOnField(first: HTMLInputElement, second: HTMLInputElement, events: KeyboardEvent): void {
    const keyCode = events.keyCode;
    if (Boolean(first?.value)) {
      if (keyCode != 8 &&
        (keyCode >= 48 && keyCode <= 57)
        || (keyCode >= 96 && keyCode <= 105)) {
        second?.focus();
      }
    }
  }

  // removeFieldValue() {}

  ngOnDestroy(): void {
    this.unsubscribe();
  }

}
