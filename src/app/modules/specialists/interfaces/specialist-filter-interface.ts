export enum SpecialistInterviewStatusEnum {
  ACCEPTED = "accepted",
  FAVORITES = "favorites",
  REJECTED = "rejected",
  AWAITS = "awaits",
  SUCCESS = "success",
  FAILED = "failed",
  InProgress = "inProgress"
}

export interface SpecialistFilterInterface {
  status?: SpecialistInterviewStatusEnum;
  vacancyUuid?: string;
  take?: number;
  skip?: number;
  vacancyStatus?: boolean;
  orderSpecialistUuids?: string[];
}
