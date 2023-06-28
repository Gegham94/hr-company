import {LanguagesEnum} from "./constants/languages.enum";
import {ISearchableSelectData} from "../../shared/interfaces/searchable-select-data.interface";
import {EmploymentTypeEnum} from "./constants/employment-type.enum";
import {LevelEnum, ProgrammingLevelEnum} from "./constants/programming-level.enum";
import {WorkplaceEnum} from "./constants/workplace.enum";


export const languages: ISearchableSelectData[] = [
  {
    id: 1,
    value: LanguagesEnum.english,
    displayName: LanguagesEnum.english
  },
  {
    id: 2,
    value: LanguagesEnum.russian,
    displayName: LanguagesEnum.russian
  }
];

export const employmentTypes: ISearchableSelectData[] = [
  {
    id: 1,
    value: EmploymentTypeEnum.fullTime,
    displayName: EmploymentTypeEnum.fullTime
  },
  {
    id: 2,
    value: EmploymentTypeEnum.partTime,
    displayName: EmploymentTypeEnum.partTime
  },
  {
    id: 3,
    value: EmploymentTypeEnum.remote,
    displayName: EmploymentTypeEnum.remote
  }
];

export const programmingLevels: ISearchableSelectData[] = [
  {
    id: 1,
    value: LevelEnum.INTERN,
    displayName: ProgrammingLevelEnum.intern
  },
  {
    id: 2,
    value: LevelEnum.JUNIOR,
    displayName: ProgrammingLevelEnum.junior
  },
  {
    id: 3,
    value: LevelEnum.MIDDLE,
    displayName: ProgrammingLevelEnum.middle
  },
  {
    id: 4,
    value: LevelEnum.SENIOR,
    displayName: ProgrammingLevelEnum.senior
  },
  {
    id: 5,
    value: LevelEnum.LEAD,
    displayName: ProgrammingLevelEnum.lead
  }
];

export const workplace: ISearchableSelectData[] = [
  {
    id: 1,
    value: WorkplaceEnum.fromOffice,
    displayName: WorkplaceEnum.fromOffice
  },
  {
    id: 2,
    value: WorkplaceEnum.remote,
    displayName: WorkplaceEnum.remote
  },
  {
    id: 3,
    value: WorkplaceEnum.hybrid,
    displayName: WorkplaceEnum.hybrid
  }
];
export const price: ISearchableSelectData[] = [
  {id: 0, value: "EUR", displayName: "EUR"},
  {id: 1, value: "RUB", displayName: "RUB"},
  {id: 2, value: "USD", displayName: "USD"}
];
