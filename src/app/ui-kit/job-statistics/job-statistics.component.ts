import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {VacancyInterface} from "../../modules/app/interfaces/vacancy.interface";
import {ProgressBarEnum} from "../../modules/app/constants/progress-bar.enum";
import {TranslateService} from "@ngx-translate/core";
import {getDiffDays} from "../../helpers/get-diff-days.helper";

@Component({
  selector: "hr-job-statistics",
  templateUrl: "./job-statistics.component.html",
  styleUrls: ["./job-statistics.component.scss"]
})
export class JobStatisticsComponent implements OnInit {
  @Input() viewChildElement!:ElementRef;

  @Input("vacancy") vacancyProps!: VacancyInterface;
  @Input("type-props") progressTypeProps = ProgressBarEnum;

  @Output() vacancyValueProps: EventEmitter<VacancyInterface> = new EventEmitter<VacancyInterface>();

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
