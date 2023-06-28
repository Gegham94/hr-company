import {EChartsOption} from "echarts/types/dist/echarts";

export const AnalyticMock = [
  {
    accepted: {
      name: "Принятые приглашения"
    },
    success: {
      name: "Прошли собеседование"
    },
    rejected: {
      name: "Откланенные"
    },
    awaits: {
      name:  "Совподают по поиску"
    },
    inProgress: {
      name: "Ожидаем ответа"
    },
    failed: {
      name: "не удалось"
    },
  },
];

export let AnalyticsChartOptions: EChartsOption = {
  tooltip: {
    trigger: "item",
      formatter: "{b} : {c}"
  },
  series: [
    {
      name: "Access From",
      type: "pie",
      radius: "68%",
      itemStyle: {
        borderColor: "white",
        borderWidth: 2
      },
      data: [],
      label: {
        formatter: "{d}%",
        edgeDistance: 1,
        lineHeight: 1,
        fontWeight: 500
      },
      labelLine: {
        length: 4,
        length2: 4,
      },
    }
  ],
    animation: false,
    color: ["#008FFB", "#3BD252", "#FF4560", "#775DD0", "#FEB019", "brown"]
};
