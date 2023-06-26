import {Injectable} from "@angular/core";
import {ChatSocketService} from "./chat-socket.service";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private socket!: ChatSocketService;

  public setSocket(token: string) {
    this.socket = new ChatSocketService(token);
  }

  public getSocket(): ChatSocketService {
    return this.socket;
  }
}
