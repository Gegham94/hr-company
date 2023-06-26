import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {ChatHelper, ChatHelperInterface} from "../interfaces/chat-helper.interface";


export interface BottomChatSettings {
  isOpen: boolean;
  isMessagesContent: boolean;
  isConversationNeedSort?: boolean;
}

@Injectable({
  providedIn: "root"
})
export class ChatHelperService {

  public chat$: BehaviorSubject<ChatHelper> = new BehaviorSubject<ChatHelper>(null);

  public isBottomChatOpen$: BehaviorSubject<BottomChatSettings> = new BehaviorSubject<BottomChatSettings>({
    isOpen: false,
    isMessagesContent: false,
    isConversationNeedSort: true
  });

  constructor() {
  }

  public setChatSettings(settings: ChatHelperInterface): void {
    this.chat$.next(settings);
  }

  public getChatSettings(): Observable<ChatHelper> {
    return this.chat$;
  }

  public setIsBottomChatOpen(value: BottomChatSettings): void {
    this.isBottomChatOpen$.next(value);
  }

  public getIsBottomChatOpen(): Observable<BottomChatSettings> {
    return this.isBottomChatOpen$;
  }


}
