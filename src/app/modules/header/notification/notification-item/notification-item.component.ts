import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {IGlobalNotificationItem} from "../../interfaces/notifications.interface";

@Component({
  selector: "hr-notification-item",
  templateUrl: "./notification-item.component.html",
  styleUrls: ["./notification-item.component.scss"]
})
export class NotificationItemComponent implements OnInit{
  @Input("item") notificationItem!: IGlobalNotificationItem;
  @Input("hasNotification") hasNotification!: number;
  
  @Output() selectedNotification: EventEmitter<string> = new EventEmitter();
  public end = new Date();

  public selectNotification(uuid: string): void {
    this.selectedNotification.emit(uuid);
  }

  ngOnInit(): void {}
}
