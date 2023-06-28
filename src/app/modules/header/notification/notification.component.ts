import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { NgbCalendar } from "@ng-bootstrap/ng-bootstrap";
import { BehaviorSubject, distinctUntilChanged, filter, takeUntil } from "rxjs";
import { HeaderFacade } from "../services/header.facade";
import { HeaderDropdownsEnum } from "../constants/header-dropdowns.enum";
import { IGlobalNotificationItem, INotificationItemInfo } from "../interfaces/notifications.interface";
import { NotificationService } from "./services/notification.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MaxDeadlineDateVacancy } from "../../app/constants";
import { InputStatusEnum } from "src/app/shared/enum/input-status.enum";
import { AuthService } from "../../auth/service/auth.service";
import { CompanyService } from "../../company/services/company.service";
import { ScreenSizeService } from "src/app/shared/services/screen-size.service";
import { Unsubscribe } from "src/app/shared/unsubscriber/unsubscribe";
import { IMyVacancyFilter } from "../../vacancy/interfaces/my-vacancy-filter.interface";
import { ScreenSizeType } from "src/app/shared/interfaces/screen-size.type";

@Component({
  selector: "hr-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent extends Unsubscribe implements OnInit {
  @Input("isMenuOpen") mobile: boolean = false;

  public count!: number;

  public hasNotification: number = 0;
  public notificationData: BehaviorSubject<IGlobalNotificationItem[]> = new BehaviorSubject<IGlobalNotificationItem[]>(
    []
  );
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(HeaderDropdownsEnum.notifications);
  public loadingMoreNotifications$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isDeadlineDateModal: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isCongratulationModal: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isJobRequestModal: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public changeDeadlineDate!: INotificationItemInfo;
  public showVacancyStateStatus: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public inputStatusList = InputStatusEnum;
  public maxData: number = MaxDeadlineDateVacancy;
  public dateForm: FormGroup = this.formBuilder.group({
    days: ["", [Validators.required, Validators.min(1), Validators.max(this.maxData)]],
  });

  private currentPage: number = 0;
  private currentStepNote: IGlobalNotificationItem[] = [];
  private vacancyUuid: string = "";
  private notificationUuid: string = "";
  private pagination: IMyVacancyFilter = { take: 0, skip: 0 };
  private limit: number = 100;
  private requestCount: number = 0;

  public get getDaysControl(): FormControl {
    return this.dateForm.get("days") as FormControl;
  }
  public get screenSize(): ScreenSizeType {
    return this.screenSizeService.calcScreenSize;
  }
  public get virtualContainerHeight(): number {
    return this.screenSize === "DESKTOP" ? 350 : window.innerHeight - 55;
  }
  public get virtualScrollItemSize(): number {
    return this.screenSize === "EXTRA_SMALL" ? 46 : 74;
  }

  constructor(
    public readonly calendar: NgbCalendar,
    private readonly formBuilder: FormBuilder,
    private readonly _headerFacade: HeaderFacade,
    private readonly service: NotificationService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _authService: AuthService,
    private readonly _companyService: CompanyService,
    private readonly screenSizeService: ScreenSizeService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.getSelectedPaginationValue(1);
  }

  private addMaxValidator(maxValue: number) {
    const dataControl = this.dateForm.get("days");
    if (dataControl) {
      dataControl.setValidators([Validators.required, Validators.max(maxValue)]);
      dataControl.updateValueAndValidity();
    }
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
    const updatedVacancyDate: INotificationItemInfo = {
      notificationUuid: this.notificationUuid,
      notificationStatus: false,
      deadlineDate: this.changeDeadlineDate.deadlineDate,
      uuid: this.changeDeadlineDate.uuid,
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

  public getSelectedPaginationValue(pageNumber: number): void {
    const limit = 100;
    const end = pageNumber * limit;
    this.pagination.skip = end - limit;
    this.pagination.take = this.limit;
    if (this._authService.getToken) {
      this.service
        .getGlobalNotification$(this.pagination)
        .pipe(takeUntil(this.ngUnsubscribe), distinctUntilChanged())
        .subscribe((note) => {
          this.requestCount = 0;
          this.currentStepNote = note.result;
          this.notificationData.next([...this.notificationData.value, ...note.result]);
          this.count = note?.unviewedCount ?? null;
          this.hasNotification = note.count;
          this.loadingMoreNotifications$.next(false);
          this._cdr.detectChanges();
        });
    }
  }

  // open / close notification menu
  public openNotificationsListAction(event: Event): void {
    const state = this._headerFacade.getStateDropdown(HeaderDropdownsEnum.notifications);
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.notifications, state);
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
    this._headerFacade.setStateDropdown$(HeaderDropdownsEnum.notifications, false);

    this.service
      .updateViewedNotification$(uuid)
      .pipe(
        filter((viewNot) => viewNot["affected"] >= 1),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(() => {
        this.notificationData.value.forEach((not) => {
          if (not.uuid === uuid) {
            if (!not.viewed && this.count > 0) {
              not.viewed = true;
              this.count--;
            }
            if (not.info.hasOwnProperty("vacancyInfo")) {
              if (not.info.hasOwnProperty("status")) {
                if (not.info?.status) {
                  this.showVacancyStateStatus.next(`Вы уже продлили вакансию.`);
                } else {
                  this.showVacancyStateStatus.next(`Вакансия архивирована.`);
                }
              } else {
                this.showVacancyStateStatus.next("");
              }
              this.isDeadlineDateModal.next(true);
              this.vacancyUuid = not.info.vacancyInfo.uuid;
              this.notificationUuid = not.uuid;
              this.changeDeadlineDate = not.info.vacancyInfo;
              let dayDiff = MaxDeadlineDateVacancy;
              if (not.info.vacancyInfo.paidDate) {
                dayDiff =
                  MaxDeadlineDateVacancy -
                  Math.ceil(
                    (new Date(not.info.vacancyInfo.deadlineDate).getTime() -
                      new Date(not.info.vacancyInfo.paidDate).getTime()) /
                      (1000 * 3600 * 24)
                  );
              }
              this.maxData = dayDiff < 1 ? 0 : dayDiff;
              this.addMaxValidator(this.maxData);
            } else {
              //TODO: congratulation, job request
              // this.isCongratulationModal.next(true);
            }
          }
          this._cdr.detectChanges();
        });
      });
  }

  public changeVacancyDeadlineDate() {
    if (this.dateForm.valid) {
      const deadlineDate = new Date(this.changeDeadlineDate.deadlineDate);
      deadlineDate.setDate(deadlineDate.getDay() + this.dateForm.get("days")?.value);
      const updatedVacancyDate: INotificationItemInfo = {
        uuid: this.changeDeadlineDate.uuid,
        deadlineDate: deadlineDate.toISOString().split("T")[0],
        notificationStatus: true,
        notificationUuid: this.notificationUuid,
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
