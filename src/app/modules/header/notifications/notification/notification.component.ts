import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import {BehaviorSubject, distinctUntilChanged, filter, takeUntil} from "rxjs";
import {HeaderFacade} from "../../header.facade";
import {HeaderDropdownsEnum} from "../../constants/header-dropdowns.enum";
import {
  GlobalNotificationItem,
  NotificationItemInfo,
} from "../../interfaces/notifications.interface";
import {NotificationsService} from "../notifications.service";
import {MyVacancyFilterInterface} from "../../../vacancy/interfaces/my-vacancy-filter.interface";
import {AuthService} from "../../../auth/auth.service";
import {CompanyService} from "../../../company/company.service";
import {convertLocalDateTime} from "../../../../helpers/date.helper";
import {Unsubscribe} from "../../../../shared-modules/unsubscriber/unsubscribe";
import {ScreenSizeType} from "src/app/modules/app/interfaces/screen-size.type";
import {ScreenSizeService} from "src/app/modules/app/services/screen-size.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {NotificationsFacade} from "../notifications.facade";

@Component({
  selector: "hr-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent extends Unsubscribe implements OnInit {
  @Input("isMenuOpen") mobile: boolean = false;
  @ViewChild("datepicker", {read: ElementRef}) datepicker!: ElementRef;

  public count!: number;
  public currentPage: number = 0;
  public hasNotification: number = 0;
  public notificationData: BehaviorSubject<GlobalNotificationItem[]> = new BehaviorSubject<GlobalNotificationItem[]>([]);
  public currentStepNote: GlobalNotificationItem[] = [];
  public lastDay?: NgbDate;
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(
    HeaderDropdownsEnum.notifications
  );
  public loadingMoreNotifications$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isDeadlineDateModal: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isCongratulationModal: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isJobRequestModal: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public vacancyUuid: string = "";
  public notificationUuid: string = "";
  public pagination: MyVacancyFilterInterface = {take: 0, skip: 0};
  private limit: number = 100;
  private passedDay: number = 0;
  public newDateForVacancy = "";
  private requestCount: number = 0;
  private changeDeadlineDate!: NotificationItemInfo;
  public showVacancyStateStatus: BehaviorSubject<string> = new BehaviorSubject<string>("");

  public dateForm: FormGroup = this.formBuilder.group({
    first: [""],
    second: [""],
  });

  get screenSize(): ScreenSizeType {
    return this.screenSizeService.calcScreenSize;
  }

  get virtualContainerHeight(): number {
    return this.screenSize === "DESKTOP" ? 350 : window.innerHeight - 55;
  }

  get virtualScrollItemSize(): number {
    return this.screenSize === "EXTRA_SMALL" ? 45 : 60;
  }

  constructor(
    public readonly calendar: NgbCalendar,
    private readonly formBuilder: FormBuilder,
    private readonly _notificationFacade: NotificationsFacade,
    private readonly _headerFacade: HeaderFacade,
    private readonly service: NotificationsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly _authService: AuthService,
    private readonly _companyService: CompanyService,
    private readonly screenSizeService: ScreenSizeService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.getSelectedPaginationValue(1);
  }

  public getNextBatch(index: number): void {
    if (this.currentStepNote.length > 25 && index > this.notificationData.value.length - 25) {
      if (this.requestCount === 0) {
        this.loadingMoreNotifications$.next(true);
        this.currentPage++;
        this.requestCount++;
        this.getSelectedPaginationValue(this.currentPage);
      }
    }
  }

  public postponeModal(): void {
    this.newDateForVacancy = "";
    const updatedVacancyDate: NotificationItemInfo = {
      notificationUuid: this.notificationUuid,
      notificationStatus: false,
      deadlineDate: this.changeDeadlineDate.deadlineDate,
      uuid: this.changeDeadlineDate.uuid,
    };
    this._companyService.changeCompanyVacancyDeadlineDate(updatedVacancyDate)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.dateForm.reset();
        this.isDeadlineDateModal.next(!this.isDeadlineDateModal.value);
        this.getSelectedPaginationValue(1);
      });
  }

  public getSelectedPaginationValue(pageNumber: number): void {
    const limit = 100;
    const end = pageNumber * limit;
    const start = end - limit;
    this.pagination.skip = start;
    this.pagination.take = this.limit;
    if (this._authService.getToken) {
      this.service
        .getGlobalNotification$(this.pagination)
        .pipe(distinctUntilChanged())
        .subscribe((note) => {
          this.requestCount = 0;
          this.currentStepNote = note.result;
          this.notificationData.next([...this.notificationData.value, ...note.result]);
          this.count = note?.unviewedCount ?? null;
          this.hasNotification = note.count;
          this.loadingMoreNotifications$.next(false);
          this.cdr.detectChanges();
        });
    }
  }

  // unused
  public isDisabled(date: NgbDateStruct) {
    const d = new Date(date.year, date.month - 1, date.day);
    return date.day !== this["passedDay"]
      ? this["passedDay"]
      : 6 || d.getDay() === 0 || d.getDay() === 6;
  }

  // open / close notification menu
  public openNotificationsListAction(event: Event): void {
    const state = this._headerFacade.getStateDropdown(HeaderDropdownsEnum.notifications);
    this._headerFacade.resetDropdownsState(
      HeaderDropdownsEnum.notifications,
      state
    );
    this.notificationData.next([]);
    this.loadingMoreNotifications$.next(true);
    if (!state) {
      this.getSelectedPaginationValue(1);
    }
  }

  public closeModal(): void {
    this.isDeadlineDateModal.next(!this.isDeadlineDateModal.value);
  }

  public closeCongratulationModal(): void {
    this.isCongratulationModal.next(!this.isCongratulationModal.value);
  }

  public closeJobRequestModal(): void {
    this.isJobRequestModal.next(!this.isJobRequestModal.value);
  }

  // handle notification select
  public selectNotification(uuid: string): void {
    this._headerFacade.setStateDropdown$(
      HeaderDropdownsEnum.notifications,
      false
    );

    this.service
      .updateViewedNotification$(uuid)
      .pipe(
        filter((viewNot) => viewNot["affected"] >= 1),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.notificationData.value.forEach((not) => {
          this.cdr.detectChanges();

          if (not.uuid === uuid) {
            if (!not.viewed && this.count > 0) {
              not.viewed = true;
              this.count--;
            }
            if (not.info.hasOwnProperty("vacancyInfo")) {
              if (not.info.hasOwnProperty("status")) {
                if (not.info?.status) {
                  this.showVacancyStateStatus.next(`Вы уже продлили вакансию ${not.info?.vacancyInfo?.name}.`);
                } else {
                  this.showVacancyStateStatus.next(`Вакансия ${not.info?.vacancyInfo?.name} архивирована.`);
                }
              } else {
                this.showVacancyStateStatus.next("");
              }
              this.isDeadlineDateModal.next(true);
              this.vacancyUuid = not.info.vacancyInfo.uuid;
              this.notificationUuid = not.uuid;
              const dateSplit = typeof not.info.vacancyInfo.deadlineDate === "string" ?
                not.info.vacancyInfo.deadlineDate.split("-") : "";
              this.changeDeadlineDate = not.info.vacancyInfo;
              this.lastDay = new NgbDate(
                +dateSplit[0],
                +dateSplit[1],
                +dateSplit[2]
              );
              this.lastDay = new NgbDate(
                parseInt(dateSplit[0], 10),
                parseInt(dateSplit[1], 10),
                parseInt(dateSplit[2], 10)
              );
              this.dateForm.get("first")?.setValue(this.lastDay);
              this.dateForm.get("first")?.updateValueAndValidity();
              this.passedDay = this.lastDay.day;
            } else {
              //TODO: congratulation, job request
              // this.isCongratulationModal.next(true);
            }
          }
        });
      });
  }

  // handle vacancy exntension
  public selectedDate(event: any) {
    this.newDateForVacancy = event;
    const joinValue = Object.values(event).join(" ").split("");
    const elem = joinValue.map((replaceValue, i) => {
      return replaceValue.replace(" ", "-");
    });

    const elemJoin = elem.join("");
    if (elemJoin) {
      convertLocalDateTime(new Date(elemJoin).toLocaleDateString());
      this.newDateForVacancy = elemJoin;
    }
  }

  public changeVacancyDeadlineDate() {
    if (!!this.newDateForVacancy) {
      const updatedVacancyDate: NotificationItemInfo = {
        uuid: this.changeDeadlineDate.uuid,
        deadlineDate: convertLocalDateTime(new Date(this.newDateForVacancy).toLocaleDateString()),
        notificationStatus: true,
        notificationUuid: this.notificationUuid
      };
      this._companyService
        .changeCompanyVacancyDeadlineDate(updatedVacancyDate)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.dateForm.reset();
          this.isDeadlineDateModal.next(!this.isDeadlineDateModal.value);
          this.getSelectedPaginationValue(1);
        });
    }
  }

  public ngOnDestroy() {
    this.unsubscribe();
  }
}
