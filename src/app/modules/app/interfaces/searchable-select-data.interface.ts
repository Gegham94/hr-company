import {FilterRecourseProgrammingLanguages} from "../../vacancy/interfaces/filter-recourse.interface";
import {CompanyInnItemInterface} from "./company-inn.interface";

export type SearchableSelectDataInterfaceOrNull = SearchableSelectDataInterface | null;
export type StringOrNumber = string | number;

export interface SearchableSelectDataInterface {
  id: StringOrNumber;
  value: string;
  displayName: string;
  count?: number;
  total?: number;
  innItem?:CompanyInnItemInterface;
  programmingLanguage?: FilterRecourseProgrammingLanguages;
}
