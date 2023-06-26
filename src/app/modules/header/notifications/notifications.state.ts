import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { NotificationOrNull, Notifications } from "../interfaces/notifications.interface";

@Injectable({
  providedIn: "root"
})
export class NotificationsState {
  private notification$: BehaviorSubject<NotificationOrNull> = new BehaviorSubject<NotificationOrNull>(null);
  private companyNotifications$: BehaviorSubject<NotificationOrNull> = new BehaviorSubject<NotificationOrNull>(null);
  private chatNotifications$: BehaviorSubject<NotificationOrNull> = new BehaviorSubject<NotificationOrNull>(null);

  public getNotification$(): Observable<NotificationOrNull> {
    return this.notification$.asObservable();
  }

  public setNotification(notification: NotificationOrNull): void {
    this.notification$.next(notification);
  }

  public getCompanyNotification$(): Observable<NotificationOrNull> {
    return this.companyNotifications$.asObservable();
  }

  public setCompanyNotification(notification: NotificationOrNull): void {
    this.companyNotifications$.next(notification);
  }

  public getChatNotification$(): Observable<NotificationOrNull> {
    return this.chatNotifications$.asObservable();
  }

  public setChatNotification(notification: NotificationOrNull): void {
    this.chatNotifications$.next(notification);
  }
}
