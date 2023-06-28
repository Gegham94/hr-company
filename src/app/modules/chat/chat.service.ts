import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ObjectType } from "../../shared/types/object.type";
import { AcceptOrDeclineEnum } from "./constants/accept-or-decline.enum";
import { IConversation } from "./interfaces/conversations";
import { SocketService } from "./socket.service";
import { IMessage } from "./interfaces/messages";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private readonly GET_CONVERSATION_MESSAGES_API = `${environment.chatUrl}/chat/messages/company`;
  private readonly GET_COMPANY_CONVERSATION_API = `${environment.chatUrl}/chat/conversation/company`;
  private readonly UPDATE_COMPANY_CONVERSATION_API = `${environment.chatUrl}/chat/conversation`;

  constructor(private readonly _chatSocketService: SocketService, private readonly _http: HttpClient) {
  }

  public updateConversationMessage(messageUuid: string, messageData: { status: boolean }): Observable<IMessage> {
    return this._http.put<IMessage>(this.UPDATE_COMPANY_CONVERSATION_API, {
      messageUuid,
      messageData,
    });
  }

  public getConversationsRequest$(companyUuid: string): Observable<IConversation[]> {
    return this._http.get<IConversation[]>(this.GET_COMPANY_CONVERSATION_API, {
      params: {
        companyUuid,
      },
    });
  }

  public emitConversationCompanyToSpecialist(companyUuid: string, specialistUuid: string, foundSpecialistUuid: string): void {
    this._chatSocketService.getSocket().emit("emitConversationCompanyToSpecialist", {
      companyUuid,
      specialistUuid,
      foundSpecialistUuid,
    });
  }

  public getConversationMessagesRequest(conversationUuid: string): Observable<IMessage[]> {
    return this._http.get<IMessage[]>(this.GET_CONVERSATION_MESSAGES_API, {
      params: { conversationUuid },
    });
  }

  public getMessageFromSpecialistToCompanyHandler$(): Observable<IMessage> {
    return this._chatSocketService.getSocket().fromEvent("getMessageFromSpecialistToCompany");
  }

  public getCompanyConversationUuidHandler$(): Observable<string> {
    return this._chatSocketService.getSocket().fromEvent("getCompanyConversationUuid");
  }

  public emitMessageIsViewedFromCompanyHandler$(lastMessageUuid: string, specialistUuid: string) {
    this._chatSocketService.getSocket().emit("emitMessageIsViewedFromCompany", {
      lastMessageUuid,
      specialistUuid,
    });
  }

  public emitSendMessageFromCompanyToSpecialist(message: IMessage): void {
    this._chatSocketService.getSocket().emit("emitSendMessageFromCompanyToSpecialist", message);
  }

  public acceptOrDeclineSpecialistRequest(status: string, uuid: string, reason: string = ""): Observable<ObjectType> {
    const fullUrl = `${environment.url}/specialist-accepted/accept-or-decline/${status}/${uuid}`;
    if (status === AcceptOrDeclineEnum.ACCEPTED) {
      return this._http.put<ObjectType>(fullUrl, JSON.stringify({}));
    }
    return this._http.put<ObjectType>(fullUrl, { reason: reason });
  }

  public hideOtherSpecialistRequest(uuid: string, vacancyUuid: string): Observable<ObjectType> {
    const fullUrl = `${environment.url}/specialist-accepted/hide-other-specialist/${uuid}/${vacancyUuid}`;
    return this._http.put<ObjectType>(fullUrl, {});
  }
}
