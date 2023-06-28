export interface ISearchedSettings {
      country: string;
      city: string;
      employment?: string;
      programmingLanguages: string;
      vacancyLevel: string;
      programmingFrameworks: string;
      nativeLanguages: string[];
      wayOfWorking: string;
      workplace: string;
      questions?: string[];
}

export interface IAddVacancy {
  count:number;
  name: string;
  description: string;
  responsibility: string;
  conditions: string;
  deadlineDate: string;
  payedDate?: string;
  companyUuid?: string;
  status: string;
  searchedSettings: ISearchedSettings;
  createdAt?: string;
  deletedAt?: null;
  updatedAt?: string;
  date:string;
  uuid?: string;
  checked?: boolean;
  vacancyId?: string;
  result?: any ;
}
