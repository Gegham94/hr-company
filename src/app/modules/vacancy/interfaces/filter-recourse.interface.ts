import { ObjectType } from "src/app/shared/types/object.type";

export interface IFilterRecourseLocationCountries {
  key?: string;
  data?: IFilterRecourseLocationCountries[];
  total?: number;
}

export interface IFilterRecourseLocationCities {
  key?: string;
  data?: ObjectType;
  total?: number;
}

export interface IFilterRecourseProgrammingLanguages {
  uuid?: string;
  joinedName?: string;
  defaultName?: string;
  data?: IFilterRecourseProgrammingLanguages[];
  total?: number;
}

export interface IFilterRecourseProgrammingFrameworks {
  uuid?: string;
  joinedName?: string;
  defaultName?: string;
  programmingLanguageUuid?: string;
  programming_language?: IFilterRecourseProgrammingLanguages;
  data?: IFilterRecourseProgrammingFrameworks[];
  total?: number;
}
