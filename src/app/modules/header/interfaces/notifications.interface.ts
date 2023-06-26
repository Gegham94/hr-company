export type NotificationOrNull = Notifications | null;

export interface Notifications {
  count: number;
  notificationData: NotificationItem[];
}

export interface NotificationItem {
  logo: string | null;
  fullName: string;
  description?: string;
  message?: string;
  date: Date;
  status: boolean;
}


export interface GlobalNotification {
  count: number;
  result: GlobalNotificationItem[];
  unviewedCount: number;
}

export interface GlobalNotificationItem {
  createdAt: Date;
  info: NotificationInfo;
  recipientUuid: string;
  type: string;
  updatedAt: Date;
  uuid: string;
  viewed: boolean;
}

export interface NotificationInfo {
  content: string;
  status?: boolean;
  vacancyInfo: NotificationItemInfo;
}

export interface NotificationItemInfo {
  deadlineDate: string | Date;
  name?: string;
  uuid: string;
  notificationUuid?: string;
  notificationStatus?: boolean;
}
