import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy} from "@angular/core";
import {ProgressBarEnum} from "../../../modules/app/constants/progress-bar.enum";
import {Router} from "@angular/router";
import {SpecialistFacade} from "../../../modules/specialists/specialist.facade";
import {LocalStorageService} from "../../../modules/app/services/local-storage.service";
import {VacancyStatusEnum} from "../../../modules/vacancy/constants/filter-by-status.enum";
import {BehaviorSubject, takeUntil} from "rxjs";
import {Unsubscribe} from "../../unsubscriber/unsubscribe";

const  specalistStatusMock = [
  {
    awaits: {
      name: "Просмотренные"
    },
    inProgress: {
      name: "В проссещение"
    },
    accepted: {
      name: "Прошли тест"
    },
    success: {
      name: "Принятие"
    },
    rejected: {
      name: "Откланенные"
    }
  }
];

@Component({
  selector: "hr-user-card",
  templateUrl: "./user-card.component.html",
  styleUrls: ["./user-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent extends Unsubscribe implements OnDestroy {
  @Input("vacancy-id") vacancyId!: string;
  @Input("vacancy-status") vacancyStatus!: string;
  @Input("user-name") userNameProps!: string;
  @Input("user-surname") userSurnameProps!: string;
  @Input("user-profession") userProfessionProps!: string;
  @Input("user-post") userPostProps!: string;
  @Input("type-props") typeProps = ProgressBarEnum;
  @Input("progress-psychology") progressPsychologyProps: number = 10;
  @Input("progress-professional") progressProfessionalProps: number = 20;
  @Input("progress-interview") progressInterviewProps: number = 30;
  @Input("user-uuid") userUuid?: string;
  @Input("disabled") disabled: boolean = false;
  @Input("isNew") isNew?: boolean;
  @Input("interviewStatus") interviewStatus?: string;
  @Input("isFavorite") isFavorite!: boolean;
  @Input("found-specialist-uuid") foundSpecialistUuid!: string;

  public VacancyStatusEnum = VacancyStatusEnum;

  public updatedIsFavoriteValue: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(this.isFavorite);

  constructor(public router: Router,
    public _specialistsFacade: SpecialistFacade,
    public _localStorage: LocalStorageService,
    public _cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnDestroy() {
    this.unsubscribe();
  }

  public get specalistStatus(): string {
    if (this.interviewStatus) {
      const statusObject = specalistStatusMock.find(item => item.hasOwnProperty(this.interviewStatus!));
      if (statusObject) {
        return statusObject[this.interviewStatus as keyof typeof statusObject].name;
      }
    }
    return '';
  }

  public updateFavorites(event: Event): void {
    event.stopPropagation();
    const state = !this.isFavorite;
    this._specialistsFacade.updateFavorites(this.foundSpecialistUuid, state)
      .pipe(
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((data: { data: string }) => {
        if (data.data) {
          this.isFavorite = state;
          this._cdr.detectChanges();
        }
      });
  }

  public specProfile() {
    this.decrementNotifications();
    this._localStorage.setItem('isFavorite', JSON.stringify(this.isFavorite));
    this._localStorage.setItem("vacancyId", JSON.stringify(this.vacancyId));
    this.router.navigate([`/specialists/profile/`], {
      queryParams: {
        uuid: this.userUuid,
        foundSpecialistUuid: this.foundSpecialistUuid
      }
    });
  }

  public decrementNotifications(): void {
    this._specialistsFacade.setSpecialistsNotificationCount(this.foundSpecialistUuid);
  }
}
