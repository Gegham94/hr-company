import {
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import {SearchableSelectDataInterface} from "../../../modules/app/interfaces/searchable-select-data.interface";
import {SelectAllData} from "../../../modules/app/constants";

@Component({
  selector: "hr-filter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"],
})
export class FilterComponent {
  @Input("payed-status-list") payedStatusList!: SearchableSelectDataInterface[];
  @Input("status-list") statusList!: SearchableSelectDataInterface[];

  @Output() statusChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() payedStatusChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() nameChanged: EventEmitter<string> = new EventEmitter<string>();

  public readonly defaultValue = SelectAllData;

  public handleStatusChange(status: SearchableSelectDataInterface) {
    this.statusChanged.emit(status.displayName);
  }

  public handlePayedStatusChange(status: SearchableSelectDataInterface) {
    this.payedStatusChanged.emit(status.displayName);
  }
}
