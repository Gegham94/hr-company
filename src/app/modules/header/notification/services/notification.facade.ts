import { Injectable } from "@angular/core";
import { NotificationsState } from "./notification.state";
import { NotificationService } from "./notification.service";
import { Subscription, Observable } from "rxjs";
import { INotificationOrNull } from "../../interfaces/notifications.interface";

@Injectable({
  providedIn: "root",
})
export class NotificationFacade {
  private destroyGetCompanyNotificationHandler$: Subscription = new Subscription();
  private destroyGetCompanyNotificationRequest$: Subscription = new Subscription();

  constructor(
    private readonly _notificationState: NotificationsState,
    private readonly _notificationService: NotificationService
  ) {}

  public getNotification$(): Observable<INotificationOrNull> {
    return this._notificationState.getNotification$();
  }

  public getCompanyNotificationHandler$() {
    this.destroyGetCompanyNotificationHandler$ = this._notificationService
      .getCompanyNotificationHandler$()
      .subscribe((data: INotificationOrNull) => {
        if (data) {
          this._notificationState.setNotification({
            notificationData: data?.notificationData,
            count: data?.count,
          });
        }
      });
  }

  public getCompanyNotificationRequest$(recipientUuid: string): void {
    this.destroyGetCompanyNotificationRequest$ = this._notificationService
      .getCompanyNotificationRequest$(recipientUuid)
      .subscribe((data: INotificationOrNull) => {
        if (data) {
          this._notificationState.setNotification({
            notificationData: data?.notificationData,
            count: data?.count,
          });
        }
        this.destroyGetCompanyNotificationRequest$.unsubscribe();
      });
  }

  public getCompanyNotifications$(): Observable<INotificationOrNull> {
    return this._notificationState.getCompanyNotification$();
  }

  public destroyGetCompanyNotificationHandler() {
    this.destroyGetCompanyNotificationHandler$.unsubscribe();
  }
}
