import {Injectable} from "@angular/core";
import {ChatState} from "./chat.state";
import {filter, map, Observable, of, Subscription, switchMap, take, tap} from "rxjs";
import {ChatService} from "./chat.service";
import {MessageInterface} from "./chat.component";
import {ObjectType} from "../../shared-modules/types/object.type";
import {LocalStorageService} from "../app/services/local-storage.service";
import {IConversation} from "./interfaces/conversations";
import {CompanyFacade} from "../company/company.facade";

@Injectable({
  providedIn: "root",
})
export class ChatFacade {
  private destroyGetCompanyConversationUuidHandler$: Subscription = new Subscription();
  private destroyGetMessageFromSpecialistToCompanyHandler$: Subscription = new Subscription();
  private destroyGetConversationMessagesRequestSubscription$: Subscription = new Subscription();
  private destroyUpdateConversationMessageSubscription$: Subscription = new Subscription();

  private conversationUuid: string = "";
  private lastMessageUuid: string = "";

  constructor(
    private readonly _chatState: ChatState,
    private readonly _chatService: ChatService,
    private readonly _localStorage: LocalStorageService,
    private readonly _companyFacade: CompanyFacade
  ) {
  }

  public getIsAvailableAfterAcceptOrReject$(): Observable<boolean> {
    return this._chatState.getIsAvailableAfterAcceptOrReject$();
  }

  public setIsAvailableAfterAcceptOrReject(value: boolean): void {
    this._chatState.setIsAvailableAfterAcceptOrReject(value);
  }

  public getConversations$() {
    return this._chatState.getConversations$();
  }

  public getConversations() {
    return this._chatState.getConversations();
  }

  public setConversations(conversation: IConversation[]): void {
    this._chatState.setConversations(conversation);
  }

  public getIsUnreadMessage() {
    return this._chatState.getIsUnreadMessage$();
  }

  public setIsUnreadMessage(value: boolean): void {
    this._chatState.setIsUnreadMessage(value);
  }

  public getConversation$() {
    return this._chatState.getConversation$();
  }

  public setConversation(conversation: IConversation | null): void {
    this._chatState.setConversation(conversation);
  }

  public getUnreadMessagesCount$() {
    return this._chatState.getUnreadMessagesCount$();
  }

