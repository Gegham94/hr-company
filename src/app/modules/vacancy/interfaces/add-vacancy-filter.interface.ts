import { IAddVacancy } from "../../../shared/interfaces/add-vacancy.interface";

export interface IAddVacancyFilter {
  vacancyCountry: string;
  vacancyCity: string;
  vacancyProgrammingLanguage: string[];
  vacancyProgrammingFrame: string[];
  vacancyLevel: string;
  vacancyEmployment: string;
  vacancyLanguage: string[];
  vacancyTypeEmployment: string;
}

export type IAddVacancyOrNullType = IAddVacancy | null;
