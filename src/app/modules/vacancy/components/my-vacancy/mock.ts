import {SearchableSelectDataInterface} from "../../../app/interfaces/searchable-select-data.interface";

export const StatusList: SearchableSelectDataInterface[] = [
  {
    id: 1,
    value: "все",
    displayName: "Все"
  },
  {
    id: 2,
    value: "Завершенные",
    displayName: "Завершенные"
  },
  {
    id: 3,
    value: "Откритые",
    displayName: "Откритые"
  }
];

export const PayedStatusList: SearchableSelectDataInterface[] = [
  {
    id: 1,
    value: "все",
    displayName: "Все"
  },
  {
    id: 2,
    value: "оплачена",
    displayName: "Оплачена"
  },
  {
    id: 3,
    value: "Не оплачена",
    displayName: "Не оплачена"
  },
  {
    id: 4,
    value: "переоплатить",
    displayName: "Переоплатить"
  }
];
