import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MessageInterface } from "./chat.component";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { ObjectType } from "../../shared-modules/types/object.type";
import { AcceptOrDeclineEnum } from "./constants/accept-or-decline.enum";
import { IConversation } from "./interfaces/conversations";
import { SocketService } from "./socket.service";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private readonly GET_CONVERSATION_MESSAGES_API = `${environment.chatUrl}/chat/messages/company`;
  private readonly GET_COMPANY_CONVERSATION_API = `${environment.chatUrl}/chat/conversation/company`;
  private readonly UPDATE_COMPANY_CONVERSATION_API = `${environment.chatUrl}/chat/conversation`;

  constructor(private readonly _chatSocketService: SocketService, private readonly _http: HttpClient) {
  }

  public updateConversationMessage(messageUuid: string, messageData: any) {
    return this._http.put(this.UPDATE_COMPANY_CONVERSATION_API, {
      messageUuid,
      messageData,
    });
  }

  public emitGetConversationsRequest$(companyUuid: string): Observable<IConversation[]> {
    return this._http.get<IConversation[]>(this.GET_COMPANY_CONVERSATION_API, {
      params: {
        companyUuid,
      },
    });
  }

  public emitConversationCompanyToSpecialist(companyUuid: string, specialistUuid: string, foundSpecialistUuid: string) {
    this._chatSocketService.getSocket().emit("emitConversationCompanyToSpecialist", {
      companyUuid,
      specialistUuid,
      foundSpecialistUuid,
    });
    console.log("conversation is created....");
  }

  public getConversationMessagesRequest(conversationUuid: string): Observable<MessageInterface[]> {
    return this._http.get<MessageInterface[]>(this.GET_CONVERSATION_MESSAGES_API, {
      params: { conversationUuid },
    });
  }

  public getMessageFromSpecialistToCompanyHandler$(): Observable<MessageInterface> {
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

  public emitSendMessageFromCompanyToSpecialist(message: MessageInterface) {
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
