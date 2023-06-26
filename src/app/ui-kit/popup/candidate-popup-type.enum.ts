export enum CandidatePopupTypeEnum {
  CANDIDATE = "candidate",
  CANDIDATE_RESULT = "candidateResults",
  CANDIDATE_INFO = "catInfo",
  ACCEPT_CANDIDATE = "acceptCandidate",
  COMPLETED= "completed",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export enum ReasonsOfResignEnum {
  Reason_1 = "Reason 1",
  Reason_2 = "Reason 2",
  Reason_3 = "Reason 3",
  Reason_4 = "Reason 4",
  Reason_5 = "Others",
}

export interface Reason {
  value: string;
  id: number;
  checked: boolean;
}
