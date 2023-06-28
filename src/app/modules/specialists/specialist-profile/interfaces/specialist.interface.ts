import { IRejectedOrAccepted } from "../../interfaces/specialist-test.interface";
import {IQuestionAnswerList} from "../analytics/interfaces/tests.interface";

export interface ISpecialist {
  citizenship: string;
  city: string;
  country: string;
  createdAt: string;
  dateOfBirth: string;
  educations: string;
  email: string;
  emailVerifiedAt: string;
  employment: string;
  experiences: string;
  test_answers: IQuestionAnswerList[];
  found_specialist_for_company_rejected?: IRejectedOrAccepted[];
  found_specialist_for_company_succeed?: IRejectedOrAccepted[];
  gender: string;
  image: string;
  image_blured: string;
  languages: string;
  languagesFrameworksArray: string;
  languagesFrameworksForSelect: string;
  languagesFrameworksObjects: string;
  name: string;
  oldProfile: null;
  phone: string;
  position: string;
  remember_token: boolean | null;
  salary: string;
  skype: string;
  surname: string;
  telegram: string;
  uniqueKey: string;
  updatedAt: string;
  uuid: string;
  whatsApp: null;
  workspace: string;
}

export interface ICandidatesModal {
  isHelper: boolean;
  specialist: {
    name: string;
    surname: string;
    vacancy: string;
  };
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
