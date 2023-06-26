export interface VacancyInterface {
  name:string;
  uuid?: string;
  deadlineDate: string;
  createdAt?: string;
  status?: boolean | string;
  payedStatus: string;
  vacancyProgress?: number;
  payedDate?: string;
}
