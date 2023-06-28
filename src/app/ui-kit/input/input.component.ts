import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from "@angular/core";
import {InputStatusEnum} from "../../shared/enum/input-status.enum";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {InputTypeEnum} from "../enum/input-type.enum";

@Component({
  selector: "hr-input",
  templateUrl: "./input.component.html",
  styleUrls: ["./input.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputComponent
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Output() textInput: EventEmitter<string> = new EventEmitter<string>();
  @Output() blur: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input("label-text") labelTextProps!: string;
  @Input("img-path") imgPath!: string;
  @Input("placeholder-text") placeholderTextProps!: string;
  @Input("feedback-text") feedbackTextProps: string = "";
  @Input("status") statusProps: InputStatusEnum = InputStatusEnum.default;
  @Input("error-status") errorStatus: InputStatusEnum = InputStatusEnum.default;
  @Input("value") valueProps!: string;
  @Input("input-type") inputTypeProps?: string;
  @Input("phone-input") phoneInputProps = false;
  @Input("currency-input") currencyInputProps = false;
  @Input("card-input") cardInputProps: boolean = false;
  @Input("date-input") dateInputProps: boolean = false;
  @Input("disabled") disabled: boolean = false;
  @Input("mask-pattern") maskPatternProps: string = "";
  @Input("prefix") prefix: string = "";
  @Input("isRequared") isRequared: boolean = true;
  @Input("minRange") minRange?: number;

  @Input() valid?: boolean;
  @Input() showPassword?: boolean = false;
  public inputValue: string = "";
  public inputTypeEnum = InputTypeEnum;

  constructor(private cdRef: ChangeDetectorRef) {}

  public onInput(): void {
    if (this.inputValue) {
      this.inputValue = this.inputValue.toString().trim();
      this.textInput.emit(this.inputValue);
      this.onChange(this.inputValue);
      this.onTouch(this.inputValue);
    } else {
      this.inputValue = "";
      this.textInput.emit(this.inputValue);
      this.onChange(this.inputValue);
    }
  }

  public validateInput(event: KeyboardEvent): void {
    // Check if "e" key is pressed
    if (this.inputTypeProps == "number" && (event.key === "e" || event.key === "E")) {
      event.preventDefault();
    }

    // Check if user type numbers and the first number is "0"
    if(this.minRange === 1){
      const key = event.key;
      if (key >= '0' && key <= '9' && this.inputValue.startsWith('0')) {
        this.inputValue = '';
      }
    }
  }

  public onBlur() {
    this.blur.emit(true);
  }

  public set value(val: string) {
    if (!!val) {
      this.inputValue = val;
    }
  }

  showPasswordValue(event: boolean): void {
    if (event && this.inputTypeProps == this.inputTypeEnum.password) {
      this.inputTypeProps = this.inputTypeEnum.text;
    } else {
      this.inputTypeProps = this.inputTypeEnum.password;
    }
  }

  public get maskChoose(): string {
    if (this.cardInputProps) {
      return "0{4} 0{4} 0{4} 0{4}";
    } else if (this.phoneInputProps) {
      return "(0{3}) 0{3} - 0{2} - 0{2}";
    } else if (this.currencyInputProps) {
      return "separator";
    } else {
      return this.maskPatternProps;
    }
  }

  public onChange: (val: string) => void = (val) => {
  }

  public onTouch: (val: string) => void = () => {
  }

  public registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (val: string) => void): void {
    this.onTouch = fn;
  }

  changePrefix(val: string) {
    if (this.phoneInputProps) {
      this.prefix = "+7";
      this.cdRef.detectChanges();
    } else if (this.currencyInputProps && val) {
      this.prefix = "от  ";
    }
  }

  public writeValue(value: string): void {
    this.inputValue = value;
  }

  public removeInputValue(event: Event): void {
    // event.preventDefault();
    this.inputValue = "";

    this.onTouch("");
    this.onChange(this.inputValue);
    this.textInput.next(this.inputValue);
  }
}
