import {EChartsOption} from "echarts/types/dist/echarts";

export interface IVacancyStatistics {
  name: string;
  value: number;
}

export interface IAnalyticDataItem {
  interviewStatus: string;
  count: number;
}

export interface IAnalyticData {
  data: IAnalyticDataItem[];
}

export interface ISelectedVacancy {
  name: string;
  deadlineDate: string;
  payedStatus: string;
}

export interface IAnalytics {
  selectedVacancy: ISelectedVacancy;
  analyticsChartOptions: EChartsOption;
  vacancyStatisticList: IVacancyStatistics[];
  totalCandidates: number;
}
