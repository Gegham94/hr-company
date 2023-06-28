import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import {Router} from "@angular/router";
import { takeUntil} from "rxjs";
import { SpecialistFacade } from "src/app/modules/specialists/services/specialist.facade";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { ProgressBarEnum } from "src/app/shared/enum/progress-bar.enum";
import { VacancyStatusEnum } from "src/app/modules/vacancy/constants/filter-by-status.enum";
import { LocalStorageService } from "src/app/shared/services/local-storage.service";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private specalistStatusMock = [
    {
      awaits: {
        name: this._translatePipe.transform("SPECIALISTS.USER.VIEWED"),
      },
      inProgress: {
        name: this._translatePipe.transform("SPECIALISTS.USER.INTO_ENLIGHTENMENT"),
      },
      accepted: {
        name: this._translatePipe.transform("SPECIALISTS.USER.PASSED_THE_TEST"),
      },
      success: {
        name: this._translatePipe.transform("SPECIALISTS.USER.ACCEPTED"),
      },
      rejected: {
        name: this._translatePipe.transform("SPECIALISTS.USER.REJECTED"),
      },
    },
  ];

  constructor(
    public router: Router,
    public _specialistsFacade: SpecialistFacade,
    public _localStorage: LocalStorageService,
    public _cdr: ChangeDetectorRef,
    private readonly _translatePipe: TranslatePipe
  ) {
    super();
  }

  public ngOnDestroy() {
    this._specialistsFacade.destroySetSpecialistsNotificationCount();
    this.unsubscribe();
  }

  public get specalistStatus(): string {
    if (this.interviewStatus) {
      const statusObject = this.specalistStatusMock.find((item) => item.hasOwnProperty(this.interviewStatus!));
      if (statusObject) {
        return statusObject[this.interviewStatus as keyof typeof statusObject].name;
      }
    }
    return "";
  }

  public updateFavorites(event: Event): void {
    event.stopPropagation();
    const state = !this.isFavorite;
    this._specialistsFacade
      .updateFavorites(this.foundSpecialistUuid, state)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: { data: string }) => {
        if (data.data) {
          this.isFavorite = state;
          this._cdr.detectChanges();
        }
      });
  }

  public specProfile() {
    this.decrementNotifications();
    this._localStorage.setItem("isFavorite", JSON.stringify(this.isFavorite));
    this._localStorage.setItem("vacancyId", JSON.stringify(this.vacancyId));
    this.router.navigate([`/specialists/profile/`], {
      queryParams: {
        uuid: this.userUuid,
        foundSpecialistUuid: this.foundSpecialistUuid,
      },
    });
  }

  public decrementNotifications(): void {
    this._specialistsFacade.setSpecialistsNotificationCount(this.foundSpecialistUuid);
  }
}
