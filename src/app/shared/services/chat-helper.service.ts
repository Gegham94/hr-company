import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

export interface BottomChatSettings {
  isOpen: boolean;
  isMessagesContent: boolean;
}

@Injectable({
  providedIn: "root"
})
export class ChatHelperService {
  public isBottomChatOpen$: BehaviorSubject<BottomChatSettings> = new BehaviorSubject<BottomChatSettings>({
    isOpen: false,
    isMessagesContent: false,
  });

  constructor() {
  }

  public setIsBottomChatOpen(value: BottomChatSettings): void {
    this.isBottomChatOpen$.next(value);
  }

  public getIsBottomChatOpen(): Observable<BottomChatSettings> {
    return this.isBottomChatOpen$;
  }


}
