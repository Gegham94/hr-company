import { Injectable } from "@angular/core";
import { NotificationsState } from "./notifications.state";
import { NotificationsService } from "./notifications.service";
import { Subscription, Observable } from "rxjs";
import { NotificationOrNull } from "../interfaces/notifications.interface";

@Injectable({
  providedIn: "root"
})
export class NotificationsFacade {
  private destroyGetCompanyNotificationHandler$: Subscription = new Subscription();
  private destroyGetCompanyNotificationRequest$: Subscription = new Subscription();
  private destroyGetChatNotificationRequest$: Subscription = new Subscription();

  constructor(
    private readonly _notificationState: NotificationsState,
    private readonly _notificationService: NotificationsService
  ) {
  }

  public getNotification$(): Observable<NotificationOrNull> {
    return this._notificationState.getNotification$();
  }

  public getCompanyNotificationHandler$() {
    this.destroyGetCompanyNotificationHandler$ =
      this._notificationService.getCompanyNotificationHandler$()
        .subscribe((data: NotificationOrNull) => {
          if(data) {
            this._notificationState.setNotification({
              notificationData: data?.notificationData,
              count: data?.count
            });
          }
        });
  }

  public getCompanyNotificationRequest$(recipientUuid: string): void {
    this.destroyGetCompanyNotificationRequest$ =
      this._notificationService.getCompanyNotificationRequest$(recipientUuid)
        .subscribe((data: NotificationOrNull) => {
          if(data) {
            this._notificationState.setNotification({
              notificationData: data?.notificationData,
              count: data?.count
            });
          }
          this.destroyGetCompanyNotificationRequest$.unsubscribe();
        });
  }

  public getCompanyNotifications$(): Observable<NotificationOrNull> {
    return this._notificationState.getCompanyNotification$();
  }

  public getChatNotifications$(): Observable<NotificationOrNull> {
    return this._notificationState.getChatNotification$();
  }

  public destroyGetCompanyNotificationHandler() {
    this.destroyGetCompanyNotificationHandler$.unsubscribe();
  }

  public destroyGetChatNotificationHandler() {
    this.destroyGetChatNotificationRequest$.unsubscribe();
  }
}
