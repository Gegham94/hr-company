import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {MessageInterface} from "./chat.component";
import {IConversation} from "./interfaces/conversations";

@Injectable({
  providedIn: "root",
})
export class ChatState {
  private chatPopupStatus$ = new BehaviorSubject<boolean>(false);
  private candidatePopupStatus$ = new BehaviorSubject<boolean>(false);
  private acceptOrDeclinePopupStatus$ = new BehaviorSubject<boolean>(false);
  private messages$: BehaviorSubject<MessageInterface[]> = new BehaviorSubject<MessageInterface[]>([]);
  private conversationUuid$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private notification$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private conversations$: BehaviorSubject<IConversation[]> = new BehaviorSubject<IConversation[]>([]);
  private conversation$: BehaviorSubject<IConversation | null> = new BehaviorSubject<IConversation | null>(null);
  private unreadMessagesCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  private isUnreadMessage$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private isAvailableAfterAcceptOrReject$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  public getIsAvailableAfterAcceptOrReject$(): Observable<boolean> {
    return this.isAvailableAfterAcceptOrReject$.asObservable();
  }

  public setIsAvailableAfterAcceptOrReject(value: boolean) {
    this.isAvailableAfterAcceptOrReject$.next(value);
  }

  public getConversations$() {
    return this.conversations$;
  }

  public getConversations() {
    return this.conversations$.value;
  }

  public setConversations(conversation: IConversation[]): void {
    this.conversations$.next(conversation);
  }

  public getIsUnreadMessage$() {
    return this.isUnreadMessage$;
  }

  public setIsUnreadMessage(value: boolean): void {
    this.isUnreadMessage$.next(value);
  }

  public getConversation$() {
    return this.conversation$;
  }

  public setConversation(conversation: IConversation | null): void {
    this.conversation$.next(conversation);
  }

  public getUnreadMessagesCount$(): Observable<number> {
    return this.unreadMessagesCount$.asObservable();
  }

  public setUnreadMessagesCount$(count: number): void {
    this.unreadMessagesCount$.next(count);
  }

  public getChatPopupStatus$(): Observable<boolean> {
    return this.chatPopupStatus$.asObservable();
  }

  public setChatPopupStatus(isVisible: boolean): void {
    this.chatPopupStatus$.next(isVisible);
  }

  public getCandidatesPopupStatus$(): Observable<boolean> {
    return this.candidatePopupStatus$;
  }

  public setCandidatesPopupStatus(isVisible: boolean): void {
    this.candidatePopupStatus$.next(isVisible);
  }

  public getAcceptOrDeclinePopupStatus$(): Observable<boolean> {
    return this.acceptOrDeclinePopupStatus$.asObservable();
  }

  public setAcceptOrDeclinePopupStatus$(isVisible: boolean): void {
    this.acceptOrDeclinePopupStatus$.next(isVisible);
  }

  public getChatMessages$(): Observable<MessageInterface[]> {
    return this.messages$.asObservable();
  }

  public setChatMessage(message: MessageInterface | MessageInterface[]): void {
    let currentValue = this.messages$.getValue();

    if (Array.isArray(message)) {
      currentValue = [...message];
      this.messages$.next(currentValue);
      return;
    }

    currentValue.push(message);
    this.messages$.next(currentValue);
  }

  public clearMessages(): void {
    this.messages$.next([]);
  }

  public getConversationUuid$(): Observable<string> {
    return this.conversationUuid$.asObservable();
  }

  public setConversationUuid(conversationUuid: string): void {
    this.conversationUuid$.next(conversationUuid);
  }

  public updateConversationStatus(conversationUuid: string, status: boolean): void {
    const conversations = this.conversations$.getValue();
    const findValue = conversations.find((el: IConversation) => el.last_message.conversationUuid === conversationUuid);
    if (findValue) {
      findValue.last_message.messageStatus = status;
    }
  }

  public getNotification$(): Observable<string> {
    return this.notification$.asObservable();
  }

  public setNotification(notification: any): void {
    this.notification$.next(notification);
  }
}
