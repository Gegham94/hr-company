import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "hr-radio",
  templateUrl: "./radio.component.html",
  styleUrls: ["./radio.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: RadioComponent
    }
  ]
})
export class RadioComponent implements ControlValueAccessor {
  @Input("group-name") groupNameProps!: string;
  @Input("checked") checkedProps?: boolean;
  @Input("value") valueProps!: string;

  public onItemChange(value: string) {
    this.onChange(this.valueProps);
    this.onTouch(this.valueProps);
  }

  set radioValue(val: string) {
    if (val !== undefined && "") {
      this.valueProps = val;
    }
  }

  onChange: (val: string) => void = () => {
  }

  onTouch: (val: string) => void = () => {
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: (val: string) => void): void {
    this.onTouch = fn;
  }

  writeValue(val: string): void {
    val = this.valueProps;
  }
}
