export interface IMessage {
  message: string;
  messageStatus?: boolean;
  senderUuid?: string;
  senderFirstName?: string;
  senderLastName?: string;
  specialistImage?: string;
  recipientUuid: string;
  conversationUuid: string;
  senderLogo: string;
  role: string;
  uuid: string;
  createdAt: Date | string;
}

export class Message implements IMessage {
  message!: string;
  messageStatus!: boolean;
  senderUuid!: string;
  senderFirstName!: string;
  senderLastName!: string;
  recipientUuid!: string;
  specialistImage!: string;
  conversationUuid!: string;
  senderLogo!: string;
  role!: string;
  uuid!: string;
  createdAt!: Date | string;
  isMyMessage!:boolean;

  constructor(message: IMessage) {
    Object.assign(this, message);
  }

  setPosition(isMyMessage: boolean): this {
    this.isMyMessage = isMyMessage;
    return this;
  }
}
