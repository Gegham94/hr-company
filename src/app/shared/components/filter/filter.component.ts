import {
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import {ISearchableSelectData} from "../../interfaces/searchable-select-data.interface";
import {SelectAllData} from "../../../modules/app/constants";

@Component({
  selector: "hr-filter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"],
})
export class FilterComponent {
  @Input("payed-status-list") payedStatusList!: ISearchableSelectData[];
  @Input("status-list") statusList!: ISearchableSelectData[];

  @Output() statusChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() payedStatusChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() nameChanged: EventEmitter<string> = new EventEmitter<string>();

  public readonly defaultValue = SelectAllData;

  public handleStatusChange(status: ISearchableSelectData) {
    this.statusChanged.emit(status.displayName);
  }

  public handlePayedStatusChange(status: ISearchableSelectData) {
    this.payedStatusChanged.emit(status.displayName);
  }
}
