import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {GlobalChatNotificationItemInterface} from "../../../interfaces/global-chat-notification.interface";
import {Router} from "@angular/router";
import {SpecialistFacade} from "../../../../specialists/specialist.facade";

@Component({
  selector: "hr-chat-notification-item",
  templateUrl: "./chat-notification-item.component.html",
  styleUrls: ["./chat-notification-item.component.scss"]
})
export class ChatNotificationItemComponent implements OnInit {

  @Input("item") notificationItem!: GlobalChatNotificationItemInterface;
  @Input("hasNotificationCount") hasNotificationCount!: number;
  @Output() selectedNotification: EventEmitter<string> = new EventEmitter();

  public end = new Date();

  constructor(
    private readonly router: Router,
    private readonly _specialistsFacade: SpecialistFacade,
    ) {
  }

  public openNotificationChat(notUuid: string, uuid: string): void {
    this.router.navigate([`specialists/profile/`], {queryParams: {uuid: uuid, notification: true}});
    this._specialistsFacade.setIsNavigateFromNotifications$(true);
    this.selectedNotification.emit(notUuid);
  }

  ngOnInit(): void {
  }
}
