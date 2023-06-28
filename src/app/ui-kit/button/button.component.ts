import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonTypeEnum } from "../../shared/enum/button-type.enum";
import { StringOrNumberType } from "../../shared/interfaces/searchable-select-data.interface";

@Component({
  selector: "hr-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
})
export class ButtonComponent {
  @Input("disabled") disabledProps!: boolean;
  @Input("text") textProps?: StringOrNumberType;
  @Input("type") typeProps?: ButtonTypeEnum = ButtonTypeEnum.default;
  @Output() clickEvent: EventEmitter<Event> = new EventEmitter<Event>();
  constructor() {}

}
