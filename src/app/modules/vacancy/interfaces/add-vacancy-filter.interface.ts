import { AddVacancyInterface } from "../../app/interfaces/add-vacancy.interface";

export interface AddVacancyFilterInterface {
  vacancyCountry: string;
  vacancyCity: string;
  vacancyProgrammingLanguage: string[];
  vacancyProgrammingFrame: string[];
  vacancyLevel: string;
  vacancyEmployment: string;
  vacancyLanguage: string[];
  vacancyTypeEmployment: string;
}

export type AddVacancyInterfaceOrNull = AddVacancyInterface | null;
