import {Injectable} from "@angular/core";
import {HttpClient, HttpEvent} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {ChatSocketService} from "../../chat/chat-socket.service";
import {Observable, of} from "rxjs";
import {GlobalNotification, NotificationOrNull, Notifications} from "../interfaces/notifications.interface";
import {MyVacancyFilterInterface} from "../../vacancy/interfaces/my-vacancy-filter.interface";
import {GlobalChatNotificationInterface} from "../interfaces/global-chat-notification.interface";
import {SocketService} from "../../chat/socket.service";


@Injectable({
  providedIn: "root"
})
export class NotificationsService {

  private readonly GET_NOTIFICATIONS_API = `${environment.notificationUrl}/notification`;
  private readonly globalNotification = environment.notification;

  constructor(
    private readonly _chatSocketService: SocketService,
    private readonly _httpClient: HttpClient
  ) {
  }

  public getCompanyNotificationHandler$(): Observable<NotificationOrNull> {
    return this._chatSocketService.getSocket().fromEvent("getCompanyNotification");
  }

  public getCompanyNotificationRequest$(recipientUuid: string): Observable<NotificationOrNull> {
    return this._httpClient.get<NotificationOrNull>(this.GET_NOTIFICATIONS_API, {
      params: {
        recipientUuid
      }
    });
  }

  public getGlobalNotification$(pagination: MyVacancyFilterInterface): Observable<GlobalNotification> {
    return this._httpClient.get<GlobalNotification>(`${this.globalNotification}/notification/global`,
      {params: {...pagination}});
  }
  public getGlobalChatNotification$(pagination: MyVacancyFilterInterface):
    Observable<GlobalChatNotificationInterface> {
    return this._httpClient.get<GlobalChatNotificationInterface>(`${this.globalNotification}/message`,
      {params:{...pagination}});
  }

  public updateViewedNotification$(uuid: string):Observable<any> {
   return  this._httpClient.put<any>(`${this.globalNotification}/notification/global/${uuid}`,{});
  }

  public updateViewedMessageNotification$(uuid: string):Observable<any> {
   return  this._httpClient.put<any>(`${this.globalNotification}/message/${uuid}`,{});
  }
  public updateViewedMessageCountNotification$():Observable<any> {
   return  this._httpClient.get<any>(`${this.globalNotification}/message/count`,{});
  }

}
