export enum CandidatePopupTypeEnum {
  CANDIDATE = "candidate",
  COMPLETED= "completed",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export enum ReasonsOfDeclineEnum {
  Reason_1 = "Reason 1",
  Reason_2 = "Reason 2",
  Reason_3 = "Reason 3",
  Reason_4 = "Reason 4",
  Reason_5 = "Others",
}

export interface IReason {
  value: string;
  id: number;
  checked: boolean;
}
