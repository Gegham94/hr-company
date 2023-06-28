import {IQuestionAnswerList, IRejectedOrAccepted} from "./specialist-test.interface";

//TODO: delete
export interface Specialist {
  about?: null;
  busyStatus?: string;
  country?: string;
  city?: string;
  phone?: string;
  contacts?: string;
  createdAt: string;
  deletedAt: null;
  developerContacts?: null;
  email?: string;
  feedback?: null;
  firstName?: string;
  frameworks?: null;
  lastName?: string;
  lastVisited?: null;
  level?: null;
  nativeLanguage?: null;
  negativeFeedbackCount?: null;
  parsedId?: null;
  parsedIn?: null;
  password: string;
  positiveFeedbackCount?: null;
  profession?: null;
  profileLink?: null;
  programmingLanguages?: null;
  skills?: [];
  typeOfEmployment?: null;
  updatedAt?: string;
  uuid: string;
  wasRegistration?: null;
  workspace?: string;
  citizenship?: string;
  employment?: string;
  image?: string;
  image_blured?: string;
  name?: string;
  surname?: string;
  test_answers?: IQuestionAnswerList[];
  found_specialist_for_company_rejected?: IRejectedOrAccepted[];
  found_specialist_for_company_succeed?: IRejectedOrAccepted[];
}

export interface FilteredSpecialistsListRequest {
  count: number;
  result: FilteredSpecialistsListResult[];
}

export interface FilteredSpecialistsListResult {
  availableSpecialist: boolean;
  interviewStatus: string;
  newSpecialist: boolean;
  specialistAcceptedDate: string;
  specialistCity: string;
  specialistCountry: string;
  specialistEmail?: string;
  specialistEmployment: string;
  specialistExperiences: Experiences[];
  specialistName: string;
  specialistSurname: string;
  specialistUuid: string;
  specialistWorkspace: string;
  uuid: string;
  vacancyDescription: string;
  vacancyName: string;
  vacancyUuid: string;
  specialistAnalytic: { [key: string]: SpecialistAnalytic };
}

export interface Experiences {
  company: string;
  position: string;
  quit_date: string;
  accept_date: string;
}

export interface SpecialistAnalytic {
  correctAnswerCount: number;
  point: number;
  wrongAnswerCount: number;
}
