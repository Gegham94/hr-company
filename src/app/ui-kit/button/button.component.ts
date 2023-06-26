import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ButtonTypeEnum } from "../../modules/app/constants/button-type.enum";
import { StringOrNumber } from "../../modules/app/interfaces/searchable-select-data.interface";

@Component({
  selector: "hr-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
})
export class ButtonComponent {
  @Input("disabled") disabledProps!: boolean;
  @Input("text") textProps?: StringOrNumber;
  @Input("type") typeProps?: ButtonTypeEnum = ButtonTypeEnum.default;
  @Output() clickEvent: EventEmitter<Event> = new EventEmitter<Event>();
  constructor() {}

}
