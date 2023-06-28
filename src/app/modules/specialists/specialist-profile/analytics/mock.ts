import {EChartsOption} from "echarts/types/dist/echarts";

export let SpecialistAnalyticsOptions = (percentages: number[]): EChartsOption => {
  return {
    tooltip: {
      trigger: "item",
        formatter: (param: any) => {
        return ` <span style="display:inline-block;
                      margin-left:5px;border-radius:10px;
                      width:9px;height:9px;
                      background-color:${param.color};"></span>
                      ${param.seriesName} - ${param.value} %`;
      }
    },
    xAxis: {
      data: ["Собеседование", "Тест компилятора", "Теоретически тест"],
    },
    yAxis: {
      type: "value",
    },
    legend: {
      data: ["Проваленные вопросы"]
    },
    title: {
      subtext: "в процентах"
    },
    series: [
      {
        name: "Пройденные тесты",
        type: "bar",
        stack: "total",
        label: {
          show: true
        },
        emphasis: {
          focus: "series"
        },
        data: [40, 30, 50],
        itemStyle: {
          color: function(params) {
            const colorList = ["#33bb47", "#008FFB", "#FF4560"];
            return colorList[params.dataIndex];
          }
        }
      },
      {
        name: "Проваленные вопросы",
        type: "bar",
        stack: "total",
        label: {
          show: true
        },
        color: ["#b8b8b8"],

        emphasis: {
          focus: "series"
        },
        data: percentages
      },
    ],
      animation: true,
  };
};

export const PassedTestsPercentages = {
  interview: {
    point: "0",
      testsCount: 0,
  },
  programming: {
    point: "0",
      testsCount: 0,
  },
  psychologic: {
    point: "0",
      testsCount: 0,
  },
};
