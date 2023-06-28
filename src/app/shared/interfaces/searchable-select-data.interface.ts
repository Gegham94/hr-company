import {IFilterRecourseProgrammingLanguages} from "../../modules/vacancy/interfaces/filter-recourse.interface";
import {ICompanyInnItem} from "./company-inn.interface";

export type ISearchableSelectDataOrNullType = ISearchableSelectData | null;
export type StringOrNumberType = string | number;

export interface ISearchableSelectData {
  id: StringOrNumberType;
  value: string;
  displayName: string;
  count?: number;
  total?: number;
  innItem?:ICompanyInnItem;
  programmingLanguage?: IFilterRecourseProgrammingLanguages;
}
