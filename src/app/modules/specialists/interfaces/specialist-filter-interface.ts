import { SpecialistInterviewStatusEnum } from "../constants/interviev-status.enum";
export interface ISpecialistFilter {
  status?: SpecialistInterviewStatusEnum;
  vacancyUuid?: string;
  take?: number;
  skip?: number;
  vacancyStatus?: boolean;
  orderSpecialistUuids?: string[];
}
