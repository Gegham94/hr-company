import { ObjectType } from "src/app/shared-modules/types/object.type";

export interface FilterRecourseLocationCountries {
  key?: string;
  data?: FilterRecourseLocationCountries[];
  total?: number;
}

export interface FilterRecourseLocationCities {
  key?: string;
  data?: ObjectType;
  total?: number;
}

export interface FilterRecourseProgrammingLanguages {
  uuid?: string;
  joinedName?: string;
  defaultName?: string;
  data?: FilterRecourseProgrammingLanguages[];
  total?: number;
}

export interface FilterRecourseProgrammingFrameworks {
  uuid?: string;
  joinedName?: string;
  defaultName?: string;
  programmingLanguageUuid?: string;
  programming_language?: FilterRecourseProgrammingLanguages;
  data?: FilterRecourseProgrammingFrameworks[];
  total?: number;
}
