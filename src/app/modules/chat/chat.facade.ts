import {Injectable} from "@angular/core";
import {ChatState} from "./chat.state";
import {filter, map, Observable, Subject, switchMap} from "rxjs";
import {ChatService} from "./chat.service";
import {ObjectType} from "../../shared/types/object.type";
import {LocalStorageService} from "../../shared/services/local-storage.service";
import {Conversation} from "./interfaces/conversations";
import {CompanyFacade} from "../company/services/company.facade";
import {IMessage, Message} from "./interfaces/messages";
import { BottomChatSettings } from "src/app/shared/services/chat-helper.service";

@Injectable({
  providedIn: "root",
})
export class ChatFacade {
  public openAcceptOrRejectModal$: Subject<void> = new Subject<void>();

  constructor(
    private readonly _chatState: ChatState,
    private readonly _chatService: ChatService,
    private readonly _localStorage: LocalStorageService,
    private readonly _companyFacade: CompanyFacade
  ) {}

  public setChatSettings(value: BottomChatSettings): void {
    this._chatState.setChatSettings(value);
  }

  public getChatSettings(): Observable<BottomChatSettings> {
    return this._chatState.getChatSettings();
  }

  public getIsAvailableAfterAcceptOrReject$(): Observable<boolean> {
    return this._chatState.getIsAvailableAfterAcceptOrReject$();
  }

  public setIsAvailableAfterAcceptOrReject(value: boolean): void {
    this._chatState.setIsAvailableAfterAcceptOrReject(value);
  }

  public getConversations$(): Observable<Conversation[]> {
    return this._chatState.getConversations$();
  }

  public getConversations(): Conversation[] {
    return this._chatState.getConversations();
  }

  public setConversations(conversation: Conversation[]): void {
    this._chatState.setConversations(conversation);
  }

  public getIsUnreadMessage(): Observable<boolean> {
    return this._chatState.getIsUnreadMessage$();
  }

  public setIsUnreadMessage(value: boolean): void {
    this._chatState.setIsUnreadMessage(value);
  }

  public getSelectedConversation$(): Observable<Conversation | null> {
    return this._chatState.getSelectedConversation$();
  }

  public setSelectedConversation$(conversation: Conversation | null): void {
    this._chatState.setSelectedConversation$(conversation);
  }

  public getChatPopupStatus$(): Observable<boolean> {
    return this._chatState.getChatPopupStatus$();
  }

  public setChatPopupStatus(isVisible: boolean): void {
    this._chatState.setChatPopupStatus(isVisible);
  }

  public getCandidatesPopupStatus$(): Observable<boolean> {
    return this._chatState.getCandidatesPopupStatus$();
  }

  public setCandidatesPopupStatus(isVisible: boolean): void {
    this._chatState.setCandidatesPopupStatus(isVisible);
  }

  public getChatMessages$(): Observable<Message[]> {
    return this._chatState.getChatMessages$();
  }

  public getConversationsRequest(): Observable<Conversation[]> {
    return this._companyFacade.getCompanyData$()
      .pipe(
        switchMap(company => {
          if (company.uuid) {
            return this._chatService.getConversationsRequest$(company.uuid)
              .pipe(map((conversations) => {
                const conversationModified = conversations.map(conv => new Conversation(conv));
                const rearranged = this.rearrangeConversation(conversationModified);
                this.setConversations(rearranged || []);
                return rearranged || [];
              }));
          }
          return [];
        }));
  }

  public rearrangeConversation(conversations: Conversation[] | null): Conversation[] | null {
    if (!conversations) {
      return null;
    }

    const sortByDateDescending = (item1: Conversation, item2: Conversation) => {
      return new Date(item2.last_message.createdAt).getTime() - new Date(item1.last_message.createdAt).getTime();
    };

    const unreadConversations = conversations.filter(conv => conv.last_message?.messageStatus === false);
    const readConversations = conversations.filter(conv => conv.last_message?.messageStatus === true);

    const sortedUnreadConversations = unreadConversations.sort(sortByDateDescending);
    const sortedReadConversations = readConversations.sort(sortByDateDescending);

    return [...sortedUnreadConversations, ...sortedReadConversations];
  }

  public setChatMessage(message: Message): void {
    this._chatState.setChatMessage(message);
    this._chatService.emitSendMessageFromCompanyToSpecialist(message);
  }

  public addChatMessage(message: Message | Message[]): void {
    this._chatState.setChatMessage(message);
  }

  public emitConversationCompanyToSpecialist(
    companyUuid: string,
    specialistUuid: string,
    foundSpecialistUuid: string
  ): void {
    this._chatState.clearMessages();
    this._chatService.emitConversationCompanyToSpecialist(companyUuid, specialistUuid, foundSpecialistUuid);
  }

  public getMessageFromSpecialistToCompanyHandler$(): Observable<IMessage> {
    return this._chatService.getMessageFromSpecialistToCompanyHandler$();
  }

  public emitGetConversationMessagesRequest(conversationUuid: string): Observable<IMessage[]> {
    return this._chatService
      .getConversationMessagesRequest(conversationUuid)
      .pipe(
        filter((data) => !!data),
        map(data => data)
      );
  }

  public updateConversationMessage(messageUuid: string, messageData: { status: boolean }): Observable<IMessage> {
    return this._chatService.updateConversationMessage(messageUuid, messageData);
  }

  public acceptOrDeclineSpecialistRequest(status: string, uuid: string, reason?: string): Observable<ObjectType> {
    return this._chatService.acceptOrDeclineSpecialistRequest(status, uuid, reason);
  }

  public hideOtherSpecialistRequest(uuid: string, vacancyUuid: string): Observable<ObjectType> {
    return this._chatService.hideOtherSpecialistRequest(uuid, vacancyUuid);
  }
}
