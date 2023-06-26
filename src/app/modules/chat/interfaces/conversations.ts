export interface IConversation {
  last_message: IConversationLastMessage;
  other_info: IConversationOtherInfo;
  specialist: IConversationSpecialist;
  userOne: string;
  userTwo: string;
}

export interface IConversationLastMessage {
  conversationStatus: boolean;
  conversationUuid: string;
  createdAt: string;
  message: string;
  messageStatus: boolean;
  messageUuid: string;
  recipientUuid: string;
  senderUuid: string;
}

export interface IConversationOtherInfo {
  foundSpecialistUuid: string;
  name: string;
  vacancyUuid: string;
}

export interface IConversationSpecialist {
  image: string;
  name: string;
  surname: string;
  uuid: string;
}
