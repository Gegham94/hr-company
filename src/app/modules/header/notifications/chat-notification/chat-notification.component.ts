import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from "@angular/core";
import {NotificationsFacade} from "../notifications.facade";
import {HeaderFacade} from "../../header.facade";
import {HeaderDropdownsEnum} from "../../constants/header-dropdowns.enum";
import {NotificationsService} from "../notifications.service";
import {GlobalChatNotificationItemInterface} from "../../interfaces/global-chat-notification.interface";
import {InfiniteScrollDirective} from "ngx-infinite-scroll";
import {BehaviorSubject, distinctUntilChanged, filter, tap} from "rxjs";
import {MyVacancyFilterInterface} from "../../../vacancy/interfaces/my-vacancy-filter.interface";
import {ChatFacade} from "../../../chat/chat.facade";
import {AuthService} from "../../../auth/auth.service";
import {ScreenSizeType} from "../../../app/interfaces/screen-size.type";
import {ScreenSizeService} from "../../../app/services/screen-size.service";

@Component({
  selector: "hr-chat-notification",
  templateUrl: "./chat-notification.component.html",
  styleUrls: ["./chat-notification.component.scss"]
})

export class ChatNotificationComponent implements OnInit {
  @Input("isMenuOpen") mobile: boolean = false;
  @ViewChild(InfiniteScrollDirective) infiniteScroll!: InfiniteScrollDirective;

  public notificationData: GlobalChatNotificationItemInterface[] = [];
  public currentStepNote!: GlobalChatNotificationItemInterface[];
  public count!: number;
  public hasNotification: number = 0;
  public isDropdownOpen$ = this._headerFacade.getStateDropdown$(HeaderDropdownsEnum.chatNotifications);
  public notificationCount: number = 0;
  public currentPage: number = 0;
  public pagination: MyVacancyFilterInterface = {take: 100, skip: 0};
  public limit: number = 100;
  private requestCount: number = 0;
  public loadingMoreNotifications$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor(
    private readonly _notificationFacade: NotificationsFacade,
    private readonly _headerFacade: HeaderFacade,
    private readonly service: NotificationsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly chatFacade: ChatFacade,
    private readonly _authService: AuthService,
    private readonly screenSizeService: ScreenSizeService
  ) {
  }

  get screenSize(): ScreenSizeType {
    return this.screenSizeService.calcScreenSize;
  }

  get virtualContainerHeight(): number {
    return this.screenSize === "DESKTOP" ? 350 : window.innerHeight - 55;
  }

  get virtualScrollItemSize(): number {
    return this.screenSize === "EXTRA_SMALL" ? 60 : 75;
  }

  public ngOnInit(): void {
    if (this._authService?.getToken) {
      this.getSelectedPaginationValue(1);
      this.getChatNotificationCount();
    }
  }

  public getNextBatch(index: number): void {
    if (this.currentStepNote.length > 25 && index > this.notificationData.length - 25) {
      if (this.requestCount === 0) {
        this.loadingMoreNotifications$.next(true);
        this.currentPage++;
        this.requestCount++;
        this.getSelectedPaginationValue(this.currentPage);
      }
    }
  }

  private getChatNotificationCount(): void {
    if (this._authService?.getToken) {
      this.service.updateViewedMessageCountNotification$().subscribe((chat) => {
        this.count = chat["count"];
      });
    }
  }

  private vacanciesPagesCount(count: number): void {
    this.notificationCount = Math.ceil(count / this.limit);
  }

  public openNotificationsListAction(event: Event, newState?: boolean): void {
    event.stopPropagation();
    this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.chatNotifications, newState);
    this.notificationData = [];
    if (newState || newState == undefined) {
      this.getSelectedPaginationValue(1);
    }

  }

  public getSelectedPaginationValue(pageNumber: number): void {
    const limit = 100;
    const end = pageNumber * limit;
    const start = end - limit;

    this.pagination.skip = start;
    this.pagination.take = this.limit;
    this.service.getGlobalChatNotification$(this.pagination)
      .pipe(distinctUntilChanged())
      .subscribe((note) => {
        this.requestCount = 0;
        this.currentStepNote = note.result;
        this.notificationData = [...this.notificationData, ...note.result];
        this.hasNotification = note.count;
        this.loadingMoreNotifications$.next(false);
        this.vacanciesPagesCount(note.count);
        this.cdr.detectChanges();
      });
  }

  public selectNotification(uuid: string): void {
    this.service.updateViewedMessageNotification$(uuid)
      .pipe(
        tap(() => {
            this.chatFacade.setChatPopupStatus(true);
            this._headerFacade.resetDropdownsState(HeaderDropdownsEnum.chatNotifications, false);
          }
        ),
        filter((viewNot) => viewNot["affected"] >= 1))
      .subscribe(() => {
        this.notificationData.map((not) => {
          if (not.uuid === uuid && this.count > 0 && !not.status) {
            not.status = true;
            this.count--;
          }
        });
        this.cdr.detectChanges();
      });
  }

}
