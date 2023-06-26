export interface GlobalChatNotificationInterface {
  count: number;
  result: GlobalChatNotificationItemInterface[];
}

export interface GlobalChatNotificationItemInterface {
  createdAt: Date;
  info: NotificationChatInfo;
  message: string;
  recipientUuid: string;
  status: boolean;
  updatedAt: Date;
  uuid: string;
  senderUuid: string;
}

export interface NotificationChatInfo {
  image: string;
  name: string;
  surname: string;
  uuid: string;
}
