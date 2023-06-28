import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {IVacancy} from "../../shared/interfaces/vacancy.interface";
import {ProgressBarEnum} from "../../shared/enum/progress-bar.enum";
import {TranslateService} from "@ngx-translate/core";
import {getDiffDays} from "../../shared/helpers/get-diff-days.helper";

@Component({
  selector: "hr-job-statistics",
  templateUrl: "./job-statistics.component.html",
  styleUrls: ["./job-statistics.component.scss"]
})
export class JobStatisticsComponent implements OnInit {
  @Input() viewChildElement!:ElementRef;

  @Input("vacancy") vacancyProps!: IVacancy;
  @Input("type-props") progressTypeProps = ProgressBarEnum;

  @Output() vacancyValueProps: EventEmitter<IVacancy> = new EventEmitter<IVacancy>();

  constructor(private readonly _translateService: TranslateService) {}

  public get progress(): string {
    const days = getDiffDays(this.vacancyProps.deadlineDate) ;
    if (days < 0) {
      return this._translateService.instant("ACTIONS.CLOSED");
    } else if(days === 0) {
      return this._translateService.instant("MY_VACANCY.DAY", {
        days: 1
      });
    }
    return this._translateService.instant("MY_VACANCY.DAY", {
      days: days
    });
  }

  public get status(): string {
    return this.vacancyProps.status === "completed" ?
      this._translateService.instant("MY_VACANCY.SEARCH.STATUS.COMPLETED") :
      this._translateService.instant("MY_VACANCY.SEARCH.STATUS.NOT_PAYED");
  }

  ngOnInit(): void {}

}
