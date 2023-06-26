export interface SearchedSettings {
      country: string;
      city: string;
      employment?: string;
      programmingLanguages: string;
      vacancyLevel: string;
      programmingFrameworks: string;
      nativeLanguages: string[];
      wayOfWorking: string;
      workplace: string;
}

export interface AddVacancyInterface {
  count:number;
  name: string;
  description: string;
  responsibility: string;
  conditions: string;
  deadlineDate: string;
  companyUuid?: string;
  status: string;
  searchedSettings: SearchedSettings;
  createdAt?: string;
  deletedAt?: null;
  updatedAt?: string;
  date:string;
  uuid?: string;
  checked?: boolean;
  vacancyId?: string;
  result?: any ;
}
