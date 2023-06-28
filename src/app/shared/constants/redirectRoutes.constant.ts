import {RoutesEnum} from "../enum/routes.enum";

export const RedirectUrls = [
  {
    0: RoutesEnum.company,
    1: RoutesEnum.company
  },
  {
    0: RoutesEnum.vacancyCreateFilter,
    1: RoutesEnum.company,
  },
  {
    0: RoutesEnum.vacancies,
    1: RoutesEnum.vacancyCreateFilter
  },
  {
    0: RoutesEnum.specialists,
    1: RoutesEnum.vacancies,
  },
  {
    0: RoutesEnum.balance,
    1: RoutesEnum.specialists
  },

  {
    0: RoutesEnum.analytic,
    1: RoutesEnum.specialists
  }
];
