export type INotificationOrNull = INotifications | null;

export interface INotifications {
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

export interface IGlobalNotification {
  count: number;
  result: IGlobalNotificationItem[];
  unviewedCount: number;
}

export interface IGlobalNotificationItem {
  createdAt: Date;
  info: INotificationInfo;
  recipientUuid: string;
  type: string;
  updatedAt: Date;
  uuid: string;
  viewed: boolean;
}

export interface INotificationInfo {
  content: string;
  status?: boolean;
  vacancyInfo: INotificationItemInfo;
}

export interface INotificationItemInfo {
  deadlineDate: string | Date;
  paidDate?: string | Date;
  name?: string;
  uuid: string;
  notificationUuid?: string;
  notificationStatus?: boolean;
}
