export interface IMyVacancyFilter {
  name_query?: string;
  from?: string;
  to?: string;
  status?: boolean;
  payedStatus?: string;
  take?: number;
  skip?: number;
}