  public setUnreadMessagesCount$(count: number) {
    return this._chatState.setUnreadMessagesCount$(count);
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

  public getAcceptOrDeclinePopupStatus$(): Observable<boolean> {
    return this._chatState.getAcceptOrDeclinePopupStatus$();
  }

  public setAcceptOrDeclinePopupStatus$(isVisible: boolean): void {
    this._chatState.setAcceptOrDeclinePopupStatus$(isVisible);
  }

  public getChatMessages$(): Observable<MessageInterface[]> {
    return this._chatState.getChatMessages$();
  }

  public getConversationUuid$(): Observable<string> {
    return this._chatState.getConversationUuid$();
  }

  public emitGetConversationsRequest(): Observable<IConversation[] | null> {
    return this._companyFacade.getCompanyData$().pipe(
      switchMap((company) => {
        if (!!company && company?.uuid) {
          return this._chatService.emitGetConversationsRequest$(company?.uuid)
            .pipe(map((conversations) =>
                this.rearrangeConversation(conversations)),
              tap((conversations) => this.setConversations(conversations || [])));
        } else {
          return of([]);
        }
      })
    );
  }

  public rearrangeConversation(conversations: IConversation[] | null): IConversation[] | null {
    if (!conversations) {
      return null;
    } else if (conversations.length === 1) {
      return conversations;
    }
    const unreadConversations = conversations.filter((conv) => conv.last_message?.messageStatus === false);
    const readConversations = conversations.filter((conv) => conv.last_message?.messageStatus === true);

    const sortedUnreadConversations: IConversation[] =
      unreadConversations.sort((item1, item2) => {
        return new Date(item2.last_message.createdAt).getTime() - new Date(item1.last_message.createdAt).getTime();
      });

    const sortedReadConversations: IConversation[] =
      readConversations.sort((item1, item2) => {
        return new Date(item2.last_message.createdAt).getTime() - new Date(item1.last_message.createdAt).getTime();
      });

    return [...sortedUnreadConversations, ...sortedReadConversations];
  }

  public setChatMessage(message: MessageInterface): void {
    Object.assign(message);
    this._chatState.setChatMessage(message);
    this._chatService.emitSendMessageFromCompanyToSpecialist(message);
  }

  public emitConversationCompanyToSpecialist(
    companyUuid: string,
    specialistUuid: string,
    foundSpecialistUuid: string
  ): void {
    this._chatState.clearMessages();
    this._chatService.emitConversationCompanyToSpecialist(companyUuid, specialistUuid, foundSpecialistUuid);
  }

  public getMessageFromCompanyToSpecialistHandler$(): Observable<MessageInterface> {
    return this._chatService.getMessageFromSpecialistToCompanyHandler$().pipe(
      map((message) => {
        this.lastMessageUuid = message.uuid;
        this.getCompanyConversationUuidHandler$();
        return message;
      })
    );
  }

  public emitGetConversationMessagesRequest(conversationUuid: string) {
    if (conversationUuid) {
      this.destroyGetConversationMessagesRequestSubscription$ = this._chatService
        .getConversationMessagesRequest(conversationUuid)
        .pipe(filter((data) => !!data))
        .subscribe((messages: any) => {
          this._chatState.setChatMessage(messages);
          this.lastMessageUuid = messages.slice(-1)[0]?.uuid;
          this.destroyGetConversationMessagesRequestSubscription$.unsubscribe();
        });
    }
  }

  public emitGetConversationMessagesRequest$(conversationUuid: string): Observable<MessageInterface[] | null> {
    if (conversationUuid) {
      return this._chatService
        .getConversationMessagesRequest(conversationUuid)
        .pipe(
          map((messages: MessageInterface[]) => {
            this._chatState.setChatMessage(messages);
            this.lastMessageUuid = messages.slice(-1)[0]?.uuid;
            return messages;
          }));
    }
    return of(null);
  }

  public getCompanyConversationUuidHandler$() {
    this.destroyGetCompanyConversationUuidHandler$ = this._chatService
      .getCompanyConversationUuidHandler$()
      .subscribe((conversationUuid: string) => {
        this._chatState.setConversationUuid(conversationUuid);
        this.conversationUuid = conversationUuid;
        this.destroyGetCompanyConversationUuidHandler$.unsubscribe();
      });
  }

  public updateConversationMessage(messageUuid: string, messageData: any) {
    this.destroyUpdateConversationMessageSubscription$ = this._chatService
      .updateConversationMessage(messageUuid, messageData)
      .pipe(take(1))
      .subscribe(() => {
        this.destroyUpdateConversationMessageSubscription$.unsubscribe();
      });
  }

  public setConversationUuid(uuid: string): void {
    this._chatState.setConversationUuid(uuid);
  }

  public emitMessageIsViewedFromCompanyHandler$(specialistUuid: string) {
    this._chatService.emitMessageIsViewedFromCompanyHandler$(this.lastMessageUuid, specialistUuid);
  }

  public destroyGetCompanyConversationUuidHandler(): void {
    this.destroyGetCompanyConversationUuidHandler$.unsubscribe();
  }

  public destroyGetMessageFromSpecialistToCompanyHandler() {
    this.destroyGetMessageFromSpecialistToCompanyHandler$.unsubscribe();
  }

  public destroyUpdateConversationMessageHandler() {
    this.destroyUpdateConversationMessageSubscription$.unsubscribe();
  }

  public acceptOrDeclineSpecialistRequest(status: string, uuid: string, reason?: string): Observable<ObjectType> {
    return this._chatService.acceptOrDeclineSpecialistRequest(status, uuid, reason);
  }

  public hideOtherSpecialistRequest(uuid: string, vacancyUuid: string): Observable<ObjectType> {
    return this._chatService.hideOtherSpecialistRequest(uuid, vacancyUuid);
  }
}
