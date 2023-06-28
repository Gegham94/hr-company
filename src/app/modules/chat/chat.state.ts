import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Conversation} from "./interfaces/conversations";
import {Message} from "./interfaces/messages";
import { BottomChatSettings } from "src/app/shared/services/chat-helper.service";

@Injectable({
  providedIn: "root",
})
export class ChatState {
  private chatPopupStatus$ = new BehaviorSubject<boolean>(false);
  private candidatePopupStatus$ = new BehaviorSubject<boolean>(false);
  private messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  private conversations$: BehaviorSubject<Conversation[]> = new BehaviorSubject<Conversation[]>([]);
  private selectedConversation$: BehaviorSubject<Conversation | null> = new BehaviorSubject<Conversation | null>(null);
  private isUnreadMessage$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private isAvailableAfterAcceptOrReject$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  private chatSettings$: BehaviorSubject<BottomChatSettings> = new BehaviorSubject<BottomChatSettings>({
    isOpen: false,
    isMessagesContent: false,
  });

  public setChatSettings(value: BottomChatSettings): void {
    this.chatSettings$.next(value);
  }

  public getChatSettings(): Observable<BottomChatSettings> {
    return this.chatSettings$;
  }

  public getIsAvailableAfterAcceptOrReject$(): Observable<boolean> {
    return this.isAvailableAfterAcceptOrReject$.asObservable();
  }

  public setIsAvailableAfterAcceptOrReject(value: boolean) {
    this.isAvailableAfterAcceptOrReject$.next(value);
  }

  public getConversations$(): Observable<Conversation[]> {
    return this.conversations$;
  }

  public getConversations(): Conversation[] {
    return this.conversations$.value;
  }

  public setConversations(conversation: Conversation[]): void {
    this.conversations$.next(conversation);
  }

  public getIsUnreadMessage$(): Observable<boolean> {
    return this.isUnreadMessage$;
  }

  public setIsUnreadMessage(value: boolean): void {
    this.isUnreadMessage$.next(value);
  }

  public getSelectedConversation$(): Observable<Conversation | null> {
    return this.selectedConversation$;
  }

  public setSelectedConversation$(conversation: Conversation | null): void {
    this.selectedConversation$.next(conversation);
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

  public getChatMessages$(): Observable<Message[]> {
    return this.messages$;
  }

  public setChatMessage(message: Message | Message[]): void {
    let currentValue = this.messages$.value;

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
}
