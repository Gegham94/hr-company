import {Component, EventEmitter, Input, Output, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: "hr-checkbox",
  templateUrl: "./checkbox.component.html",
  styleUrls: ["./checkbox.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CheckboxComponent
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {

  @Input("checked") checkedProps?: boolean = false;
  @Input("label-text") labelText?: string = "";

  @Output() changes: EventEmitter<boolean> = new EventEmitter<boolean>();

  public checkedValue: boolean = false;

  public fileChangeEvent(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.checkedValue = !Boolean(value) ? Boolean(value) : !this.checkedValue;
    this.changes.emit(this.checkedValue);
    this.onChange(this.checkedValue);
    this.onTouch(this.checkedValue);
  }

  public set value(val: boolean) {
    if (val !== undefined) {
      this.checkedValue = val;
    }
  }

  public onChange: (val: boolean) => void = () => {
  }

  public onTouch: (val: boolean) => void = () => {
  }

  public registerOnChange(fn: (val: boolean) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (val: boolean) => void): void {
    this.onTouch = fn;
  }

  public writeValue(value: boolean): void {
    this.checkedValue = value;
  }

}
