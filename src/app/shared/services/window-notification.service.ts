import {Injectable} from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class WindowNotificationService {

  public askPermission(): void {
    if ("Notification" in window) {
      Notification.requestPermission().then(r => {
      });
    }
  }

  public createNotification(lastMsg: string, notificationCount: number) {
    if ("Notification" in window) {
      if (lastMsg.length) {
        const notification = new Notification("У вас есть новое сообщение", {
          body: lastMsg,
        });
      }
      if (notificationCount) {
        document.title = `(${notificationCount}) HR-hunt`;
      } else {
        document.title = `HR-hunt`;
      }
    }
  }
}
