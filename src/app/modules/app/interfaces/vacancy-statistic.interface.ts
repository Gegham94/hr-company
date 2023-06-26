export interface VacancyStatisticInterface {
  name: string;
  value: number;
}

export interface VacancyAnalytics {
  interviewStatus: string;
  count: number;
}

export interface AnalyticData {
  data: VacancyAnalytics[];
}
