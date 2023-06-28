import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs";
import { IGlobalNotification, INotificationOrNull } from "../../interfaces/notifications.interface";
import { SocketService } from "../../../chat/socket.service";
import { IMyVacancyFilter } from "src/app/modules/vacancy/interfaces/my-vacancy-filter.interface";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private readonly GET_NOTIFICATIONS_API = `${environment.notificationUrl}/notification`;
  private readonly globalNotification = environment.notification;

  constructor(private readonly _chatSocketService: SocketService, private readonly _httpClient: HttpClient) {}

  public getCompanyNotificationHandler$(): Observable<INotificationOrNull> {
    return this._chatSocketService.getSocket().fromEvent("getCompanyNotification");
  }

  public getCompanyNotificationRequest$(recipientUuid: string): Observable<INotificationOrNull> {
    return this._httpClient.get<INotificationOrNull>(this.GET_NOTIFICATIONS_API, {
      params: {
        recipientUuid,
      },
    });
  }

  public getGlobalNotification$(pagination: IMyVacancyFilter): Observable<IGlobalNotification> {
    return this._httpClient.get<IGlobalNotification>(`${this.globalNotification}/notification/global`, {
      params: { ...pagination },
    });
  }

  public updateViewedNotification$(uuid: string): Observable<any> {
    return this._httpClient.put<any>(`${this.globalNotification}/notification/global/${uuid}`, {});
  }

  public updateViewedMessageNotification$(uuid: string): Observable<any> {
    return this._httpClient.put<any>(`${this.globalNotification}/message/${uuid}`, {});
  }
  public updateViewedMessageCountNotification$(): Observable<any> {
    return this._httpClient.get<any>(`${this.globalNotification}/message/count`, {});
  }
}
