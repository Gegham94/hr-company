import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { INotificationOrNull } from "../../interfaces/notifications.interface";

@Injectable({
  providedIn: "root",
})
export class NotificationsState {
  private notification$: BehaviorSubject<INotificationOrNull> = new BehaviorSubject<INotificationOrNull>(null);
  private companyNotifications$: BehaviorSubject<INotificationOrNull> = new BehaviorSubject<INotificationOrNull>(null);

  public getNotification$(): Observable<INotificationOrNull> {
    return this.notification$.asObservable();
  }

  public setNotification(notification: INotificationOrNull): void {
    this.notification$.next(notification);
  }

  public getCompanyNotification$(): Observable<INotificationOrNull> {
    return this.companyNotifications$.asObservable();
  }

  public setCompanyNotification(notification: INotificationOrNull): void {
    this.companyNotifications$.next(notification);
  }
}
