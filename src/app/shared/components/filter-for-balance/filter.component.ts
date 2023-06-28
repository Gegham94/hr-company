import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import {ISearchableSelectData} from "../../interfaces/searchable-select-data.interface";
import {DatePickerEnum} from "../../enum/date-picker.enum";
import {SelectAllData} from "../../../modules/app/constants";

@Component({
  selector: "hr-filter-balance",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"],
})
export class FilterForBalanceComponent {
  @ViewChild("firstDatepicker", {read: ElementRef})
  firstDatepicker!: ElementRef;
  @ViewChild("secondDatepicker", {read: ElementRef})
  secondDatepicker!: ElementRef;
  @Input("payed-status-list") payedStatusList!: ISearchableSelectData[];
  @Input("status-list") statusList!: ISearchableSelectData[];
  @Input("filterFromPaidVacancyBalance") filterFromPaidVacancyBalance: boolean = false;
  @Input("filterFromUnpaidVacancyBalance") filterFromUnpaidVacancyBalance: boolean = false;
  @Output() statusChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() payedStatusChanged: EventEmitter<string> =
    new EventEmitter<string>();
  @Output() from: EventEmitter<string> = new EventEmitter<string>();
  @Output() to: EventEmitter<string> = new EventEmitter<string>();
  @Output() nameChanged: EventEmitter<string> = new EventEmitter<string>();

  public isOpen: boolean = false;
  public isDateFromOpen: boolean = false;
  public datePickerEnum = DatePickerEnum;
  public dateStarted = "";
  public dateCompleted = "";

  public isFirstDatepickerValid: boolean | undefined;
  public isSecondDatepickerValid: boolean | undefined;
  public readonly defaultValue = SelectAllData;

  public toggleFilter() {
    this.isOpen = !this.isOpen;
  }

  public firstDatepickerDate(): void {
    this.dateStarted = this.firstDatepicker.nativeElement.value;
    if (this.firstDatepicker.nativeElement.value) {
      this.isFirstDatepickerValid = undefined;
      if (new Date(this.firstDatepicker.nativeElement.value).toDateString() !== "Invalid Date") {
        this.from.emit(this.firstDatepicker.nativeElement.value);
        this.isFirstDatepickerValid = undefined;
      } else {
        this.isFirstDatepickerValid = false;
      }
    } else {
      this.from.emit(this.firstDatepicker.nativeElement.value);
      this.isFirstDatepickerValid = undefined;
    }
  }

  public secondDatepickerDate(): void {
    this.dateCompleted = this.secondDatepicker.nativeElement.value;
    if (this.secondDatepicker.nativeElement.value) {
      this.isSecondDatepickerValid = undefined;
      if (
        new Date(this.secondDatepicker.nativeElement.value).toDateString() !==
        "Invalid Date"
      ) {
        this.to.emit(this.secondDatepicker.nativeElement.value);
        this.isSecondDatepickerValid = undefined;
      } else {
        this.isSecondDatepickerValid = false;
      }
    } else {
      this.to.emit(this.secondDatepicker.nativeElement.value);
      this.isSecondDatepickerValid = undefined;
    }
  }

  public removeInputValue(event: Event, dateStep: string): void {
    event.preventDefault();
    if (dateStep === this.datePickerEnum.DATE_STARTED) {
      this.dateStarted = "";
      this.from.emit("");
    }
    if (dateStep === this.datePickerEnum.DATE_COMPLETED) {
      this.dateCompleted = "";
      this.to.emit("");
    }
  }

  public handleStatusChange(status: ISearchableSelectData) {
    this.statusChanged.emit(status.displayName);
  }

  public handlePayedStatusChange(status: ISearchableSelectData) {
    this.payedStatusChanged.emit(status.displayName);
  }


}
